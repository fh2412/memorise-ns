import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef,
  computed, effect, inject, input, model, signal, viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BillingService } from '@services/billing.service';
import { PickedPhoto } from '@models/photo-upload.model';
import { UnsupportedImageError, fileKey, isPotentialImage, processImage } from '../../utils/image-processing';
import { createLimiter } from '../../utils/concurrency';
import { formatBytes } from '../../utils/format-bytes';

const PROCESSING_CONCURRENCY = 2;
const DEFAULT_MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB
const MAX_REJECTED_SHOWN = 5;

@Component({
  selector: 'app-photo-picker',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './photo-picker.component.html',
  styleUrl: './photo-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.dragging]': 'isDragging()',
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave($event)',
    '(drop)': 'onDrop($event)',
  },
})
export class PhotoPickerComponent {
  private readonly billing = inject(BillingService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Two-way bound photo list. Photos are addressed by `id`, never by index. */
  readonly photos = model<PickedPhoto[]>([]);
  /** Two-way bound cover photo id. Set automatically to the first usable photo. */
  readonly coverId = model<string | null>(null);
  readonly selectCover = input(true);
  readonly disabled = input(false);
  readonly maxFileSizeBytes = input(DEFAULT_MAX_FILE_SIZE);

  protected readonly isDragging = signal(false);
  protected readonly rejected = signal<string[]>([]);
  private readonly fileInput = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly readyPhotos = computed(() => this.photos().filter(p => p.status === 'ready'));
  protected readonly processingCount = computed(() => this.photos().filter(p => p.status === 'processing').length);
  protected readonly errorCount = computed(() => this.photos().filter(p => p.status === 'error').length);
  protected readonly totalBytes = computed(() =>
    this.readyPhotos().reduce((sum, p) => sum + p.file.size + (p.thumbnail?.size ?? 0), 0),
  );
  protected readonly remainingBytes = this.billing.remainingBytes;
  protected readonly exceedsStorage = computed(() => this.totalBytes() > this.remainingBytes());
  protected readonly visibleRejected = computed(() => this.rejected().slice(0, MAX_REJECTED_SHOWN));
  protected readonly hiddenRejectedCount = computed(() => Math.max(0, this.rejected().length - MAX_REJECTED_SHOWN));
  protected readonly formatBytes = formatBytes;

  private readonly limit = createLimiter(PROCESSING_CONCURRENCY);
  private readonly ownedUrls = new Set<string>();
  private destroyed = false;

  constructor() {
    // Revoke preview URLs of photos that left the list (removed here OR reset by the parent).
    effect(() => {
      const live = new Set(this.photos().map(p => p.previewUrl));
      for (const url of this.ownedUrls) {
        if (!live.has(url)) {
          URL.revokeObjectURL(url);
          this.ownedUrls.delete(url);
        }
      }
    });

    inject(DestroyRef).onDestroy(() => {
      this.destroyed = true;
      this.ownedUrls.forEach(url => URL.revokeObjectURL(url));
      this.ownedUrls.clear();
    });
  }

  // ── Selection ──────────────────────────────────────────────────────────────

  openFileDialog(): void {
    if (!this.disabled()) this.fileInput().nativeElement.click();
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.addFiles(Array.from(input.files));
    input.value = ''; // allows selecting the same file again after removing it
  }

  addFiles(files: File[]): void {
    if (this.disabled()) return;

    const knownKeys = new Set(this.photos().map(p => fileKey(p.file)));
    const rejected: string[] = [];
    const added: PickedPhoto[] = [];

    for (const file of files) {
      const key = fileKey(file);
      if (knownKeys.has(key)) {
        rejected.push(`${file.name}: already selected`);
      } else if (!isPotentialImage(file)) {
        rejected.push(`${file.name}: not a supported image`);
      } else if (file.size > this.maxFileSizeBytes()) {
        rejected.push(`${file.name}: larger than ${formatBytes(this.maxFileSizeBytes(), 0)}`);
      } else {
        knownKeys.add(key);
        added.push({
          id: crypto.randomUUID(),
          file,
          status: 'processing',
          previewUrl: null,
          thumbnail: null,
          width: 0,
          height: 0,
        });
      }
    }

    this.rejected.set(rejected);
    if (added.length === 0) return;

    this.photos.update(list => [...list, ...added]);
    if (this.selectCover() && !this.coverId()) this.coverId.set(added[0].id);

    for (const photo of added) void this.limit(() => this.process(photo.id));
  }

  private async process(id: string): Promise<void> {
    const photo = this.find(id);
    if (this.destroyed || !photo) return; // removed while waiting

    try {
      const { width, height, thumbnail } = await processImage(photo.file);
      if (this.destroyed || !this.find(id)) return; // removed while processing

      const previewUrl = URL.createObjectURL(thumbnail);
      this.ownedUrls.add(previewUrl);
      this.patch(id, { status: 'ready', width, height, thumbnail, previewUrl });
    } catch (error) {
      if (this.destroyed || !this.find(id)) return;
      this.patch(id, {
        status: 'error',
        error: error instanceof UnsupportedImageError ? 'Format not supported' : 'Could not read image',
      });
      if (this.coverId() === id) this.coverId.set(this.firstCoverCandidate(this.photos()));
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  remove(id: string): void {
    const remaining = this.photos().filter(p => p.id !== id);
    this.photos.set(remaining);
    if (this.coverId() === id) this.coverId.set(this.firstCoverCandidate(remaining));
  }

  removeFailed(): void {
    this.photos.update(list => list.filter(p => p.status !== 'error'));
  }

  setCover(id: string): void {
    if (this.selectCover()) this.coverId.set(id);
  }

  dismissRejected(): void {
    this.rejected.set([]);
  }

  // ── Drag & drop ────────────────────────────────────────────────────────────

  protected onDragOver(event: DragEvent): void {
    if (this.disabled() || !event.dataTransfer?.types.includes('Files')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    this.isDragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    const target = event.relatedTarget as Node | null;
    if (target && this.host.nativeElement.contains(target)) return; // moving between children
    this.isDragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files?.length) this.addFiles(Array.from(files));
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private find(id: string): PickedPhoto | undefined {
    return this.photos().find(p => p.id === id);
  }

  private patch(id: string, changes: Partial<PickedPhoto>): void {
    this.photos.update(list => list.map(p => (p.id === id ? { ...p, ...changes } : p)));
  }

  private firstCoverCandidate(list: PickedPhoto[]): string | null {
    return list.find(p => p.status !== 'error')?.id ?? null;
  }
}
