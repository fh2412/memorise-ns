import { CreateMemoryLocation } from '@models/memory-create.model';

/** Exactly one field: existing friend, existing placeholder (kept) or new placeholder. */
export type EditCrewEntry =
  | { userId: string; placeholderId?: never; placeholderName?: never }
  | { placeholderId: string; userId?: never; placeholderName?: never }
  | { placeholderName: string; userId?: never; placeholderId?: never };

/** PUT /memories/:id */
export interface UpdateMemoryRequest {
  title: string;
  description: string | null;
  /** "YYYY-MM-DD" */
  startDate: string | null;
  endDate: string | null;
  /** Omit = unchanged · null = remove · object = new location */
  location?: CreateMemoryLocation | null;
  /** Omit = unchanged · array = complete desired crew */
  crew?: EditCrewEntry[];
}

export interface UpdateMemoryResult {
  memoryId: number;
  locationId: number;
  placeholders: MemoryPlaceholder[];
}

export interface MemoryPlaceholder {
  id: string;
  name: string;
}

/** POST /memories/:id/photos/delete */
export interface DeletePhotosResult {
  deletedPhotoIds: string[];
  pictureCount: number;
  coverPhotoId: string | null;
  /** Requester's storage after the deletion (null if unknown). */
  storageUsedBytes: number | null;
}
