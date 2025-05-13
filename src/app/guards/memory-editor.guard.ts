import { Injectable } from '@angular/core'; // Import Injectable
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
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
    console.log(loggedInuserId, memoryId);
    console.log(await this.memoryService.checkMemoriseUserPermission(memoryId, loggedInuserId));
    return await this.memoryService.checkMemoriseUserPermission(memoryId, loggedInuserId);
  }
}

@Injectable({
  providedIn: 'root'
})
export class MemoryEditorGuard implements CanActivate {
  constructor(private permissions: Permissions, private userService: UserService) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const loggedInUserId = await this.userService.getLoggedInUserId(); 
    if (!loggedInUserId) {
      console.error('MemoryEditorGuard: Logged in user ID not found.');
      return false;
    }

    const memoryId = route.params['id'] || route.paramMap.get('id');
    if (!memoryId) {
      console.error('MemoryEditorGuard: Memory ID not found in route params.');
      return false;
    }
    return this.permissions.canActivateEditMemory(loggedInUserId, memoryId);
  }
}