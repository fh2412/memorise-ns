// POST /memories – one request creates memory, location, crew and (optionally) an upload session.

/** Exactly one of the two fields. */
export type CreateMemoryCrewEntry =
  | { userId: string; placeholderName?: never }
  | { placeholderName: string; userId?: never };

export interface CreateMemoryLocation {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  /** ISO 3166-1 alpha-2, e.g. "AT" */
  countryCode?: string;
}

export interface CreateMemoryRequest {
  /** UUID per form instance – a retry with the same id never creates a second memory. */
  requestId: string;
  title: string;
  description?: string | null;
  /** Calendar day "YYYY-MM-DD" (no time zone). Omit for planned memories without date. */
  startDate?: string | null;
  /** Defaults to startDate. */
  endDate?: string | null;
  /** New location … */
  location?: CreateMemoryLocation | null;
  /** … or an existing one (e.g. from an activity). Never both. */
  locationId?: number | null;
  activityId?: number | null;
  crew?: CreateMemoryCrewEntry[];
  /** Reserve storage in the same transaction → no memory is created when storage is full. */
  upload?: { expectedFileCount: number; expectedBytes: number } | null;
}

export interface CreateMemoryResult {
  /** false = repeated request, the existing memory was returned. */
  created: boolean;
  memoryId: number;
  locationId: number;
  activityId: number;
  placeholders: { id: string; name: string }[];
  /** Only set when `upload` was sent. */
  uploadSessionId: string | null;
  /** Storage incl. the new reservation (null without upload / on replay). */
  storageUsedBytes: number | null;
}
