// trip-workspace/bookings/booking-utils.ts
import { BookingData, BookingKind } from '@models/planBooking.model';

const FALLBACK_ZONES = [
  'UTC', 'Europe/Vienna', 'Europe/Berlin', 'Europe/Zurich', 'Europe/Rome', 'Europe/Paris', 'Europe/Madrid',
  'Europe/Lisbon', 'Europe/London', 'Europe/Amsterdam', 'Europe/Prague', 'Europe/Budapest', 'Europe/Zagreb',
  'Europe/Athens', 'Europe/Istanbul', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo', 'Australia/Sydney',
];

/** All IANA zones the browser knows (≈ 420). */
export const TIME_ZONES: string[] = (() => {
  const intl = Intl as unknown as { supportedValuesOf?: (key: string) => string[] };
  try {
    const zones = intl.supportedValuesOf?.('timeZone');
    return zones?.length ? [...zones, ...(zones.includes('UTC') ? [] : ['UTC'])] : FALLBACK_ZONES;
  } catch {
    return FALLBACK_ZONES;
  }
})();
const ZONE_SET = new Set(TIME_ZONES);

export function browserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function isKnownTimeZone(tz: string): boolean {
  return ZONE_SET.has(tz);
}

/** Case-insensitive search; "new york" finds America/New_York. */
export function filterTimeZones(query: string, limit = 50): string[] {
  const q = query.trim().toLowerCase().replace(/\s+/g, '_');
  if (!q || ZONE_SET.has(query)) return TIME_ZONES.slice(0, limit);
  return TIME_ZONES.filter(z => z.toLowerCase().includes(q)).slice(0, limit);
}

/** "Europe/Rome" → "Rome", "America/New_York" → "New York". */
export function shortTz(tz: string): string {
  return (tz.split('/').pop() ?? tz).replace(/_/g, ' ');
}

const localFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
});

/** Formats a local wall-clock time without any time zone conversion. */
export function formatLocal(local: string): string {
  const [date, time = '00:00'] = local.split('T');
  const [y, m, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  return localFmt.format(Date.UTC(y, m - 1, d, h, mi));
}

/**
 * Stay / activity: "12 Aug, 15:00 → 15 Aug, 10:00 (Rome)"
 * Transport:       "12 Aug, 10:00 (Vienna) → 12 Aug, 11:30 (London)"
 * The zone is only shown if it differs from the viewer's own zone.
 */
export function formatBookingWhen(b: BookingData): string | null {
  const mine = browserTimeZone();
  const zone = (tz: string | null) => (tz && tz !== mine ? ` (${shortTz(tz)})` : '');

  if (b.kind === 'transport') {
    const start = b.starts_at ? formatLocal(b.starts_at) + zone(b.start_tz) : null;
    const end = b.ends_at ? formatLocal(b.ends_at) + zone(b.end_tz ?? b.start_tz) : null;
    if (start && end) return `${start} → ${end}`;
    return start ?? (end ? `arrives ${end}` : null);
  }

  const start = b.starts_at ? formatLocal(b.starts_at) : null;
  const end = b.ends_at ? formatLocal(b.ends_at) : null;
  const tz = zone(b.start_tz ?? b.end_tz);
  if (start && end) return `${start} → ${end}${tz}`;
  if (start) return `${start}${tz}`;
  return end ? `until ${end}${tz}` : null;
}

export const KIND_LABELS: Record<BookingKind, {
  title: string; provider: string; when: string; start: string; end: string;
}> = {
  stay:      { title: 'Accommodation', provider: 'Booked via (e.g. Booking.com)', when: 'Check-in & check-out', start: 'Check-in',  end: 'Check-out' },
  transport: { title: 'Title (e.g. Flight to Rome)', provider: 'Booked via', when: 'Departure & arrival', start: 'Departure', end: 'Arrival' },
  activity:  { title: 'Activity', provider: 'Booked via', when: 'Time', start: 'Start', end: 'End' },
};
