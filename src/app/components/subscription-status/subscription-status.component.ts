import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { AccountType, UserStorageData } from '@models/billing.model';
import { UserService } from '@services/userService';

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
  maxStorage = 5000000000;

  async ngOnInit(): Promise<void> {
    try {
      this.loggedInUserId = await this.userService.getLoggedInUserId() || '';
      this.getUserAccountDetails();
    } catch (error) {
      console.error('Error fetching logged in user ID:', error);
    }
  }

  getUserAccountDetails() {
    if (this.loggedInUserId) {
      this.userAccountDetails = {
        userId: this.loggedInUserId,
        accountType: AccountType.FREE,
        storageUsedBytes: 2400000000,
      }
      this.storageUsed = (this.userAccountDetails.storageUsedBytes / this.maxStorage) * 100;
      if(this.userAccountDetails.accountType === 'UNLIMITED'){
        this.storageUsed = 100
      }
    }
  }

  openChoosePlanComponent() {
    throw new Error('Method not implemented.');
  }
}
