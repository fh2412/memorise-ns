import {
  ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';

import { BackButtonComponent } from '@components/back-button/back-button.component';
import { ConfirmDialogComponent } from '@components/_dialogs/confirm-dialog/confirm-dialog.component';
import { MemoryService } from '@services/memory.service';
import { UserService } from '@services/userService';
import { BillingService } from '@services/billing.service';
import { UploadQueueService } from '@services/upload-queue.service';
import { Memory } from '@models/memoryInterface.model';
import { MemoryPhoto } from '@models/memory-photo.model';
import { PageState, pageStateForError } from '../../memory-detail/memory-detail.helpers';
import { formatBytes } from '../../../utils/format-bytes';

@Component({
  selector: 'app-manage-photos',
  templateUrl: './manage-photos.component.html',
  styleUrl: './manage-photos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, BackButtonComponent],
})
export class ManagePhotosComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly memoryService = inject(MemoryService);
  private readonly userService = inject(UserService);
  private readonly billing = inject(BillingService);
  private readonly uploadQueue = inject(UploadQueueService);

  protected readonly me = this.userService.getLoggedInUserId();
  protected readonly formatBytes = formatBytes;

  private readonly params = toSignal(this.route.paramMap, { requireSync: true });
  protected readonly memoryId = computed(() => Number(this.params().get('memoryId')));

  // ── State ────────────────────────────────────────────────────────────────

  protected readonly state = signal<PageState>('loading');
  protected readonly memory = signal<Memory | null>(null);
  protected readonly photos = signal<MemoryPhoto[]>([]);
  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly busy = signal<'delete' | 'cover' | null>(null);
  protected readonly brokenIds = signal<ReadonlySet<string>>(new Set());

  // ── Derived ──────────────────────────────────────────────────────────────

  protected readonly isCreator = computed(() => {
    const memory = this.memory();
    return !!memory && !!this.me && String(memory.user_id) === this.me;
  });

  protected readonly deletableIds = computed(() =>
    new Set(this.photos().filter(p => this.canDelete(p)).map(p => p.photoId)),
  );

  protected readonly selectedPhotos = computed(() => this.photos().filter(p => this.selected().has(p.photoId)));
  protected readonly selectedBytes = computed(() => this.selectedPhotos().reduce((sum, p) => sum + p.sizeBytes, 0));
  protected readonly allSelected = computed(() =>
    this.deletableIds().size > 0 && this.selected().size === this.deletableIds().size,
  );

  // ── Loading ──────────────────────────────────────────────────────────────

  private generation = 0;
  private lastHandledUploadSession = this.uploadQueue.lastFinalized()?.uploadSessionId ?? null;

  constructor() {
    effect(() => {
      const id = this.memoryId();
      untracked(() => void this.load(id));
    });

    // New photos finished uploading in the background → refresh the grid.
    effect(() => {
      const finalized = this.uploadQueue.lastFinalized();
      if (!finalized || finalized.uploadSessionId === this.lastHandledUploadSession) return;
      untracked(() => {
        if (finalized.memoryId !== String(this.memoryId())) return;
        this.lastHandledUploadSession = finalized.uploadSessionId;
        void this.refreshPhotos();
      });
    });
  }

  private async load(id: number): Promise<void> {
    const gen = ++this.generation;
    this.state.set('loading');
    this.selected.set(new Set());

    if (!Number.isInteger(id) || id <= 0) {
      this.state.set('not-found');
      return;
    }

    try {
      const [memory, photos] = await Promise.all([
        firstValueFrom(this.memoryService.getMemory(id)),
        firstValueFrom(this.memoryService.getPhotos(id)),
      ]);
      if (gen !== this.generation) return;
      this.memory.set(memory);
      this.photos.set(photos);
      this.brokenIds.set(new Set());
      this.state.set('ready');
    } catch (error) {
      if (gen === this.generation) this.state.set(pageStateForError(error));
    }
  }

  private async refreshPhotos(): Promise<void> {
    const gen = this.generation;
    try {
      const photos = await firstValueFrom(this.memoryService.getPhotos(this.memoryId()));
      if (gen !== this.generation) return;
      this.photos.set(photos);
      // Drop selections of photos that no longer exist
      const ids = new Set(photos.map(p => p.photoId));
      this.selected.update(sel => new Set([...sel].filter(id => ids.has(id))));
    } catch (error) {
      console.error('Refreshing photos failed:', error);
    }
  }

  protected retry(): void {
    void this.load(this.memoryId());
  }

  // ── Selection ────────────────────────────────────────────────────────────

  /** Creator: every photo · member: only own uploads (enforced by the backend too). */
  protected canDelete(photo: MemoryPhoto): boolean {
    return this.isCreator() || photo.uploadedBy === this.me;
  }

  protected toggle(photo: MemoryPhoto): void {
    if (!this.canDelete(photo) || this.busy()) return;
    this.selected.update(sel => {
      const next = new Set(sel);
      if (next.has(photo.photoId)) next.delete(photo.photoId);
      else next.add(photo.photoId);
      return next;
    });
  }

  protected toggleAll(): void {
    this.selected.set(this.allSelected() ? new Set() : new Set(this.deletableIds()));
  }

  protected clearSelection(): void {
    this.selected.set(new Set());
  }

  protected markBroken(photoId: string): void {
    this.brokenIds.update(ids => new Set(ids).add(photoId));
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  protected async setCover(photo: MemoryPhoto): Promise<void> {
    if (photo.isCover || this.busy()) return;

    this.busy.set('cover');
    try {
      await firstValueFrom(this.memoryService.setCover(this.memoryId(), photo.photoId));
      this.photos.update(list => list.map(p => ({ ...p, isCover: p.photoId === photo.photoId })));
      this.snackBar.open('Cover photo updated', undefined, { duration: 2500 });
    } catch (error) {
      console.error('Setting cover failed:', error);
      this.snackBar.open('Cover photo could not be changed.', 'Close', { duration: 4000 });
    } finally {
      this.busy.set(null);
    }
  }

  protected async deleteSelected(): Promise<void> {
    const photos = this.selectedPhotos();
    if (photos.length === 0 || this.busy()) return;

    const label = photos.length === 1 ? 'this photo' : `${photos.length} photos`;
    const confirmed = await firstValueFrom(
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: `Delete ${label}?`,
          message: `${formatBytes(this.selectedBytes())} will be freed. This can't be undone.`,
        },
        width: 'min(450px, 100vw)',
      }).afterClosed(),
    );
    if (!confirmed) return;

    this.busy.set('delete');
    try {
      const result = await firstValueFrom(
        this.memoryService.deletePhotos(this.memoryId(), photos.map(p => p.photoId)),
      );
      const deleted = new Set(result.deletedPhotoIds);
      this.photos.update(list =>
        list
          .filter(p => !deleted.has(p.photoId))
          .map(p => ({ ...p, isCover: p.photoId === result.coverPhotoId })),
      );
      this.selected.set(new Set());
      if (result.storageUsedBytes !== null) this.billing.setStorageUsedBytes(result.storageUsedBytes);

      const n = result.deletedPhotoIds.length;
      this.snackBar.open(`${n} ${n === 1 ? 'photo' : 'photos'} deleted`, undefined, { duration: 2500 });
    } catch (error) {
      console.error('Deleting photos failed:', error);
      this.snackBar.open('Photos could not be deleted. Please try again.', 'Close', { duration: 4000 });
    } finally {
      this.busy.set(null);
    }
  }
}
