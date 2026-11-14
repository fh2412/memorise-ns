import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { DEFAULT_AUTHENTICATED_URL } from './return-url';

/**
 * Protects app routes. Unauthenticated users go to /login?returnUrl=...
 * (replaces localStorage 'redirectUrl' / 'pendingMemoryJoinToken' – a /memory/join/<token>
 * link is simply the returnUrl).
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  await auth.authStateReady();
  if (auth.currentUser) return true;

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Keeps signed-in users away from /login and /register. */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  await auth.authStateReady();
  return auth.currentUser ? router.parseUrl(DEFAULT_AUTHENTICATED_URL) : true;
};
