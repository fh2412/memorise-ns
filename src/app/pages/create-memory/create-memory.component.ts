import {
  ChangeDetectionStrategy, Component, PLATFORM_ID, Signal, computed, effect, inject, signal, untracked,
} from '@angular/core';
import { Location, isPlatformBrowser } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom, map, startWith } from 'rxjs';

import { BackButtonComponent } from '@components/back-button/back-button.component';
import { PhotoPickerComponent } from '@components/photo-picker/photo-picker.component';
import { CrewSelectorComponent } from '@components/crew-selector/crew-selector.component';
import { ChooseLocationComponent } from '@components/_dialogs/choose-location/choose-location.component';
import { MemoryService } from '@services/memory.service';
import { UploadQueueService } from '@services/upload-queue.service';
import { PhotoMetadataService } from '@services/photo-metadata.service';
import { BillingService } from '@services/billing.service';
import { UserService } from '@services/userService';
import { ActivityService } from '@services/activity.service';
import { CountryService } from '@services/restCountries.service';
import { GeocodingService } from '@services/geocoding.service';
import { pastDateValidator } from '@guards/validators';
import { CrewMember } from '@models/userInterface.model';
import { ParsedLocation } from '@models/geocoder-response.model';
import { PhotoInsights } from '@models/photo-metadata.model';
import { PickedPhoto, isReadyPhoto } from '@models/photo-upload.model';
import { describeCreateMemoryError } from '../../utils/memory-create.mapper';
import { formatBytes } from '../../utils/format-bytes';
import {
  FormSnapshot, SelectedLocation, applicableSuggestions, buildCreateRequest,
  hasSuggestions, placeLabel,
} from './create-memory.helpers';
import { formatDateRange } from 'app/utils/memory-dates';

const memoryDetailRoute = (memoryId: number) => ['/memory', memoryId];

/** "No activity" row – same value the old flow and plan-crew use. */
const NO_ACTIVITY_ID = 1;
const FALLBACK_MAP_CENTER = { lat: 48.2082, long: 16.3738 }; // Vienna
const INSIGHTS_DEBOUNCE_MS = 400;

