const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function timeAgo(iso: string, now: number): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '';
  const sec = Math.round((t - now) / 1000);
  const abs = Math.abs(sec);
  if (abs < 45) return 'just now';
  if (abs < 3_600) return rtf.format(Math.round(sec / 60), 'minute');
  if (abs < 86_400) return rtf.format(Math.round(sec / 3_600), 'hour');
  if (abs < 7 * 86_400) return rtf.format(Math.round(sec / 86_400), 'day');
  return new Date(t).toLocaleDateString();
}