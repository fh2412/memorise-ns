import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '@services/userService';
//import { ChoosePlanDialogComponent } from '@components/_dialogs/choose-plan-dialog/choose-plan-dialog.component';
//import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BillingService } from '@services/billing.service';


@Component({
  selector: 'app-subscription-status',
  imports: [MatProgressBarModule, MatIconModule, MatButtonModule, DecimalPipe],
  templateUrl: './subscription-status.component.html',
  styleUrl: './subscription-status.component.scss',
})
export class SubscriptionStatusComponent implements OnInit {
  private userService = inject(UserService);
  private snackbar = inject(MatSnackBar);
  private billingService = inject(BillingService);
  //private dialog = inject(MatDialog);

  storageUsedGB = this.billingService.storageUsedGB;
  storageMaxGB = this.billingService.storageMaxGB;
  accountType = this.billingService.accountType;


  async ngOnInit(): Promise<void> {
    console.log("Account Type: ", this.accountType());
  }

  openChoosePlanComponent() {
    //FOR BETA USE I DISPLAY ONLY A SNACKBAR
    this.snackbar.open(
      'Subscriptions are not available in beta mode',
      'Close',
      {
        duration: 5000,
        horizontalPosition: 'center',
      }
    );

    /*const dialogRef = this.dialog.open(ChoosePlanDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      data: { currentPlan: this.userAccountDetails.accountType }
    });

    dialogRef.afterClosed().subscribe(selectedPlan => {
      if (selectedPlan) {
        console.log('User selected:', selectedPlan);
        // Handle plan upgrade/downgrade logic
      }
    });*/
  }
}
