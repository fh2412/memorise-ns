import { inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { BillingService } from './services/billing.service';
import { firstValueFrom } from 'rxjs';
import { UserService } from '@services/userService';

export function initializeUserData(): Promise<void> {
  const auth = inject(Auth);
  const userService = inject(UserService);
  const billingService = inject(BillingService);

  return (async () => {
    try {
      // Wait for auth state to be ready
      const user = await firstValueFrom(authState(auth));
      
      if (!user?.email) {
        console.warn('No authenticated user found during initialization');
        return;
      }

      const userdb = await firstValueFrom(userService.getUser(user.uid));
      
      if (userdb?.user_id) {
        userService.setLoggedInUserId(userdb.user_id);
        const useraccount = await firstValueFrom(userService.getUserAccountType(user.uid));
        billingService.setUserStorageData({
          userId: user.uid,
          accountType: useraccount.accountType,
          storageUsedBytes: useraccount.storageUsedBytes
        });
      }
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  })();
}