/** One row of GET /memories/map (replaces MemoryMapData). */
export interface MapMemory {
  memoryId: number;
  title: string;
  /** "YYYY-MM-DD" */
  startDate: string;
  endDate: string;
  /** Full-size cover (title_pic). */
  coverUrl: string | null;
  /** 640px cover thumbnail (null for memories created before Phase 2). */
  coverThumbUrl: string | null;
  pictureCount: number;
  lat: number;
  lng: number;
  city: string | null;
  country: string | null;
  isOwner: boolean;
  /** Pinned to the logged-in user's profile. */
  isPinned: boolean;
}
