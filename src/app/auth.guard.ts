// auth.guard.ts - Enhanced to handle pending join requests
import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { authState } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate {
  private auth = inject(Auth);
  private router = inject(Router);


  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return authState(this.auth).pipe(
      take(1),
      map(user => !!user),
      tap(loggedIn => {
        if (!loggedIn) {
          // Store the full URL including any query params and the path
          const fullUrl = state.url;
          
          // Check if this is a memory join link
          if (fullUrl.includes('/memory/join/')) {
            // Extract the token from the URL
            const urlParts = fullUrl.split('/memory/join/');
            if (urlParts.length > 1) {
              const token = urlParts[1].split('?')[0]; // Get token, ignore query params
              localStorage.setItem('pendingMemoryJoinToken', token);
            }
          }
          
          // Store the redirect URL
          localStorage.setItem('redirectUrl', fullUrl);
          this.router.navigate(['/login']);
        }
      })
    );
  }
}