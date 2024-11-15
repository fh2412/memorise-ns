import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmationDialogData } from '../_dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-logout-button',
  templateUrl: './logout-button.component.html',
  styleUrls: ['./logout-button.component.scss']
})
export class LogoutButtonComponent {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private dialog: MatDialog
  ) {}

  /**
   * Handles the click event for logout, displaying a confirmation dialog.
   */
  onLogoutClick(): void {
    const dialogRef = this.openConfirmationDialog();

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.logout();
      }
    });
  }

  /**
   * Logs the user out and navigates to the login page. Handles errors gracefully.
   */
  private logout(): void {
    this.afAuth.signOut()
      .then(() => {
        this.router.navigate(['/login']);
      })
      .catch((error: unknown) => {
        console.error('Error during logout:', error);
        // Optional: Add user feedback or error tracking here.
      });
  }

  /**
   * Opens a confirmation dialog and returns the dialog reference.
   * @returns The MatDialogRef for the confirmation dialog.
   */
  private openConfirmationDialog() {
    const confirmationData: ConfirmationDialogData = this.getConfirmationDialogData();

    return this.dialog.open(ConfirmDialogComponent, {
      width: '430px',
      data: confirmationData,
    });
  }

  /**
   * Provides the configuration data for the confirmation dialog.
   * @returns The confirmation dialog data object.
   */
  private getConfirmationDialogData(): ConfirmationDialogData {
    return {
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out?'
    };
  }
}
