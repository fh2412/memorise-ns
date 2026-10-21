/** One row of GET /memories/:id/photos */
export interface MemoryPhoto {
  photoId: string;
  clientId: string;
  /** Original in full quality. */
  downloadUrl: string;
  /** JPEG, long edge 640px. */
  thumbUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
  /** Local wall-clock time "YYYY-MM-DDTHH:mm:ss" or null. */
  takenAt: string | null;
  lat: number | null;
  lng: number | null;
  uploadedBy: string;
  /** ISO timestamp of the upload. */
  createdAt: string;
  isCover: boolean;
}

/**
 * Shape used by ImageGalleryService (gallery + download page).
 * Kept compatible with the old Storage-based version; thumbUrl/photoId are new and optional.
 */
export interface ImageWithMetadata {
  url: string;
  width: number;
  height: number;
  created: string;
  size: number;
  userId: string;
  thumbUrl?: string;
  photoId?: string;
}
