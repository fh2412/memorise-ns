import {
  ChangeDetectionStrategy, Component, ElementRef, PLATFORM_ID,
  computed, effect, inject, signal, untracked, viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DateRange, MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import { Observable, firstValueFrom } from 'rxjs';

import { MemoryService } from '@services/memory.service';
import { UserService } from '@services/userService';
import { LocationService } from '@services/location.service';
import { ImageGalleryService } from '@services/image-gallery.service';
import { FriendsService } from '@services/friends.service';
import { UploadQueueService } from '@services/upload-queue.service';
import { FullDescriptionDialogComponent } from '@components/_dialogs/full-description-dialog/full-description-dialog.component';
import { BackButtonComponent } from '@components/back-button/back-button.component';
import { FriendsProfilePicsComponent } from '@components/friends-profile-pics/friends-profile-pics.component';
import { MapSnippetComponent } from '@components/map-snippet/map-snippet.component';
import { Memory } from '@models/memoryInterface.model';
import { MemoriseUser, MemoryDetailFriend } from '@models/userInterface.model';
import { MemoriseLocation } from '@models/location.model';
import { MemoryPhoto } from '@models/memory-photo.model';
import { NO_LOCATION_ID } from '@models/memory-constants';
import {
  PageState, memoryDates, pageStateForError, peopleLabel, previewTiles,
  toImageWithMetadata, uploadProgressFor,
} from './memory-detail.helpers';

/** Kept for existing imports (gallery, download page, ImageGalleryService). */
export type { ImageWithMetadata } from '@models/memory-photo.model';

const DEFAULT_AVATAR = '/assets/img/1.png';

@Component({
  selector: 'app-memory-detail',
  templateUrl: './memory-detail.component.html',
  styleUrl: './memory-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDatepickerModule,
    BackButtonComponent,
    FriendsProfilePicsComponent,
    MapSnippetComponent,
  ],
})
export class MemoryDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly memoryService = inject(MemoryService);
  private readonly userService = inject(UserService);
  private readonly locationService = inject(LocationService);
  private readonly imageDataService = inject(ImageGalleryService);
  private readonly friendsService = inject(FriendsService);
  private readonly uploadQueue = inject(UploadQueueService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly defaultAvatar = DEFAULT_AVATAR;
  protected readonly loggedInUserId = this.userService.getLoggedInUserId();

  // ── Route ────────────────────────────────────────────────────────────────

  private readonly params = toSignal(this.route.paramMap, { requireSync: true });
  /** Reacts to /memory/1 → /memory/2 without recreating the component. */
  protected readonly memoryId = computed(() => Number(this.params()!.get('id')));

  // ── State ────────────────────────────────────────────────────────────────

  protected readonly state = signal<PageState>('loading');
  protected readonly memory = signal<Memory | null>(null);
  protected readonly creator = signal<MemoriseUser | null>(null);
  protected readonly crew = signal<MemoryDetailFriend[]>([]);
  protected readonly location = signal<MemoriseLocation | null>(null);
  private readonly isMember = signal(false);

  protected readonly photos = signal<MemoryPhoto[]>([]);
  protected readonly photosState = signal<'loading' | 'ready' | 'error'>('loading');
  /** Photos whose image failed to load (e.g. deleted in Storage) → shown as gray tile. */
  protected readonly brokenPhotoIds = signal<ReadonlySet<string>>(new Set());

  // ── Derived ──────────────────────────────────────────────────────────────

  protected readonly hasPrivileges = computed(() => {
    const memory = this.memory();
    const me = this.loggedInUserId;
    return !!me && !!memory && (String(memory.user_id) === me || this.isMember());
  });

  protected readonly dates = computed(() => {
    const memory = this.memory();
    const dates = memory ? memoryDates(memory.memory_date, memory.memory_end_date) : null;
    return dates ? { ...dates, range: new DateRange<Date>(dates.start, dates.end) } : null;
  });

  protected readonly peopleLabel = computed(() => peopleLabel(this.crew().length));
  protected readonly description = computed(() => this.memory()?.text?.trim() ?? '');

  protected readonly previewTiles = computed(() =>
    previewTiles(this.photos().filter(p => !this.brokenPhotoIds().has(p.photoId))),
  );

  protected readonly upload = computed(() =>
    uploadProgressFor(this.uploadQueue.jobs(), String(this.memoryId())),
  );

  // ── Description "Show more" ──────────────────────────────────────────────

  private readonly descriptionEl = viewChild<ElementRef<HTMLElement>>('descriptionText');
  protected readonly descriptionOverflows = signal(false);

  // ── Loading ──────────────────────────────────────────────────────────────

  /** Incremented per memory → responses of a previous memory are ignored. */
  private generation = 0;
  private lastHandledUploadSession = this.uploadQueue.lastFinalized()?.uploadSessionId ?? null;

  constructor() {
    effect(() => {
      const id = this.memoryId();
      untracked(() => void this.load(id));
    });

    // Reload photos once a background upload for this memory finished.
    effect(() => {
      const finalized = this.uploadQueue.lastFinalized();
      if (!finalized || finalized.uploadSessionId === this.lastHandledUploadSession) return;
      untracked(() => {
        if (finalized.memoryId !== String(this.memoryId())) return;
        this.lastHandledUploadSession = finalized.uploadSessionId;
        void this.loadPhotos(this.memoryId(), this.generation);
      });
    });

    // Line-clamp overflow check; re-runs on resize and when the text changes.
    if (this.isBrowser) {
      effect(onCleanup => {
        this.description();
        const el = this.descriptionEl()?.nativeElement;
        if (!el) {
          this.descriptionOverflows.set(false);
          return;
        }
        const check = () => this.descriptionOverflows.set(el.scrollHeight > el.clientHeight + 1);
        const observer = new ResizeObserver(check);
        observer.observe(el);
        check();
        onCleanup(() => observer.disconnect());
      });
    }
  }

  private async load(id: number): Promise<void> {
    const gen = ++this.generation;
    this.reset();

    if (!Number.isInteger(id) || id <= 0) {
      this.state.set('not-found');
      return;
    }

    let memory: Memory;
    try {
      memory = await firstValueFrom(this.memoryService.getMemory(id));
    } catch (error) {
      if (gen === this.generation) this.state.set(pageStateForError(error));
      return;
    }
    if (gen !== this.generation) return;
    if (!memory) {
      this.state.set('not-found');
      return;
    }

    this.memory.set(memory);
    this.state.set('ready');

    const me = this.loggedInUserId;
    const creatorId = String(memory.user_id);

    // Everything else in parallel – the page is already visible.
    void this.loadPhotos(id, gen);
    await Promise.allSettled([
      this.apply(gen, this.userService.getUser(creatorId), user => this.creator.set(user), 'creator'),
      me
        ? this.apply(gen, this.memoryService.getMemorysFriendsWithShared(id, me), crew => this.crew.set(crew ?? []), 'crew')
        : null,
      memory.location_id && memory.location_id !== NO_LOCATION_ID
        ? this.apply(gen, this.locationService.getLocationById(memory.location_id),
            loc => this.location.set(loc?.location_id === NO_LOCATION_ID ? null : loc), 'location')
        : null,
      me && me !== creatorId
        ? this.apply(gen, this.memoryService.isUserMemoryMember(id, me), r => this.isMember.set(!!r?.isMember), 'membership')
        : null,
    ]);
  }

  private async loadPhotos(id: number, gen: number): Promise<void> {
    if (this.photos().length === 0) this.photosState.set('loading');
    try {
      const photos = await firstValueFrom(this.memoryService.getPhotos(id));
      if (gen !== this.generation) return;
      this.photos.set(photos);
      this.brokenPhotoIds.set(new Set());
      this.photosState.set('ready');
    } catch (error) {
      if (gen !== this.generation) return;
      console.error('Loading photos failed:', error);
      this.photosState.set('error');
    }
  }

  private async apply<T>(gen: number, source: Observable<T>, set: (value: T) => void, label: string): Promise<void> {
    try {
      const value = await firstValueFrom(source);
      if (gen === this.generation) set(value);
    } catch (error) {
      console.error(`Loading ${label} failed:`, error);
    }
  }

  private reset(): void {
    this.state.set('loading');
    this.memory.set(null);
    this.creator.set(null);
    this.crew.set([]);
    this.location.set(null);
    this.isMember.set(false);
    this.photos.set([]);
    this.photosState.set('loading');
    this.brokenPhotoIds.set(new Set());
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  protected retry(): void {
    void this.load(this.memoryId());
  }

  protected retryPhotos(): void {
    void this.loadPhotos(this.memoryId(), this.generation);
  }

  protected markBroken(photoId: string): void {
    this.brokenPhotoIds.update(ids => new Set(ids).add(photoId));
  }

  protected openGallery(): void {
    this.imageDataService.updateImageData(this.photos().map(toImageWithMetadata));
    void this.router.navigate(['memory', this.memoryId(), 'gallery']);
  }

  protected openDownloadPage(): void {
    const memory = this.memory();
    if (!memory) return;

    this.imageDataService.updateImageData(this.photos().map(toImageWithMetadata));

    const creator = this.creator();
    const crew = this.crew();
    if (creator) {
      this.friendsService.updateFriendsData([
        ...crew,
        {
          country: creator.country,
          dob: null,
          name: creator.name,
          profilepic: creator.profilepic,
          sharedMemoriesCount: 0,
          user_id: creator.user_id,
          friendship_status: 'none',
        },
      ]);
    }

    void this.router.navigate(['memory', this.memoryId(), 'download'], { state: { memory } });
  }

  protected openFullDescDialog(): void {
    this.dialog.open(FullDescriptionDialogComponent, {
      data: { description: this.memory()?.text ?? '' },
      maxWidth: 'min(720px, 100vw)',
    });
  }

  protected async addFriend(friend: MemoryDetailFriend): Promise<void> {
    const me = this.loggedInUserId;
    if (!me) return;

    try {
      await firstValueFrom(this.friendsService.sendFriendRequest(me, friend.user_id));
      this.crew.update(crew =>
        crew.map(c => (c.user_id === friend.user_id ? { ...c, friendship_status: 'requested' } : c)),
      );
      this.showSnackbar('Friend request sent!');
    } catch (error) {
      console.error('Failed to send friend request:', error);
      this.showSnackbar('Friend request could not be sent.');
    }
  }

  protected isKnown(friend: MemoryDetailFriend): boolean {
    return friend.friendship_status === 'accepted' || friend.user_id === this.loggedInUserId;
  }

  private showSnackbar(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}
