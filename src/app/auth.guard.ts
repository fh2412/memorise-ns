import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate {

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.afAuth.authState.pipe(
      take(1), // Take only one value and unsubscribe
      switchMap(user => {
        if (user) {
          return of(true); // User is authenticated, allow access
        }

        // User is not authenticated, save URL and redirect to login
        const url: string = this.router.url;
        return this.handleLogin(url);
      })
    );
  }

  private handleLogin(url: string) {
    // Replace with your actual login logic (redirect to login component/service)
    return this.router.navigate(['/login'], { queryParams: { redirectUrl: url } });
  }
}
