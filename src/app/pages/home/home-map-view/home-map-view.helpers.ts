// Pure helpers for the home map (no Angular, no google namespace → unit-testable).
import { MapMemory } from '@models/memory-map.model';
import { formatDateRange, parseMemoryDate } from '../../../utils/memory-dates';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapMemoryView extends MapMemory {
  /** Stable object → markers don't re-render on change detection. */
  position: LatLng;
  dateLabel: string;
  place: string;
  /** Small image for pins/lists: thumbnail, fallback full cover, else null. */
  thumb: string | null;
}

export function toView(memory: MapMemory): MapMemoryView {
  const start = parseMemoryDate(memory.startDate);
  const end = parseMemoryDate(memory.endDate);
  return {
    ...memory,
    position: { lat: memory.lat, lng: memory.lng },
    dateLabel: start ? formatDateRange(start, end) : '',
    place: placeLabel(memory.city, memory.country),
    thumb: memory.coverThumbUrl || memory.coverUrl || null,
  };
}

export function placeLabel(city: string | null, country: string | null): string {
  if (city && country) return `${city}, ${country}`;
  return city || country || '';
}

/** Same rule as the home search: title contains the term (case-insensitive). */
export function filterBySearch<T extends Pick<MapMemory, 'title'>>(memories: T[], term: string): T[] {
  const needle = term.trim().toLocaleLowerCase();
  return needle ? memories.filter(m => m.title.toLocaleLowerCase().includes(needle)) : memories;
}

/** Pinned first, then newest first. */
export function sortForList<T extends Pick<MapMemory, 'isPinned' | 'startDate' | 'memoryId'>>(memories: T[]): T[] {
  return [...memories].sort((a, b) =>
    Number(b.isPinned) - Number(a.isPinned)
    || b.startDate.localeCompare(a.startDate)
    || b.memoryId - a.memoryId,
  );
}

/** Up to `count` memories for a cluster photo stack, newest on top (= first). */
export function stackOrder<T extends Pick<MapMemory, 'startDate' | 'memoryId'>>(memories: T[], count = 3): T[] {
  return [...memories]
    .sort((a, b) => b.startDate.localeCompare(a.startDate) || b.memoryId - a.memoryId)
    .slice(0, count);
}

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** Bounding box of all points (null for an empty list). */
export function boundsOf(points: LatLng[]): Bounds | null {
  if (points.length === 0) return null;
  let north = -90, south = 90, east = -180, west = 180;
  for (const p of points) {
    north = Math.max(north, p.lat);
    south = Math.min(south, p.lat);
    east = Math.max(east, p.lng);
    west = Math.min(west, p.lng);
  }
  return { north, south, east, west };
}

export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** All points within `maxMeters` (diagonal of their bounding box) → zooming can't split them. */
export function isSameSpot(points: LatLng[], maxMeters = 75): boolean {
  const b = boundsOf(points);
  if (!b || points.length < 2) return false;
  return distanceMeters({ lat: b.north, lng: b.west }, { lat: b.south, lng: b.east }) <= maxMeters;
}

/** Order-independent id list → used to refit the map only when the visible set changes. */
export function idsSignature(memories: Pick<MapMemory, 'memoryId'>[]): string {
  return memories.map(m => m.memoryId).sort((a, b) => a - b).join(',');
}
