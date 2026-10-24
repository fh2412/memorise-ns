// Pure helpers for the download page.
import { HttpErrorResponse } from '@angular/common/http';
import { MemoryPhoto } from '@models/memory-photo.model';

export interface Uploader {
  userId: string;
  name: string;
  avatarUrl: string | null;
  photoCount: number;
}

/** Empty filter = everyone. */
export function filterByUploaders(photos: MemoryPhoto[], uploaderIds: ReadonlySet<string>): MemoryPhoto[] {
  return uploaderIds.size === 0 ? photos : photos.filter(p => uploaderIds.has(p.uploadedBy));
}

export function sumBytes(photos: MemoryPhoto[]): number {
  return photos.reduce((sum, p) => sum + p.sizeBytes, 0);
}

/** Uploaders sorted by photo count (most first). Names come from the user lookup. */
export function buildUploaders(
  photos: MemoryPhoto[],
  users: ReadonlyMap<string, { name: string; profilepic: string | null }>,
): Uploader[] {
  const counts = new Map<string, number>();
  for (const p of photos) counts.set(p.uploadedBy, (counts.get(p.uploadedBy) ?? 0) + 1);

  return [...counts.entries()]
    .map(([userId, photoCount]) => ({
      userId,
      photoCount,
      name: users.get(userId)?.name ?? 'Unknown',
      avatarUrl: users.get(userId)?.profilepic ?? null,
    }))
    .sort((a, b) => b.photoCount - a.photoCount || a.name.localeCompare(b.name));
}

/** Keeps only selected ids that are still in `photos` (after filter changes / deletions). */
export function intersectSelection(selected: ReadonlySet<string>, photos: MemoryPhoto[]): Set<string> {
  const visible = new Set(photos.map(p => p.photoId));
  return new Set([...selected].filter(id => visible.has(id)));
}

/**
 * What a click on the download button downloads:
 * selection → those ids · no selection + no filter → null (= all) · no selection + filter → visible ids
 */
export function downloadTarget(
  selected: ReadonlySet<string>,
  visible: MemoryPhoto[],
  filterActive: boolean,
): string[] | null {
  if (selected.size > 0) return [...selected];
  return filterActive ? visible.map(p => p.photoId) : null;
}

const TAKEN_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/** Capture day if known (wall-clock string, no time zone shift), else upload day. */
export function photoDateLabel(photo: Pick<MemoryPhoto, 'takenAt' | 'createdAt'>): string {
  const match = photo.takenAt ? /^(\d{4})-(\d{2})-(\d{2})/.exec(photo.takenAt) : null;
  if (match) return TAKEN_FORMAT.format(new Date(+match[1], +match[2] - 1, +match[3]));
  const uploaded = new Date(photo.createdAt);
  return Number.isNaN(uploaded.getTime()) ? '' : `Uploaded ${TAKEN_FORMAT.format(uploaded)}`;
}

export function describeDownloadError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const code = (error.error as { code?: string } | null)?.code;
    if (error.status === 0) return 'No connection. Please try again.';
    if (code === 'NO_PHOTOS') return 'These photos no longer exist.';
    if (error.status === 403) return 'You don\'t have access to these photos.';
    if (error.status === 429) return 'Too many downloads in a short time. Please wait a moment.';
  }
  return 'The download could not be started. Please try again.';
}
