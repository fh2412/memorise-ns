// ─────────────────────────────────────────────────────────────────────────────
// Pure aggregation functions for photo metadata (no Angular, easy to unit test).
// ─────────────────────────────────────────────────────────────────────────────
import { ParsedLocation } from '@models/geocoder-response.model';
import { DateRangeSuggestion, LatLng } from '@models/photo-metadata.model';

export const CLUSTER_RADIUS_KM = 25;
/** Main cluster must hold at least this share of GPS photos to name the city (else country). */
export const CITY_SHARE_THRESHOLD = 0.7;

const MIN_YEAR = 1990;
const OUTLIER_WINDOW_DAYS = 60;
/** Only drop outliers if at least this share of photos remains. */
const MIN_KEEP_SHARE = 0.8;
const MIN_PHOTOS_FOR_OUTLIERS = 5;
const DAY_MS = 86_400_000;

export interface PhotoPoint {
  id: string;
  takenAt: string | null;
  lat: number | null;
  lng: number | null;
}

export interface PhotoCluster {
  /** Arithmetic centre of all members. */
  center: LatLng;
  /** Real photo position closest to the centre – used for reverse geocoding. */
  representative: LatLng;
  photoIds: string[];
  /** Share of all GPS photos (0..1). */
  share: number;
}

export interface PhotoSummary {
  photoCount: number;
  photosWithDate: number;
  photosWithGps: number;
  dateRange: DateRangeSuggestion | null;
  mainCluster: PhotoCluster | null;
  clusterCount: number;
}

export function summarizePhotos(points: PhotoPoint[], now = new Date()): PhotoSummary {
  const dates = points.map(p => p.takenAt).filter((d): d is string => !!d);
  const located = points.filter(
    (p): p is PhotoPoint & LatLng => p.lat !== null && p.lng !== null,
  );
  const clusters = clusterLocations(located);

  return {
    photoCount: points.length,
    photosWithDate: dates.length,
    photosWithGps: located.length,
    dateRange: computeDateRange(dates, now),
    mainCluster: clusters[0] ?? null,
    clusterCount: clusters.length,
  };
}

// ── Dates ────────────────────────────────────────────────────────────────────

/**
 * Earliest → latest capture day. Ignores impossible dates (before 1990, in the future)
 * and isolated outliers (e.g. one photo with a wrong camera clock).
 * @param takenAts local wall-clock strings "YYYY-MM-DDTHH:mm:ss"
 */
export function computeDateRange(takenAts: string[], now = new Date()): DateRangeSuggestion | null {
  const latestAllowed = dayNumberOfDate(now) + 1; // +1: time zone of the photo can be ahead
  const valid = takenAts
    .map(dayNumber)
    .filter((d): d is number => d !== null && d >= dayNumberOfYear(MIN_YEAR) && d <= latestAllowed)
    .sort((a, b) => a - b);

  if (valid.length === 0) return null;

  let kept = valid;
  if (valid.length >= MIN_PHOTOS_FOR_OUTLIERS) {
    const median = valid[Math.floor(valid.length / 2)];
    const window = valid.filter(d => Math.abs(d - median) <= OUTLIER_WINDOW_DAYS);
    if (window.length >= valid.length * MIN_KEEP_SHARE) kept = window;
  }

  const first = kept[0];
  const last = kept[kept.length - 1];
  return {
    start: localDateFromDayNumber(first),
    end: localDateFromDayNumber(last),
    days: last - first + 1,
    photoCount: kept.length,
    excludedCount: takenAts.length - kept.length,
  };
}

/** "YYYY-MM-DD…" → days since epoch (UTC-based, only used for calendar math). */
function dayNumber(takenAt: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(takenAt);
  if (!match) return null;
  return Date.UTC(+match[1], +match[2] - 1, +match[3]) / DAY_MS;
}

function dayNumberOfDate(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS;
}

function dayNumberOfYear(year: number): number {
  return Date.UTC(year, 0, 1) / DAY_MS;
}

/** Local midnight of the calendar day → no time zone shift in the datepicker. */
function localDateFromDayNumber(day: number): Date {
  const utc = new Date(day * DAY_MS);
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

// ── Locations ────────────────────────────────────────────────────────────────

/**
 * Greedy clustering: each point joins the nearest cluster whose centre is within `radiusKm`.
 * Returns clusters sorted by size (largest first).
 */
export function clusterLocations(
  points: (LatLng & { id: string })[],
  radiusKm = CLUSTER_RADIUS_KM,
): PhotoCluster[] {
  interface Acc { latSum: number; lngSum: number; members: (LatLng & { id: string })[] }
  const clusters: Acc[] = [];
  const centre = (c: Acc): LatLng => ({ lat: c.latSum / c.members.length, lng: c.lngSum / c.members.length });

  for (const point of points) {
    let best: Acc | null = null;
    let bestDistance = Infinity;
    for (const cluster of clusters) {
      const distance = distanceKm(point, centre(cluster));
      if (distance <= radiusKm && distance < bestDistance) {
        best = cluster;
        bestDistance = distance;
      }
    }
    if (best) {
      best.latSum += point.lat;
      best.lngSum += point.lng;
      best.members.push(point);
    } else {
      clusters.push({ latSum: point.lat, lngSum: point.lng, members: [point] });
    }
  }

  return clusters
    .sort((a, b) => b.members.length - a.members.length)
    .map(cluster => {
      const center = centre(cluster);
      const representative = cluster.members.reduce((closest, m) =>
        distanceKm(m, center) < distanceKm(closest, center) ? m : closest,
      );
      return {
        center,
        representative: { lat: representative.lat, lng: representative.lng },
        photoIds: cluster.members.map(m => m.id),
        share: cluster.members.length / points.length,
      };
    });
}

/** Haversine distance in km. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// ── Title ────────────────────────────────────────────────────────────────────

/** City if most photos are around it, otherwise the country. */
export function choosePlaceName(location: ParsedLocation | null, share: number): string | null {
  if (!location) return null;
  if (share >= CITY_SHARE_THRESHOLD && location.city) return location.city;
  return location.country || location.city || null;
}

/**
 * "A day in Salzburg" · "Weekend in Salzburg" · "5 days in Croatia" ·
 * "Memories from Vienna" · "June 3, 2026" · "4 days · June 2026"
 */
export function suggestTitle(range: DateRangeSuggestion | null, place: string | null): string | null {
  if (!range) return place ? `Memories from ${place}` : null;

  if (place) {
    if (range.days === 1) return `A day in ${place}`;
    if (isWeekendTrip(range)) return `Weekend in ${place}`;
    return `${range.days} days in ${place}`;
  }

  if (range.days === 1) {
    return range.start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  if (isWeekendTrip(range)) return `Weekend · ${monthLabel(range.start, range.end)}`;
  return `${range.days} days · ${monthLabel(range.start, range.end)}`;
}

/** 2–3 days that include a Saturday or Sunday. */
function isWeekendTrip(range: DateRangeSuggestion): boolean {
  if (range.days < 2 || range.days > 3) return false;
  for (let i = 0; i < range.days; i++) {
    const weekday = (range.start.getDay() + i) % 7;
    if (weekday === 0 || weekday === 6) return true;
  }
  return false;
}

function monthLabel(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameYear && start.getMonth() === end.getMonth()) {
    return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  if (sameYear) {
    return `${start.toLocaleDateString('en-US', { month: 'long' })} – ${end.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  }
  const short = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  return `${short(start)} – ${short(end)}`;
}
