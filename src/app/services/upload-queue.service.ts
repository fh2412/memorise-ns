import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Signal, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { FileUploadService } from '@services/file-upload.service';
import { MemoryService } from '@services/memory.service';
import { BillingService } from '@services/billing.service';
import {
  PickedPhoto, StoredObject, UploadJob, UploadJobStatus, isReadyPhoto,
} from '@models/photo-upload.model';
import { fileExtension, mimeType } from '../utils/image-processing';
import { abortError, sleep } from '../utils/concurrency';

const MAX_PARALLEL_UPLOADS = 3;
const MAX_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 2000;

const PENDING: ReadonlySet<UploadJobStatus> = new Set(['queued', 'uploading', 'registering']);
const ACTIVE: ReadonlySet<UploadJobStatus> = new Set(['uploading', 'registering']);

const RETRYABLE_STORAGE_CODES = new Set([
  'storage/retry-limit-exceeded',
  'storage/unknown',
  'storage/server-file-wrong-size',
  'storage/internal-error',
]);

export interface EnqueueRequest {
  memoryId: string;
  uploadSessionId: string;
  userId: string;
  /** Only photos with status 'ready' are taken. */
  photos: PickedPhoto[];
  coverPhotoId?: string | null;
}

export interface MemoryUploadState {
  total: number;
  done: number;
  failed: number;
  busy: boolean;
}

interface SessionState {
  memoryId: string;
  finalizing: boolean;
}

/**
 * App-wide background upload queue.
 * Lives in root → uploads continue while the user navigates.
 */
@Injectable({ providedIn: 'root' })
export class UploadQueueService {
  private readonly fileUpload = inject(FileUploadService);
  private readonly memoryService = inject(MemoryService);
  private readonly billing = inject(BillingService);

  private readonly _jobs = signal<UploadJob[]>([]);
  private readonly _lastFinalized = signal<{ memoryId: string; uploadSessionId: string } | null>(null);

  readonly jobs = this._jobs.asReadonly();
  /** Emits when a session was completed in the backend → detail pages can reload. */
  readonly lastFinalized = this._lastFinalized.asReadonly();

  readonly totalCount = computed(() => this._jobs().filter(j => j.status !== 'canceled').length);
  readonly doneCount = computed(() => this._jobs().filter(j => j.status === 'done').length);
  readonly failedCount = computed(() => this._jobs().filter(j => j.status === 'failed').length);
  readonly pendingCount = computed(() => this._jobs().filter(j => PENDING.has(j.status)).length);
  readonly isBusy = computed(() => this.pendingCount() > 0);

  /** 0..1, weighted by bytes. */
  readonly progress = computed(() => {
    let total = 0;
    let sent = 0;
    for (const job of this._jobs()) {
      if (job.status === 'canceled') continue;
      total += job.totalBytes;
      sent += job.status === 'done' ? job.totalBytes : job.bytesTransferred;
    }
    return total === 0 ? 0 : sent / total;
  });

  private readonly sessions = new Map<string, SessionState>();
  private readonly controllers = new Map<string, AbortController>();

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      window.addEventListener('beforeunload', event => {
        if (this.isBusy()) event.preventDefault();
      });
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Adds photos to the queue. Returns the number of queued photos. */
  enqueue(request: EnqueueRequest): number {
    const knownIds = new Set(this._jobs().map(j => j.id));
    const jobs: UploadJob[] = request.photos
      .filter(isReadyPhoto)
      .filter(photo => !knownIds.has(photo.id))
      .map(photo => ({
        id: photo.id,
        memoryId: request.memoryId,
        uploadSessionId: request.uploadSessionId,
        userId: request.userId,
        fileName: photo.file.name,
        file: photo.file,
        thumbnail: photo.thumbnail,
        width: photo.width,
        height: photo.height,
        isCover: photo.id === request.coverPhotoId,
        takenAt: photo.meta?.takenAt ?? null,
        lat: photo.meta?.lat ?? null,
        lng: photo.meta?.lng ?? null,
        status: 'queued',
        bytesTransferred: 0,
        totalBytes: photo.file.size + photo.thumbnail.size,
        attempts: 0,
      }));

    if (jobs.length === 0) return 0;

    this.sessions.set(request.uploadSessionId, { memoryId: request.memoryId, finalizing: false });
    this._jobs.update(current => [...current, ...jobs]);
    this.pump();
    return jobs.length;
  }

  retry(id: string): void {
    const job = this.find(id);
    if (job?.status !== 'failed') return;
    this.patch(id, { status: 'queued', error: undefined });
    this.pump();
  }

  retryAllFailed(): void {
    this._jobs.update(jobs =>
      jobs.map(j => (j.status === 'failed' ? { ...j, status: 'queued', error: undefined } : j)),
    );
    this.pump();
  }

