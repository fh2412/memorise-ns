import { Injectable, inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from '../services/userService';
import { MemoriseUser } from './userInterface.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileResolver implements Resolve<MemoriseUser | null> {
  private userService = inject(UserService);
  private router = inject(Router);


  resolve(route: ActivatedRouteSnapshot): Observable<MemoriseUser | null> {
    const userId = route.paramMap.get('userId');

    if (!userId) {
      this.router.navigate(['/home']);
      return of(null);
    }


    return this.userService.getUser(userId).pipe(
      map(user => {
        if (user) {
          return user;
        } else {
          this.router.navigate(['/home']);
          return null;
        }
      }),
      catchError(() => {
        this.router.navigate(['/home']);
        return of(null);
      })
    );
  }
}