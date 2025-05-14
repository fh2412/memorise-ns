import { Injectable } from '@angular/core'; // Import Injectable
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { UserService } from '../services/userService';
import { MemoryService } from '../services/memory.service';

@Injectable({
  providedIn: 'root'
})
class Permissions {
  constructor(private memoryService: MemoryService) {}

  async canActivateEditMemory(loggedInuserId: string, memoryId: string): Promise<boolean> {
    if (!loggedInuserId || !memoryId) {
      console.error('User ID or Memory ID is missing for permission check.');
      return false;
    }
    return await this.memoryService.checkMemoriseUserPermission(memoryId, loggedInuserId);
  }
}

@Injectable({
  providedIn: 'root'
})
export class MemoryEditorGuard implements CanActivate {
  constructor(private permissions: Permissions, private userService: UserService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const loggedInUserId = await this.userService.getLoggedInUserId();
    const memoryId = route.params['id'] || route.paramMap.get('id'); 
    if (!loggedInUserId || !memoryId) {
      console.error('MemoryEditorGuard: Logged in user ID or Memory ID not found.');
    }
    else if(await this.permissions.canActivateEditMemory(loggedInUserId, memoryId)){
      return true;
    }
    return this.router.createUrlTree(['/home']);
  }
}