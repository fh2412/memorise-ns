import { HttpErrorResponse } from '@angular/common/http';
import { SOCIAL_PROVIDER_LABELS, SocialProvider } from './social-auth.strategy';

/** Thrown when a social login hits an existing account with the same email (link flow). */
export class AccountLinkRequiredError extends Error {
  constructor(readonly email: string | null, readonly provider: SocialProvider) {
    super('account-link-required');
    this.name = 'AccountLinkRequiredError';
  }
}

/** Thrown when Firebase sign-in worked but the backend user sync (POST /users/me) failed. */
export class UserSyncError extends Error {
  constructor(cause?: unknown) {
    super('user-sync-failed', { cause });
    this.name = 'UserSyncError';
  }
}

export const GENERIC_AUTH_ERROR = 'Something went wrong. Please try again.';

/** User closed/cancelled the popup – no message needed. */
const SILENT_CODES = new Set([
  'auth/popup-closed-by-user',
  'auth/cancelled-popup-request',
  'auth/user-cancelled',
]);

/** Neutral messages – do not reveal whether an account exists. */
const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/missing-password': 'Please enter your password.',
  'auth/email-already-in-use': 'We could not create an account with this email. If you already have one, sign in or reset your password.',
  'auth/weak-password': 'Your password does not meet the requirements.',
  'auth/password-does-not-meet-requirements': 'Your password does not meet the requirements.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/operation-not-allowed': 'This sign-in method is currently not available.',
  'auth/popup-blocked': 'The sign-in popup was blocked. Please allow popups and try again.',
  'auth/unauthorized-domain': 'This sign-in method is not available on this domain.',
};

export function getAuthErrorCode(error: unknown): string | null {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : null;
}

/** Maps any auth-related error to a user-facing message. Returns null if nothing should be shown. */
export function toAuthErrorMessage(error: unknown): string | null {
  if (error instanceof AccountLinkRequiredError) {
    const label = SOCIAL_PROVIDER_LABELS[error.provider];
    return `An account with this email already exists. Sign in with your existing method to link ${label}.`;
  }
  if (error instanceof UserSyncError) {
    return 'Signed in, but your profile could not be loaded. Please try again.';
  }
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return MESSAGES['auth/network-request-failed'];
    if (error.status === 429) return MESSAGES['auth/too-many-requests'];
    return GENERIC_AUTH_ERROR;
  }

  const code = getAuthErrorCode(error);
  if (code && SILENT_CODES.has(code)) return null;
  return (code && MESSAGES[code]) || GENERIC_AUTH_ERROR;
}
