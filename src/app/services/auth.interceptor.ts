import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Auth } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

const API_PREFIX = environment.apiUrl.replace(/\/+$/, '');

/** Only our own API gets the ID token – never third-party URLs (Maps, Storage, etc.). */
function isApiRequest(url: string): boolean {
  return url === API_PREFIX || url.startsWith(`${API_PREFIX}/`);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  if (!isApiRequest(req.url)) return next(req);

  return from(
    auth.authStateReady().then(() => auth.currentUser?.getIdToken() ?? null)
  ).pipe(
    switchMap((token) =>
      next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req)
    )
  );
};
