import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UserService } from '../services/userService';

@Injectable({
  providedIn: 'root'
})
export class UserResolver implements Resolve<any> {

  constructor(private userService: UserService, private router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
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
