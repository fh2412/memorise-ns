// Pure helpers for the detail page (no Angular DI → easy to unit test).
import { HttpErrorResponse } from '@angular/common/http';
import { ImageWithMetadata, MemoryPhoto } from '@models/memory-photo.model';
import { UploadJob } from '@models/photo-upload.model';
import { formatDateRange, parseMemoryDate } from '../../utils/memory-dates';

export const PREVIEW_TILE_COUNT = 5;

export type PageState = 'loading' | 'ready' | 'not-found' | 'forbidden' | 'error';

/** Always exactly `count` tiles; missing photos become null (gray placeholder). */
export function previewTiles<T>(photos: T[], count = PREVIEW_TILE_COUNT): (T | null)[] {
  return Array.from({ length: count }, (_, i) => photos[i] ?? null);
}

/** Crew without the creator → +1 for the creator. */
export function peopleLabel(crewCount: number): string {
  return crewCount > 0 ? `${crewCount + 1} people` : 'Solo memory';
}

export interface MemoryDates {
  start: Date;
  end: Date;
  label: string;
}

/** null for planned memories without a date. */
export function memoryDates(
  startValue: string | Date | null | undefined,
  endValue: string | Date | null | undefined,
): MemoryDates | null {
  const start = parseMemoryDate(startValue);
  if (!start) return null;
  const parsedEnd = parseMemoryDate(endValue);
  const end = parsedEnd && parsedEnd >= start ? parsedEnd : start;
  return { start, end, label: formatDateRange(start, end) };
}

/** Gallery / download page still expect the old Storage-based shape. */
export function toImageWithMetadata(photo: MemoryPhoto): ImageWithMetadata {
  return {
    url: photo.downloadUrl,
    thumbUrl: photo.thumbUrl,
    photoId: photo.photoId,
    width: photo.width,
    height: photo.height,
    created: photo.createdAt,
    size: photo.sizeBytes,
    userId: photo.uploadedBy,
  };
}

export function pageStateForError(error: unknown): PageState {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 404 || error.status === 400) return 'not-found';
    if (error.status === 403) return 'forbidden';
  }
  return 'error';
}

export interface UploadProgress {
  total: number;
  done: number;
  failed: number;
  busy: boolean;
  /** 0..100, weighted by bytes */
  percent: number;
}

export function uploadProgressFor(jobs: UploadJob[], memoryId: string): UploadProgress | null {
  const relevant = jobs.filter(j => j.memoryId === memoryId && j.status !== 'canceled');
  if (relevant.length === 0) return null;

  let sent = 0;
  let total = 0;
  for (const job of relevant) {
    total += job.totalBytes;
    sent += job.status === 'done' ? job.totalBytes : job.bytesTransferred;
  }

  return {
    total: relevant.length,
    done: relevant.filter(j => j.status === 'done').length,
    failed: relevant.filter(j => j.status === 'failed').length,
    busy: relevant.some(j => j.status === 'queued' || j.status === 'uploading' || j.status === 'registering'),
    percent: total === 0 ? 0 : Math.round((sent / total) * 100),
  };
}
