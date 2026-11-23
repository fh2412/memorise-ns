const DAY_MS = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');

export const toUtcMs = (iso: string): number => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
export const fromUtcMs = (ms: number): string => new Date(ms).toISOString().slice(0, 10);
export const addDays = (iso: string, n: number): string => fromUtcMs(toUtcMs(iso) + n * DAY_MS);
export const diffDays = (from: string, to: string): number => Math.round((toUtcMs(to) - toUtcMs(from)) / DAY_MS);
export const isoOf = (y: number, m: number, d: number): string => `${y}-${pad(m)}-${pad(d)}`;
export const todayIso = (now = new Date()): string => isoOf(now.getFullYear(), now.getMonth() + 1, now.getDate());

const dayFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const fullFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "12 Nov – 18 Nov 2026", or "12 Nov 2026" for a single day. */
export function formatRange(start: string, end?: string | null): string {
  if (!end || end.slice(0, 10) === start.slice(0, 10)) return fullFmt.format(toUtcMs(start));
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return `${(sameYear ? dayFmt : fullFmt).format(toUtcMs(start))} – ${fullFmt.format(toUtcMs(end))}`;
}