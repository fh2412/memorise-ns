import {
  ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';

import { BackButtonComponent } from '@components/back-button/back-button.component';
import { MemoryService } from '@services/memory.service';
import { UserService } from '@services/userService';
import { MemoryDownloadService } from '@services/memory-download.service';
import { Memory } from '@models/memoryInterface.model';
import { MemoryPhoto } from '@models/memory-photo.model';
import { MemoriseUser } from '@models/userInterface.model';
import { PageState, pageStateForError } from '../memory-detail.helpers';
import { formatBytes } from '../../../utils/format-bytes';
import {
  Uploader, buildUploaders, describeDownloadError, downloadTarget, filterByUploaders,
  intersectSelection, photoDateLabel, sumBytes,
} from './photo-download.helpers';

/** Button stays locked a moment after starting → no accidental double downloads. */
const RESTART_LOCK_MS = 3000;
const DEFAULT_AVATAR = '/assets/img/1.png';

@Component({
  selector: 'app-photo-download',
  templateUrl: './photo-download.component.html',
  styleUrl: './photo-download.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BackButtonComponent,
  ],
})
export class PhotoDownloadComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly memoryService = inject(MemoryService);
  private readonly userService = inject(UserService);
  private readonly downloader = inject(MemoryDownloadService);

  protected readonly formatBytes = formatBytes;
  protected readonly photoDateLabel = photoDateLabel;
  protected readonly defaultAvatar = DEFAULT_AVATAR;

  private readonly params = toSignal(this.route.paramMap, { requireSync: true });
  protected readonly memoryId = computed(() => Number(this.params()!.get('id')));

  // ── State ────────────────────────────────────────────────────────────────

  protected readonly state = signal<PageState>('loading');
  protected readonly memory = signal<Memory | null>(null);
  protected readonly photos = signal<MemoryPhoto[]>([]);
  private readonly users = signal<ReadonlyMap<string, MemoriseUser>>(new Map());

  protected readonly view = signal<'grid' | 'list'>('grid');
  protected readonly uploaderFilter = signal<ReadonlySet<string>>(new Set());
  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly downloading = signal(false);
  protected readonly brokenIds = signal<ReadonlySet<string>>(new Set());

  // ── Derived ──────────────────────────────────────────────────────────────

  protected readonly uploaders = computed<Uploader[]>(() => buildUploaders(this.photos(), this.users()));
  protected readonly uploaderById = computed(() => new Map(this.uploaders().map(u => [u.userId, u])));
  protected readonly filterActive = computed(() => this.uploaderFilter().size > 0);
  protected readonly visible = computed(() => filterByUploaders(this.photos(), this.uploaderFilter()));
  protected readonly totalBytes = computed(() => sumBytes(this.photos()));

  protected readonly selectedPhotos = computed(() => this.photos().filter(p => this.selected().has(p.photoId)));
  protected readonly allVisibleSelected = computed(() =>
    this.visible().length > 0 && this.visible().every(p => this.selected().has(p.photoId)),
  );

  /** What the main button downloads right now. */
  protected readonly target = computed(() => {
    const photos = this.selected().size > 0 ? this.selectedPhotos() : this.visible();
    const label = this.selected().size > 0
      ? `Download ${photos.length} selected`
      : this.filterActive() ? `Download ${photos.length} ${photos.length === 1 ? 'photo' : 'photos'}` : 'Download all';
    return { count: photos.length, bytes: sumBytes(photos), label };
  });

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
    this.selected.set(new Set());
    this.uploaderFilter.set(new Set());

    if (!Number.isInteger(id) || id <= 0) {
      this.state.set('not-found');
      return;
    }

    try {
      // Loaded from the URL → works after a page reload and via direct links.
      const [memory, photos] = await Promise.all([
        firstValueFrom(this.memoryService.getMemory(id)),
        firstValueFrom(this.memoryService.getPhotos(id)),
      ]);
      if (gen !== this.generation) return;
      this.memory.set(memory);
      this.photos.set(photos);
      this.brokenIds.set(new Set());
      this.state.set('ready');
      void this.loadUploaders(photos, gen);
    } catch (error) {
      if (gen === this.generation) this.state.set(pageStateForError(error));
    }
  }

  /** Names/avatars only – a failed lookup just shows "Unknown". */
  private async loadUploaders(photos: MemoryPhoto[], gen: number): Promise<void> {
    const ids = [...new Set(photos.map(p => p.uploadedBy))];
    const results = await Promise.allSettled(ids.map(id => firstValueFrom(this.userService.getUser(id))));
    if (gen !== this.generation) return;

    const map = new Map<string, MemoriseUser>();
    results.forEach((result, i) => {
      if (result.status === 'fulfilled' && result.value) map.set(ids[i], result.value);
    });
    this.users.set(map);
  }

  protected retry(): void {
    void this.load(this.memoryId());
  }

  // ── Filter & selection ───────────────────────────────────────────────────

  protected toggleUploader(userId: string): void {
    this.uploaderFilter.update(filter => {
      const next = new Set(filter);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
    // Hidden photos are never downloaded "by accident"
    this.selected.update(sel => intersectSelection(sel, this.visible()));
  }

  protected clearFilter(): void {
    this.uploaderFilter.set(new Set());
  }

  protected toggle(photo: MemoryPhoto): void {
    if (this.downloading()) return;
    this.selected.update(sel => {
      const next = new Set(sel);
      if (next.has(photo.photoId)) next.delete(photo.photoId);
      else next.add(photo.photoId);
      return next;
    });
  }

  protected toggleAllVisible(): void {
    const visibleIds = this.visible().map(p => p.photoId);
    this.selected.update(sel => {
      const next = new Set(sel);
      if (this.allVisibleSelected()) visibleIds.forEach(id => next.delete(id));
      else visibleIds.forEach(id => next.add(id));
      return next;
    });
  }

  protected clearSelection(): void {
    this.selected.set(new Set());
  }

  protected markBroken(photoId: string): void {
    this.brokenIds.update(ids => new Set(ids).add(photoId));
  }

  // ── Download ─────────────────────────────────────────────────────────────

  protected async download(): Promise<void> {
    if (this.downloading() || this.target().count === 0) return;

    this.downloading.set(true);
    let started = false;
    try {
      const ids = downloadTarget(this.selected(), this.visible(), this.filterActive());
      const ticket = await this.downloader.download(this.memoryId(), ids);
      started = true;
      this.snackBar.open(
        `Download started · ${ticket.fileCount} ${ticket.fileCount === 1 ? 'photo' : 'photos'} · ${formatBytes(ticket.totalBytes)}`,
        undefined,
        { duration: 4000 },
      );
    } catch (error) {
      console.error('Starting download failed:', error);
      this.snackBar.open(describeDownloadError(error), 'Close', { duration: 5000 });
    } finally {
      if (started) setTimeout(() => this.downloading.set(false), RESTART_LOCK_MS);
      else this.downloading.set(false);
    }
  }
}