  /** Cancels a queued/uploading job or dismisses a failed one. */
  cancel(id: string): void {
    const job = this.find(id);
    if (!job || !['queued', 'uploading', 'failed'].includes(job.status)) return;

    const controller = this.controllers.get(id);
    if (controller) {
      controller.abort(); // run() takes care of state + cleanup
      return;
    }

    this.patch(id, { status: 'canceled' });
    void this.discardArtifacts(id);
    void this.maybeFinalize(job.uploadSessionId);
  }

  /** Removes finished jobs (done/canceled) whose session is already completed. */
  clearFinished(): void {
    this._jobs.update(jobs =>
      jobs.filter(j => !(j.status === 'done' || j.status === 'canceled') || this.sessions.has(j.uploadSessionId)),
    );
  }

  /** Create once (e.g. as a field) – returns a new computed on every call. */
  stateForMemory(memoryId: string): Signal<MemoryUploadState> {
    return computed(() => {
      const jobs = this._jobs().filter(j => j.memoryId === memoryId && j.status !== 'canceled');
      return {
        total: jobs.length,
        done: jobs.filter(j => j.status === 'done').length,
        failed: jobs.filter(j => j.status === 'failed').length,
        busy: jobs.some(j => PENDING.has(j.status)),
      };
    });
  }

  // ── Scheduling ─────────────────────────────────────────────────────────────

  private pump(): void {
    const jobs = this._jobs();
    let free = MAX_PARALLEL_UPLOADS - jobs.filter(j => ACTIVE.has(j.status)).length;

    for (const job of jobs) {
      if (free <= 0) break;
      if (job.status !== 'queued') continue;
      free--;
      this.patch(job.id, { status: 'uploading' }); // claim slot synchronously
      void this.run(job.id);
    }
  }

