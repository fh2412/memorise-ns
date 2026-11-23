// trip-workspace/link-preview/link-utils.ts
import { LinkPayload, LinkPreview } from '@models/planBooking.model';

export function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Reads { url, preview } from an item's payload (link items and bookings). */
export function readLinkPayload(item: { payload: Record<string, unknown> | null } | null | undefined): LinkPayload | null {
  const url = item?.payload?.['url'];
  if (typeof url !== 'string' || !isHttpUrl(url)) return null;
  const preview = item?.payload?.['preview'];
  return {
    url,
    preview: preview && typeof preview === 'object' ? (preview as LinkPreview) : null,
  };
}

export function formatPrice(cents: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

/**
 * "480", "480,50", "1.234,50", "1,234.50" → cents.
 * '' → null (no price), invalid → undefined.
 */
export function parsePriceInput(raw: string): number | null | undefined {
  const s = raw.trim().replace(/\s/g, '');
  if (!s) return null;
  if (!/^\d[\d.,]*$/.test(s)) return undefined;
  const lastSep = Math.max(s.lastIndexOf(','), s.lastIndexOf('.'));
  const decimals = lastSep >= 0 ? s.length - lastSep - 1 : 0;
  let normalized: string;
  if (lastSep >= 0 && decimals <= 2) {
    normalized = s.slice(0, lastSep).replace(/[.,]/g, '') + '.' + s.slice(lastSep + 1);
  } else {
    normalized = s.replace(/[.,]/g, ''); // thousands separators only
  }
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000) return undefined;
  return Math.round(n * 100);
}