@Component({
  selector: 'app-create-memory',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BackButtonComponent,
    PhotoPickerComponent,
    CrewSelectorComponent,
  ],
  templateUrl: './create-memory.component.html',
  styleUrl: './create-memory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateMemoryComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);
  private readonly ngLocation = inject(Location);
  private readonly dialog = inject(MatDialog);
  private readonly memoryService = inject(MemoryService);
  private readonly uploadQueue = inject(UploadQueueService);
  private readonly photoMetadata = inject(PhotoMetadataService);
  private readonly billing = inject(BillingService);
  private readonly userService = inject(UserService);
  private readonly activityService = inject(ActivityService);
  private readonly countryService = inject(CountryService);
  private readonly geocoding = inject(GeocodingService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** One id per page visit → retries never create a second memory. */
  private readonly requestId = crypto.randomUUID();

  protected readonly today = new Date();
  protected readonly placeLabel = placeLabel;
  protected readonly formatDateRange = formatDateRange;
  protected readonly formatBytes = formatBytes;

  // ── Form ─────────────────────────────────────────────────────────────────

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', Validators.maxLength(5000)],
    dates: this.fb.group({
      start: this.fb.control<Date | null>(null, [Validators.required, pastDateValidator()]),
      end: this.fb.control<Date | null>(null, pastDateValidator()),
    }),
  });

  private readonly formState = toSignal(
    this.form.events.pipe(
      map(() => this.snapshot()),
      startWith(this.snapshot()),
    ),
    { requireSync: true },
  ) as Signal<FormSnapshot & { valid: boolean }>;

  // ── State ────────────────────────────────────────────────────────────────

  protected readonly photos = signal<PickedPhoto[]>([]);
  protected readonly coverId = signal<string | null>(null);
  protected readonly crew = signal<CrewMember[]>([]);
  protected readonly selectedLocation = signal<SelectedLocation | null>(null);
  protected readonly activityId = signal<number | null>(null);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly hasActivity = computed(() => this.activityId() !== null);
  protected readonly readyPhotos = computed(() => this.photos().filter(isReadyPhoto));
  protected readonly processing = computed(() => this.photos().some(p => p.status === 'processing'));
  protected readonly uploadBytes = computed(() =>
    this.readyPhotos().reduce((sum, p) => sum + p.file.size + p.thumbnail.size, 0),
  );
  protected readonly remainingBytes = this.billing.remainingBytes;
  protected readonly exceedsStorage = computed(() => this.uploadBytes() > this.remainingBytes());

  protected readonly canCreate = computed(() =>
    !this.saving() && !this.processing() && !this.exceedsStorage(),
  );

  // ── Photo insights ───────────────────────────────────────────────────────

  /** null while photos are still being processed → analyse once everything is ready. */
  private readonly insightsKey = computed(() =>
    this.processing() ? null : this.readyPhotos().map(p => p.id).join(','),
  );
  private readonly insights = signal<{ key: string; data: PhotoInsights } | null>(null);
  private readonly dismissedKey = signal<string | null>(null);
  protected readonly analyzing = signal(false);

  protected readonly suggestions = computed(() => {
    const current = this.insights();
    if (!current || current.key === this.dismissedKey()) return null;
    const s = applicableSuggestions(current.data, this.formState(), this.selectedLocation());
    if (this.hasActivity()) s.location = null;
    return hasSuggestions(s) ? s : null;
  });

  constructor() {
    effect(onCleanup => {
      const key = this.insightsKey();
      if (key === null) return;
      if (key === '') {
        this.insights.set(null);
        return;
      }

      const photos = untracked(this.readyPhotos);
      let canceled = false;
      const timer = setTimeout(async () => {
        this.analyzing.set(true);
        try {
          const data = await this.photoMetadata.analyze(photos);
          if (!canceled) this.insights.set({ key, data });
        } finally {
          if (!canceled) this.analyzing.set(false);
        }
      }, INSIGHTS_DEBOUNCE_MS);

      onCleanup(() => {
        canceled = true;
        clearTimeout(timer);
        this.analyzing.set(false);
      });
    });

    void this.initFromActivity();
  }

  // ── Suggestions ──────────────────────────────────────────────────────────

  protected applySuggestions(): void {
    const s = this.suggestions();
    if (!s) return;

    // setValue() keeps the controls pristine → a later photo batch may update them again.
    if (s.title) this.form.controls.title.setValue(s.title);
    if (s.dateRange) this.form.controls.dates.setValue({ start: s.dateRange.start, end: s.dateRange.end });
    if (s.location) this.selectedLocation.set(s.location);
  }

  protected ignoreSuggestions(): void {
    this.dismissedKey.set(this.insights()?.key ?? null);
  }

  // ── Location ─────────────────────────────────────────────────────────────

  protected async chooseOnMap(): Promise<void> {
    const center = await this.mapCenter();
    const ref = this.dialog.open(ChooseLocationComponent, {
      data: center,
      width: 'min(720px, 100vw)',
      maxWidth: '100vw',
    });

    const result = await firstValueFrom(ref.afterClosed()) as
      { parsedLocation?: ParsedLocation; markerPosition?: { lat: number; lng: number } } | undefined;
    if (!result?.markerPosition) return; // closed without picking a point

    this.selectedLocation.set({
      lat: round4(result.markerPosition.lat),
      lng: round4(result.markerPosition.lng),
      city: result.parsedLocation?.city ?? '',
      country: result.parsedLocation?.country ?? '',
      countryCode: result.parsedLocation?.countryCode ?? '',
      source: 'map',
    });
  }

  protected clearLocation(): void {
    this.selectedLocation.set(null);
  }

  private async mapCenter(): Promise<{ lat: number; long: number }> {
    const current = this.selectedLocation() ?? this.insights()?.data.location?.markerPosition;
    if (current) return { lat: current.lat, long: current.lng };

    const userId = this.userService.getLoggedInUserId();
    if (!userId) return FALLBACK_MAP_CENTER;
    try {
      const coords = await firstValueFrom(this.countryService.getCountryGeocordsByUserId(userId));
      return coords?.[0] ? { lat: coords[0].lat, long: coords[0].long } : FALLBACK_MAP_CENTER;
    } catch {
      return FALLBACK_MAP_CENTER;
    }
  }

  /** Opened from an activity: fixed location + prefilled description. */
  private async initFromActivity(): Promise<void> {
    if (!this.isBrowser) return;
    const state = this.ngLocation.getState() as { activityId?: number } | null;
    const activityId = Number(state?.activityId);
    if (!activityId || activityId === NO_ACTIVITY_ID) return;

    this.activityId.set(activityId);
    try {
      const activity = await firstValueFrom(this.activityService.getActivityDetails(activityId));
      const loc = activity?.location;
      if (loc?.location_id) {
        const position = { lat: Number(loc.latitude), lng: Number(loc.longitude) };
        this.selectedLocation.set({
          ...position, city: '', country: '', countryCode: '',
          source: 'activity', locationId: Number(loc.location_id),
        });
        // Display name only – the existing location row is reused as-is.
        const parsed = await this.geocoding.reverseGeocode(position);
        if (parsed) {
          this.selectedLocation.update(l => l?.source === 'activity' ? { ...l, ...parsed } : l);
        }
      }
      const description = this.form.controls.description;
      if (activity?.description && !description.value) description.setValue(activity.description);
    } catch (err) {
      console.error('Loading activity failed:', err);
    }
  }

  // ── Create ───────────────────────────────────────────────────────────────

  protected async create(): Promise<void> {
    if (!this.canCreate()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const userId = this.userService.getLoggedInUserId();
    if (!userId) {
      this.error.set('Your session expired. Please sign in again.');
      return;
    }

    const photos = this.readyPhotos();
    const bytes = this.uploadBytes();
    const { title, description, dates } = this.form.getRawValue();

    this.saving.set(true);
    this.error.set(null);

    try {
      const result = await firstValueFrom(this.memoryService.create(buildCreateRequest({
        requestId: this.requestId,
        title,
        description,
        start: dates.start,
        end: dates.end,
        location: this.selectedLocation(),
        activityId: this.activityId(),
        crew: this.crew(),
        currentUserId: userId,
        upload: photos.length > 0 ? { fileCount: photos.length, bytes } : null,
      })));

      if (photos.length > 0) {
        const memoryId = String(result.memoryId);
        let sessionId = result.uploadSessionId;
        if (result.storageUsedBytes !== null) this.billing.setStorageUsedBytes(result.storageUsedBytes);

        // Replayed request whose session already expired → open a new one.
        if (!sessionId) {
          const session = await firstValueFrom(
            this.memoryService.createUploadSession(memoryId, { expectedFileCount: photos.length, expectedBytes: bytes }),
          );
          sessionId = session.uploadSessionId;
          this.billing.setStorageUsedBytes(session.storageUsedBytes);
        }

        this.uploadQueue.enqueue({
          memoryId,
          uploadSessionId: sessionId,
          userId,
          photos,
          coverPhotoId: this.coverId() ?? photos[0].id,
        });
      }

      await this.router.navigate(memoryDetailRoute(result.memoryId), { replaceUrl: true });
    } catch (err) {
      // Safe to click again: same requestId → the backend returns the memory created before.
      this.error.set(describeCreateMemoryError(err));
    } finally {
      this.saving.set(false);
    }
  }

  protected cancel(): void {
    this.ngLocation.back();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private snapshot(): FormSnapshot & { valid: boolean } {
    const { title, dates } = this.form.controls;
    return {
      title: title.value,
      titlePristine: title.pristine,
      start: dates.controls.start.value,
      end: dates.controls.end.value,
      datesPristine: dates.pristine,
      valid: this.form.valid,
    };
  }
}

function round4(value: number): number {
  return Math.round(value * 1e4) / 1e4;
}
