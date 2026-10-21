const UNITS = ['KB', 'MB', 'GB', 'TB'];

export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes)) return '∞';
  if (bytes < 1024) return `${bytes} B`;

  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(decimals)} ${UNITS[unit]}`;
}
