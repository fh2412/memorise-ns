import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { authState } from '@angular/fire/auth'; // Correct import for authState
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate {

  constructor(private auth: Auth, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return authState(this.auth).pipe( // Use authState() as a function
      take(1),
      map(user => !!user),
      tap(loggedIn => {
        if (!loggedIn) {
          localStorage.setItem('redirectUrl', state.url);
          this.router.navigate(['/login']);
        }
      })
    );
  }
}