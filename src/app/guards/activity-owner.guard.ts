import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivityService } from '../services/activity.service';
import { UserService } from '../services/userService';

@Injectable({
  providedIn: 'root'
})
export class ActivityOwnerGuard implements CanActivate {

  constructor(
    private activityService: ActivityService,
    private userService: UserService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot
  ): Observable<boolean | UrlTree> {
    const activityId = route.paramMap.get('id');
    const loggedInUserId = this.userService.getLoggedInUserId();

    return this.activityService.getActivityDetails(activityId!).pipe(
      map(activity => {
        if (activity.creatorId === loggedInUserId) {
          return true;
        } else {
          return this.router.createUrlTree(['/home']);
        }
      })
    );
  }
}
