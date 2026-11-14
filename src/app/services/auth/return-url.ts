export const DEFAULT_AUTHENTICATED_URL = '/home';

const AUTH_PAGES = /^\/(login|register)(?:[/?#]|$)/;

/**
 * Only allows app-internal paths as redirect target (prevents open redirects like
 * "//evil.com", "/\\evil.com", "https://evil.com" or "javascript:").
 */
export function sanitizeReturnUrl(raw: string | null | undefined): string {
  if (!raw || raw.length > 2048) return DEFAULT_AUTHENTICATED_URL;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return DEFAULT_AUTHENTICATED_URL;
  if (/[\u0000-\u001F\u007F]/.test(raw)) return DEFAULT_AUTHENTICATED_URL;
  if (AUTH_PAGES.test(raw)) return DEFAULT_AUTHENTICATED_URL;
  return raw;
}
