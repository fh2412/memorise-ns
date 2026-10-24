import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UploadQueueService } from '@services/upload-queue.service';
import { UploadJob, UploadJobStatus } from '@models/photo-upload.model';

const AUTO_CLEAR_DELAY_MS = 4000;

const STATUS_ICON: Record<UploadJobStatus, string> = {
  queued: 'schedule',
  uploading: 'cloud_upload',
  registering: 'cloud_sync',
  done: 'check_circle',
  failed: 'error',
  canceled: 'block',
};

/** Global upload status. Place once in the app shell. */
@Component({
  selector: 'app-upload-indicator',
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, MatProgressSpinnerModule],
  templateUrl: './upload-indicator.component.html',
  styleUrl: './upload-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadIndicatorComponent {
  protected readonly queue = inject(UploadQueueService);

  protected readonly expanded = signal(false);
  protected readonly visible = computed(() => this.queue.jobs().length > 0);
  protected readonly percent = computed(() => Math.round(this.queue.progress() * 100));

  protected readonly label = computed(() => {
    const done = this.queue.doneCount();
    const total = this.queue.totalCount();
    const failed = this.queue.failedCount();
    if (this.queue.isBusy()) return `Uploading ${done} of ${total}`;
    if (failed > 0) return `${failed} ${failed === 1 ? 'upload' : 'uploads'} failed`;
    return 'All photos uploaded';
  });

  constructor() {
    // When everything finished successfully: clear the list after a short delay.
    effect(onCleanup => {
      this.queue.lastFinalized(); // re-check after a session was completed
      if (this.queue.isBusy() || this.queue.failedCount() > 0 || this.queue.jobs().length === 0) return;

      const timer = setTimeout(() => {
        this.queue.clearFinished();
        this.expanded.set(false);
      }, AUTO_CLEAR_DELAY_MS);
      onCleanup(() => clearTimeout(timer));
    });
  }

  protected toggle(): void {
    this.expanded.update(v => !v);
  }

  protected statusIcon(status: UploadJobStatus): string {
    return STATUS_ICON[status];
  }

  protected jobPercent(job: UploadJob): number {
    return job.totalBytes === 0 ? 0 : Math.round((job.bytesTransferred / job.totalBytes) * 100);
  }

  protected canCancel(job: UploadJob): boolean {
    return job.status === 'queued' || job.status === 'uploading';
  }
}
