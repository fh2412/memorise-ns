// Calendar-day helpers for memory dates (no time component, no time zone).

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/**
 * memory_date / memory_end_date → local midnight of that calendar day.
 * - "YYYY-MM-DD" (recommended backend format) is parsed as a LOCAL date.
 *   new Date("2026-06-03") would be UTC midnight → shows Jun 2 west of UTC.
 * - Full ISO timestamps (current mysql2 default) fall back to new Date().
 */
export function parseMemoryDate(value: string | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === '') return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : startOfDay(value);
  }

  const match = DATE_ONLY.exec(value);
  if (match) return new Date(+match[1], +match[2] - 1, +match[3]);

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

export function formatDateRange(start: Date, end: Date | null): string {
  if (!end || sameDay(start, end)) return DATE_FORMAT.format(start);
  return DATE_FORMAT.formatRange(start, end);
}

export function sameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return a === b;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
