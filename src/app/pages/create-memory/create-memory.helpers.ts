// Pure helpers for the create page (no Angular → easy to unit test).
import { CreateMemoryRequest } from '@models/memory-create.model';
import { PhotoInsights } from '@models/photo-metadata.model';
import { CrewMember } from '@models/userInterface.model';
import { toCrewPayload, toIsoDate } from '../../utils/memory-create.mapper';

// WICHTIG: Importiere die Funktionen hier aus deinem utils-File 
// (Pfade ggf. an deine Ordnerstruktur anpassen, z.B. '../utils/...'):
import { sameDay } from 'app/utils/memory-dates';

export type LocationSource = 'map' | 'photos' | 'activity';

export interface SelectedLocation {
  lat: number;
  lng: number;
  city: string;
  country: string;
  countryCode: string;
  source: LocationSource;
  /** Existing location row (activity) → sent as `locationId`, no new row is created. */
  locationId?: number;
}

// ── Request ──────────────────────────────────────────────────────────────────

export interface CreateMemoryDraft {
  requestId: string;
  title: string;
  description: string;
  start: Date | null;
  end: Date | null;
  location: SelectedLocation | null;
  activityId: number | null;
  crew: CrewMember[];
  currentUserId: string | null;
  upload: { fileCount: number; bytes: number } | null;
}

export function buildCreateRequest(draft: CreateMemoryDraft): CreateMemoryRequest {
  const startDate = toIsoDate(draft.start);
  const loc = draft.location;

  const request: CreateMemoryRequest = {
    requestId: draft.requestId,
    title: draft.title.trim(),
    description: draft.description.trim() || null,
    startDate,
    endDate: startDate ? toIsoDate(draft.end ?? draft.start) : null,
    activityId: draft.activityId,
    crew: toCrewPayload(draft.crew, draft.currentUserId),
    upload: draft.upload && draft.upload.fileCount > 0
      ? { expectedFileCount: draft.upload.fileCount, expectedBytes: draft.upload.bytes }
      : null,
  };

  if (loc?.locationId) {
    request.locationId = loc.locationId;
  } else if (loc) {
    request.location = {
      lat: loc.lat,
      lng: loc.lng,
      city: loc.city || undefined,
      country: loc.country || undefined,
      countryCode: loc.countryCode || undefined,
    };
  }
  return request;
}

// ── Suggestions ──────────────────────────────────────────────────────────────

export interface FormSnapshot {
  title: string;
  titlePristine: boolean;
  start: Date | null;
  end: Date | null;
  datesPristine: boolean;
}

export interface ApplicableSuggestions {
  title: string | null;
  dateRange: { start: Date; end: Date } | null;
  location:SelectedLocation | null;
}

/**
 * Which photo suggestions may be applied without overwriting user input:
 * - title / dates: only if the user hasn't edited them (pristine) or they're empty
 * - location: only if none is set or the current one came from photos (never over map/activity)
 * Suggestions equal to the current value are dropped → banner disappears after "Apply".
 */
export function applicableSuggestions(
  insights: PhotoInsights | null,
  form: FormSnapshot,
  location: SelectedLocation | null,
  today = new Date(),
): ApplicableSuggestions {
  const result: ApplicableSuggestions = { title: null, dateRange: null, location: null };
  if (!insights) return result;

  const suggestedTitle = insights.titleSuggestion;
  if (suggestedTitle && (form.titlePristine || !form.title.trim()) && suggestedTitle !== form.title) {
    result.title = suggestedTitle;
  }

  if (insights.dateRange && (form.datesPristine || !form.start)) {
    // Photo time zone can be ahead of ours → never suggest a day after today (past-date validator).
    const start = clampToToday(insights.dateRange.start, today);
    const end = clampToToday(insights.dateRange.end, today);
    if (!sameDay(start, form.start) || !sameDay(end, form.end ?? form.start)) {
      result.dateRange = { start, end };
    }
  }

  const suggested = insights.location;
  if (suggested && (!location || location.source === 'photos')) {
    const candidate: SelectedLocation = {
      lat: suggested.markerPosition.lat,
      lng: suggested.markerPosition.lng,
      city: suggested.parsedLocation?.city ?? '',
      country: suggested.parsedLocation?.country ?? '',
      countryCode: suggested.parsedLocation?.countryCode ?? '',
      source: 'photos',
    };
    if (!location || location.lat !== candidate.lat || location.lng !== candidate.lng) {
      result.location = candidate;
    }
  }

  return result;
}

export function hasSuggestions(s: ApplicableSuggestions): boolean {
  return !!(s.title || s.dateRange || s.location);
}

// ── Formatting ───────────────────────────────────────────────────────────────

export function placeLabel(loc: Pick<SelectedLocation, 'city' | 'country' | 'lat' | 'lng'>): string {
  if (loc.city && loc.country) return `${loc.city}, ${loc.country}`;
  return loc.city || loc.country || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
}

function clampToToday(date: Date, today: Date): Date {
  const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return date > midnight ? midnight : date;
}