import {
  ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { firstValueFrom, map, startWith } from 'rxjs';

import { BackButtonComponent } from '@components/back-button/back-button.component';
import { CrewSelectorComponent } from '@components/crew-selector/crew-selector.component';
import { MemoryAddPhotosComponent } from '@components/memory-add-photos/memory-add-photos.component';
import { ChooseLocationComponent } from '@components/_dialogs/choose-location/choose-location.component';
import { ConfirmDialogComponent } from '@components/_dialogs/confirm-dialog/confirm-dialog.component';
import { MemoryService } from '@services/memory.service';
import { UserService } from '@services/userService';
import { LocationService } from '@services/location.service';
import { PinnedMemoryService } from '@services/pinnedMemorService';
import { FileUploadService } from '@services/file-upload.service';
import { pastDateValidator } from '@guards/validators';
import { Memory } from '@models/memoryInterface.model';
import { CrewMember } from '@models/userInterface.model';
import { ParsedLocation } from '@models/geocoder-response.model';
import { NO_LOCATION_ID } from '@models/memory-constants';
import { parseMemoryDate } from '../../utils/memory-dates';
import { PageState, pageStateForError } from '../memory-detail/memory-detail.helpers';
import { SelectedLocation, placeLabel } from '../create-memory/create-memory.helpers';
import {
  buildUpdateRequest, crewSignature, describeEditError, friendToCrewMember, placeholderToCrewMember,
} from './editmemory.helpers';

const FALLBACK_MAP_CENTER = { lat: 48.2082, long: 16.3738 }; // Vienna

@Component({
  selector: 'app-editmemory',
  templateUrl: './editmemory.component.html',
  styleUrl: './editmemory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CdkTextareaAutosize,
    BackButtonComponent,
    CrewSelectorComponent,
    MemoryAddPhotosComponent,
  ],
})
export class EditmemoryComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly memoryService = inject(MemoryService);
  private readonly userService = inject(UserService);
  private readonly locationService = inject(LocationService);
  private readonly pinnedService = inject(PinnedMemoryService);
  private readonly fileUpload = inject(FileUploadService);

  protected readonly today = new Date();
  protected readonly placeLabel = placeLabel;
  protected readonly me = this.userService.getLoggedInUserId();

  // ── Route ────────────────────────────────────────────────────────────────

  private readonly params = toSignal(this.route.paramMap, { requireSync: true });
  protected readonly memoryId = computed(() => Number(this.params().get('id')));
  protected readonly memoryIdText = computed(() => String(this.memoryId()));

  // ── Form ─────────────────────────────────────────────────────────────────

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', Validators.maxLength(5000)],
    dates: this.fb.group({
      start: this.fb.control<Date | null>(null, [Validators.required, pastDateValidator()]),
      end: this.fb.control<Date | null>(null, pastDateValidator()),
    }),
  });

  private readonly formStatus = toSignal(
    this.form.events.pipe(
      map(() => ({ dirty: this.form.dirty, valid: this.form.valid })),
      startWith({ dirty: false, valid: this.form.valid }),
    ),
    { requireSync: true },
  );

  // ── State ────────────────────────────────────────────────────────────────

  protected readonly state = signal<PageState>('loading');
  protected readonly memory = signal<Memory | null>(null);

  protected readonly crew = signal<CrewMember[]>([]);
  protected readonly crewState = signal<'loading' | 'ready' | 'error'>('loading');
  private readonly initialCrew = signal('');
  private readonly existingPlaceholderIds = signal<ReadonlySet<string>>(new Set());

  protected readonly location = signal<SelectedLocation | null>(null);
  protected readonly locationChanged = signal(false);

  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);
  protected readonly error = signal<string | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────

  protected readonly isCreator = computed(() => {
    const memory = this.memory();
    return !!memory && !!this.me && String(memory.user_id) === this.me;
  });

  /** Only a successfully loaded crew can count as changed → a failed load never wipes the crew. */
  protected readonly crewChanged = computed(() =>
    this.crewState() === 'ready' && crewSignature(this.crew()) !== this.initialCrew(),
  );

  protected readonly hasChanges = computed(() =>
    this.formStatus().dirty || this.crewChanged() || this.locationChanged(),
  );

  protected readonly canSave = computed(() =>
    this.hasChanges() && !this.saving() && !this.deleting(),
  );

  // ── Loading ──────────────────────────────────────────────────────────────

  private generation = 0;

  constructor() {
    effect(() => {
      const id = this.memoryId();
      untracked(() => void this.load(id));
    });
  }

  private async load(id: number): Promise<void> {
    const gen = ++this.generation;
    this.state.set('loading');
    this.crewState.set('loading');
    this.locationChanged.set(false);
    this.error.set(null);

    if (!Number.isInteger(id) || id <= 0 || !this.me) {
      this.state.set('not-found');
      return;
    }

    let memory: Memory;
    try {
      memory = await firstValueFrom(this.memoryService.getMemory(id));
      if (String(memory.user_id) !== this.me) {
        const membership = await firstValueFrom(this.memoryService.isUserMemoryMember(id, this.me));
        if (!membership?.isMember) {
          if (gen === this.generation) this.state.set('forbidden');
          return;
        }
      }
    } catch (error) {
      if (gen === this.generation) this.state.set(pageStateForError(error));
      return;
    }
    if (gen !== this.generation) return;

    this.memory.set(memory);
    this.form.setValue({
      title: memory.title ?? '',
      description: memory.text ?? '',
      dates: {
        start: parseMemoryDate(memory.memory_date),
        end: parseMemoryDate(memory.memory_end_date),
      },
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
    this.state.set('ready');

    await Promise.allSettled([this.loadCrew(id, gen), this.loadLocation(memory, gen)]);
  }

  private async loadCrew(id: number, gen: number): Promise<void> {
    try {
      const [friends, placeholders] = await Promise.all([
        firstValueFrom(this.memoryService.getMemorysFriends(String(id), this.me!)),
        firstValueFrom(this.memoryService.getPlaceholders(id)),
      ]);
      if (gen !== this.generation) return;

      const crew = [
        ...(friends ?? []).filter(f => f.user_id !== this.me).map(friendToCrewMember),
        ...placeholders.map(placeholderToCrewMember),
      ];
      this.crew.set(crew);
      this.initialCrew.set(crewSignature(crew));
      this.existingPlaceholderIds.set(new Set(placeholders.map(p => p.id)));
      this.crewState.set('ready');
    } catch (error) {
      console.error('Loading crew failed:', error);
      if (gen === this.generation) this.crewState.set('error');
    }
  }

  private async loadLocation(memory: Memory, gen: number): Promise<void> {
    if (!memory.location_id || memory.location_id === NO_LOCATION_ID) {
      this.location.set(null);
      return;
    }
    try {
      const loc = await firstValueFrom(this.locationService.getLocationById(memory.location_id));
      if (gen !== this.generation || !loc || loc.location_id === NO_LOCATION_ID) return;
      this.location.set({
        lat: Number(loc.latitude),
        lng: Number(loc.longitude),
        city: loc.city ?? '',
        country: loc.country ?? '',
        countryCode: loc.countryCode ?? '',
        source: 'map',
      });
    } catch (error) {
      console.error('Loading location failed:', error);
    }
  }

  protected retry(): void {
    void this.load(this.memoryId());
  }

  protected retryCrew(): void {
    void this.loadCrew(this.memoryId(), this.generation);
  }

  // ── Location ─────────────────────────────────────────────────────────────

  protected async chooseOnMap(): Promise<void> {
    const current = this.location();
    const ref = this.dialog.open(ChooseLocationComponent, {
      data: current ? { lat: current.lat, long: current.lng } : FALLBACK_MAP_CENTER,
      width: 'min(720px, 100vw)',
      maxWidth: '100vw',
    });

    const result = await firstValueFrom(ref.afterClosed()) as
      { parsedLocation?: ParsedLocation; markerPosition?: { lat: number; lng: number } } | undefined;
    if (!result?.markerPosition) return;

    this.location.set({
      lat: round4(result.markerPosition.lat),
      lng: round4(result.markerPosition.lng),
      city: result.parsedLocation?.city ?? '',
      country: result.parsedLocation?.country ?? '',
      countryCode: result.parsedLocation?.countryCode ?? '',
      source: 'map',
    });
    this.locationChanged.set(true);
  }

  protected clearLocation(): void {
    this.location.set(null);
    this.locationChanged.set(true);
  }

  // ── Save / cancel ────────────────────────────────────────────────────────

  protected async save(): Promise<void> {
    if (!this.canSave()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description, dates } = this.form.getRawValue();
    const request = buildUpdateRequest({
      title,
      description,
      start: dates.start,
      end: dates.end,
      location: this.location(),
      locationChanged: this.locationChanged(),
      crew: this.crew(),
      crewChanged: this.crewChanged(),
      currentUserId: this.me,
      existingPlaceholderIds: this.existingPlaceholderIds(),
    });

    this.saving.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.memoryService.updateDetails(this.memoryId(), request));
      this.form.markAsPristine();
      this.locationChanged.set(false);
      this.snackBar.open('Changes saved', undefined, { duration: 2500 });
      await this.router.navigate(['/memory', this.memoryId()], { replaceUrl: true });
    } catch (err) {
      this.error.set(describeEditError(err));
    } finally {
      this.saving.set(false);
    }
  }

  protected async cancel(): Promise<void> {
    if (this.hasChanges()) {
      const discard = await this.confirm('Discard changes?', 'Your unsaved changes will be lost.');
      if (!discard) return;
    }
    await this.router.navigate(['/memory', this.memoryId()]);
  }

  // ── Delete (creator only) ────────────────────────────────────────────────

  protected async deleteMemory(): Promise<void> {
    const memory = this.memory();
    if (!memory || !this.isCreator() || this.deleting()) return;

    const confirmed = await this.confirm('Delete memory?', `"${memory.title}" and all its photos will be deleted for everyone. This can't be undone.`);
    if (!confirmed) return;

    this.deleting.set(true);
    try {
      const pins = await firstValueFrom(this.pinnedService.checkMemoryPin(memory.memory_id));
      const pinned = (pins?.length ?? 0) > 0;
      if (pinned) {
        const stillDelete = await this.confirm('Delete anyway?', 'This memory is in someone\'s favorite memories.');
        if (!stillDelete) return;
        await firstValueFrom(this.pinnedService.deleteMemoryFromAllPins(memory.memory_id));
      }

      await firstValueFrom(this.memoryService.deleteMemoryAndFriends(String(memory.memory_id)));
      try {
        await firstValueFrom(this.fileUpload.deleteMemorysFolder(String(memory.memory_id)));
      } catch (storageError) {
        // Memory is gone – leftover files don't block the user.
        console.error('Deleting memory files failed:', storageError);
      }

      this.snackBar.open('Memory deleted', undefined, { duration: 2500 });
      await this.router.navigate(['/home'], { replaceUrl: true });
    } catch (err) {
      console.error('Deleting memory failed:', err);
      this.error.set('The memory could not be deleted. Please try again.');
    } finally {
      this.deleting.set(false);
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private confirm(title: string, message: string): Promise<boolean> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title, message },
      width: 'min(450px, 100vw)',
    });
    return firstValueFrom(ref.afterClosed()).then(result => !!result);
  }
}

function round4(value: number): number {
  return Math.round(value * 1e4) / 1e4;
}
