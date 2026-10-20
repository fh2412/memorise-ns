// ─────────────────────────────────────────────────────────────────────────────
// Photo picker + upload queue models
// Every photo is addressed by its `id` (client-generated UUID) – never by index.
// The same id is used as Storage file name and as `clientId` in the backend.
// ─────────────────────────────────────────────────────────────────────────────
import { PhotoMeta } from '@models/photo-metadata.model';

export type PickedPhotoStatus = 'processing' | 'ready' | 'error';

/** A photo selected in the PhotoPickerComponent. */
export interface PickedPhoto {
  id: string;
  /** Untouched original – uploaded in full quality. */
  file: File;
  status: PickedPhotoStatus;
  /** Object URL of the thumbnail. Owned (and revoked) by the picker. */
  previewUrl: string | null;
  /** Small JPEG (long edge 640px), used for preview AND uploaded as thumbnail. */
  thumbnail: Blob | null;
  /** Orientation-corrected dimensions of the original. */
  width: number;
  height: number;
  /** EXIF data (capture time, GPS). null if none found or not a JPEG. */
  meta: PhotoMeta | null;
  error?: string;
}

export type ReadyPhoto = PickedPhoto & { status: 'ready'; thumbnail: Blob };

export function isReadyPhoto(photo: PickedPhoto): photo is ReadyPhoto {
  return photo.status === 'ready' && photo.thumbnail !== null;
}

// ── Upload queue ─────────────────────────────────────────────────────────────

export type UploadJobStatus =
  | 'queued'
  | 'uploading'
  | 'registering'
  | 'done'
  | 'failed'
  | 'canceled';

/** A file stored successfully in Firebase Storage. */
export interface StoredObject {
  path: string;
  url: string;
  sizeBytes: number;
}

export interface UploadJob {
  /** = PickedPhoto.id = backend clientId */
  id: string;
  memoryId: string;
  uploadSessionId: string;
  userId: string;
  fileName: string;
  file: File;
  thumbnail: Blob;
  width: number;
  height: number;
  isCover: boolean;
  takenAt: string | null;
  lat: number | null;
  lng: number | null;
  status: UploadJobStatus;
  bytesTransferred: number;
  /** original + thumbnail */
  totalBytes: number;
  attempts: number;
  error?: string;
  /** Artifacts already stored – a retry skips these steps. */
  original?: StoredObject;
  thumb?: StoredObject;
}

// ── Backend DTOs ─────────────────────────────────────────────────────────────

/** POST /memories/:memoryId/upload-sessions */
export interface CreateUploadSessionRequest {
  expectedFileCount: number;
  expectedBytes: number;
}

export interface UploadSessionResponse {
  uploadSessionId: string;
  /** Storage used incl. the new reservation. */
  storageUsedBytes: number;
}

/** POST /memories/:memoryId/photos  (idempotent per clientId) */
export interface RegisterPhotoRequest {
  clientId: string;
  uploadSessionId: string;
  storagePath: string;
  downloadUrl: string;
  sizeBytes: number;
  thumbPath: string;
  thumbUrl: string;
  thumbSizeBytes: number;
  width: number;
  height: number;
  mimeType: string;
  originalFileName: string;
  isCover: boolean;
  /** Local wall-clock time "YYYY-MM-DDTHH:mm:ss" (no time zone). */
  takenAt?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface RegisterPhotoResponse {
  photoId: string;
  pictureCount: number;
}

/** POST /memories/:memoryId/upload-sessions/:sessionId/complete */
export interface CompleteUploadSessionRequest {
  uploadedClientIds: string[];
  canceledClientIds: string[];
}

export interface CompleteUploadSessionResponse {
  status: 'complete' | 'incomplete';
  storageUsedBytes: number;
  pictureCount: number;
}
