import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { PhotoPickerComponent } from '@components/photo-picker/photo-picker.component';
import { MemoryService } from '@services/memory.service';
import { UploadQueueService } from '@services/upload-queue.service';
import { BillingService } from '@services/billing.service';
import { UserService } from '@services/userService';
import { PickedPhoto, isReadyPhoto } from '@models/photo-upload.model';
import { Router } from '@angular/router';

/**
 * Adds photos to an EXISTING memory
 */
@Component({
  selector: 'app-memory-add-photos',
  imports: [PhotoPickerComponent, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './memory-add-photos.component.html',
  styleUrl: './memory-add-photos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemoryAddPhotosComponent {
  private readonly memoryService = inject(MemoryService);
  private readonly uploadQueue = inject(UploadQueueService);
  private readonly billing = inject(BillingService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly memoryId = input.required<string>();
  /** Emits the number of queued photos – e.g. to close a dialog/panel. */
  readonly uploadStarted = output<number>();

  protected readonly photos = signal<PickedPhoto[]>([]);
  protected readonly starting = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly readyPhotos = computed(() => this.photos().filter(isReadyPhoto));
  private readonly isProcessing = computed(() => this.photos().some(p => p.status === 'processing'));
  private readonly totalBytes = computed(() =>
    this.readyPhotos().reduce((sum, p) => sum + p.file.size + p.thumbnail.size, 0),
  );

  protected readonly canStart = computed(() =>
    this.readyPhotos().length > 0 &&
    !this.isProcessing() &&
    !this.starting() &&
    this.totalBytes() <= this.billing.remainingBytes(),
  );

  async startUpload(): Promise<void> {
    const userId = this.userService.getLoggedInUserId();
    if (!userId || !this.canStart()) return;

    const photos = this.readyPhotos();
    this.starting.set(true);
    this.error.set(null);

    try {
      const session = await firstValueFrom(
        this.memoryService.createUploadSession(this.memoryId(), {
          expectedFileCount: photos.length,
          expectedBytes: this.totalBytes(),
        }),
      );
      this.billing.setStorageUsedBytes(session.storageUsedBytes);

      const queued = this.uploadQueue.enqueue({
        memoryId: this.memoryId(),
        uploadSessionId: session.uploadSessionId,
        userId,
        photos,
        coverPhotoId: null,
      });

      this.photos.set([]);
      this.uploadStarted.emit(queued);

      await this.router.navigate(['/memory', this.memoryId()]);
    } catch (err) {
      this.error.set(
        err instanceof HttpErrorResponse && err.status === 409
          ? 'Not enough storage left for these photos. Remove some or upgrade your plan.'
          : 'Upload could not be started. Please try again.',
      );
    } finally {
      this.starting.set(false);
    }
  }
}
