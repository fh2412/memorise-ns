import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from '../services/userService';
import { MemoriseUser } from './userInterface.model';

@Injectable({
  providedIn: 'root'
})
export class UserResolver implements Resolve<MemoriseUser | null> {

  constructor(private userService: UserService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<MemoriseUser | null> {
    const userId = route.paramMap.get('userId');
    const loggedInUserId = this.userService.getLoggedInUserId();


    if (!userId || userId != loggedInUserId) {
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