  private async run(id: string): Promise<void> {
    const controller = new AbortController();
    const { signal } = controller;
    this.controllers.set(id, controller);

    try {
      for (let attempt = 1; ; attempt++) {
        this.patch(id, { status: 'uploading', attempts: attempt, error: undefined });
        try {
          await this.execute(id, signal);
          this.patch(id, { status: 'done', bytesTransferred: this.require(id).totalBytes });
          return;
        } catch (error) {
          if (signal.aborted) throw error;
          if (attempt >= MAX_ATTEMPTS || !isRetryable(error)) {
            console.error(`Upload of ${id} failed:`, error);
            this.patch(id, { status: 'failed', error: describeError(error) });
            return;
          }
          await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1), signal);
        }
      }
    } catch (error) {
      if (signal.aborted) {
        this.patch(id, { status: 'canceled' });
        await this.discardArtifacts(id);
      } else {
        console.error(`Unexpected upload error for ${id}:`, error);
        this.patch(id, { status: 'failed', error: describeError(error) });
      }
    } finally {
      this.controllers.delete(id);
      this.pump();
      const job = this.find(id);
      if (job) void this.maybeFinalize(job.uploadSessionId);
    }
  }

  /** Uploads original + thumbnail in parallel, then registers the photo. */
  private async execute(id: string, signal: AbortSignal): Promise<void> {
    const job = this.require(id);
    const folder = `memories/${job.memoryId}`;

    let originalSent = job.original ? job.file.size : 0;
    let thumbSent = job.thumb ? job.thumbnail.size : 0;
    const report = () => this.patch(id, { bytesTransferred: originalSent + thumbSent });

    const originalUpload = job.original
      ? Promise.resolve(job.original)
      : this.store(
          `${folder}/${job.id}.${fileExtension(job.file)}`,
          job.file,
          mimeType(job.file),
          {
            // same keys as before → existing detail page / billing keep working
            userId: job.userId,
            width: String(job.width),
            height: String(job.height),
            isStarred: String(job.isCover),
            clientId: job.id,
            uploadedAt: new Date().toISOString(),
          },
          bytes => { originalSent = bytes; report(); },
          signal,
        ).then(obj => { this.patch(id, { original: obj }); return obj; });

    const thumbUpload = job.thumb
      ? Promise.resolve(job.thumb)
      : this.store(
          `${folder}/thumbs/${job.id}.jpg`,
          job.thumbnail,
          'image/jpeg',
          { userId: job.userId, clientId: job.id, kind: 'thumbnail' },
          bytes => { thumbSent = bytes; report(); },
          signal,
        ).then(obj => { this.patch(id, { thumb: obj }); return obj; });

    // allSettled: never start a retry while the other half is still uploading
    const [originalResult, thumbResult] = await Promise.allSettled([originalUpload, thumbUpload]);
    if (originalResult.status === 'rejected') throw originalResult.reason;
    if (thumbResult.status === 'rejected') throw thumbResult.reason;
    if (signal.aborted) throw abortError();

    const original = originalResult.value;
    const thumb = thumbResult.value;

    this.patch(id, { status: 'registering' });
    await firstValueFrom(
      this.memoryService.registerPhoto(job.memoryId, {
        clientId: job.id,
        uploadSessionId: job.uploadSessionId,
        storagePath: original.path,
        downloadUrl: original.url,
        sizeBytes: original.sizeBytes,
        thumbPath: thumb.path,
        thumbUrl: thumb.url,
        thumbSizeBytes: thumb.sizeBytes,
        width: job.width,
        height: job.height,
        mimeType: mimeType(job.file),
        originalFileName: job.fileName,
        isCover: job.isCover,
        takenAt: job.takenAt,
        lat: job.lat,
        lng: job.lng,
      }),
    );
  }

  private store(
    path: string,
    data: Blob,
    contentType: string,
    customMetadata: Record<string, string>,
    onProgress: (bytes: number) => void,
    signal: AbortSignal,
  ): Promise<StoredObject> {
    return new Promise<StoredObject>((resolve, reject) => {
      if (signal.aborted) return reject(abortError());

      const subscription = this.fileUpload.uploadBlob(path, data, { contentType, customMetadata }).subscribe({
        next: event => {
          onProgress(event.bytesTransferred);
          if (event.result) resolve(event.result);
        },
        error: reject,
      });

      signal.addEventListener(
        'abort',
        () => {
          subscription.unsubscribe(); // cancels the Firebase task
          reject(abortError());
        },
        { once: true },
      );
    });
  }

  // ── Session handling ───────────────────────────────────────────────────────

  /** Completes the session once no job is pending or failed. */
  private async maybeFinalize(uploadSessionId: string): Promise<void> {
    const session = this.sessions.get(uploadSessionId);
    if (!session || session.finalizing) return;

    const jobs = this._jobs().filter(j => j.uploadSessionId === uploadSessionId);
    // failed jobs keep the session open until the user retries or dismisses them
    if (jobs.some(j => PENDING.has(j.status) || j.status === 'failed')) return;

    session.finalizing = true;
    try {
      const response = await firstValueFrom(
        this.memoryService.completeUploadSession(session.memoryId, uploadSessionId, {
          uploadedClientIds: jobs.filter(j => j.status === 'done').map(j => j.id),
          canceledClientIds: jobs.filter(j => j.status === 'canceled').map(j => j.id),
        }),
      );
      this.billing.setStorageUsedBytes(response.storageUsedBytes);
      this.sessions.delete(uploadSessionId);
      this._lastFinalized.set({ memoryId: session.memoryId, uploadSessionId });
    } catch (error) {
      // The backend cleanup job closes abandoned sessions – nothing is lost.
      console.error(`Completing upload session ${uploadSessionId} failed:`, error);
      this.sessions.delete(uploadSessionId);
    }
  }

  private async discardArtifacts(id: string): Promise<void> {
    const job = this.find(id);
    if (!job) return;
    const paths = [job.original?.path, job.thumb?.path].filter((p): p is string => !!p);
    if (paths.length === 0) return;
    await this.fileUpload.deleteUnregisteredObjects(paths);
    this.patch(id, { original: undefined, thumb: undefined });
  }

  // ── State helpers ──────────────────────────────────────────────────────────

  private find(id: string): UploadJob | undefined {
    return this._jobs().find(j => j.id === id);
  }

  private require(id: string): UploadJob {
    const job = this.find(id);
    if (!job) throw new Error(`Upload job ${id} not found`);
    return job;
  }

  private patch(id: string, changes: Partial<UploadJob>): void {
    this._jobs.update(jobs => jobs.map(j => (j.id === id ? { ...j, ...changes } : j)));
  }
}

// ── Error classification ─────────────────────────────────────────────────────

function storageCode(error: unknown): string | undefined {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' && code.startsWith('storage/') ? code : undefined;
}

function isRetryable(error: unknown): boolean {
  if (error instanceof HttpErrorResponse) {
    return error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500;
  }
  const code = storageCode(error);
  if (code) return RETRYABLE_STORAGE_CODES.has(code);
  return true; // unknown error (e.g. network glitch) → one more try
}

function describeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'Network problem';
    if (error.status === 409) return 'Not enough storage';
    if (error.status === 403) return 'No permission';
    return 'Server error';
  }
  switch (storageCode(error)) {
    case 'storage/unauthorized': return 'No permission to upload';
    case 'storage/quota-exceeded': return 'Storage quota exceeded';
    case 'storage/retry-limit-exceeded': return 'Network problem';
    default: return 'Upload failed';
  }
}
