import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { UserStorageData } from '@models/billing.model';
import { UserService } from '@services/userService';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';


const STORAGE_LIMITS: Record<string, number> = {
  FREE: 5,
  PRO: 50,
  UNLIMITED: -1
};

@Component({
  selector: 'app-subscription-status',
  imports: [MatProgressBarModule, MatIconModule, MatButtonModule, DecimalPipe],
  templateUrl: './subscription-status.component.html',
  styleUrl: './subscription-status.component.scss',
})
export class SubscriptionStatusComponent implements OnInit {
  private userService = inject(UserService);


  storageUsed = 0;
  userAccountDetails: UserStorageData | undefined
  loggedInUserId: string | null = null;
  maxStorage = 5;

  async ngOnInit(): Promise<void> {
    try {
      this.loggedInUserId = await this.userService.getLoggedInUserId() || '';
      this.getUserAccountDetails();
    } catch (error) {
      console.error('Error fetching logged in user ID:', error);
    }
  }

  async getUserAccountDetails() {
    if (this.loggedInUserId) {
      this.userAccountDetails = await firstValueFrom(this.userService.getUserAccountType(this.loggedInUserId));
      if (this.userAccountDetails.storageUsedBytes !== 0) {
        this.userAccountDetails.storageUsedBytes = this.userAccountDetails.storageUsedBytes / (1024 * 1024 * 1024);
      }
      this.maxStorage = STORAGE_LIMITS[this.userAccountDetails.accountType] ?? 5;
      this.storageUsed = (this.userAccountDetails.storageUsedBytes / this.maxStorage) * 100;
      if (this.userAccountDetails.accountType === 'UNLIMITED') {
        this.storageUsed = 100
      }
    }
  }

  openChoosePlanComponent() {
    throw new Error('Method not implemented.');
  }
}
