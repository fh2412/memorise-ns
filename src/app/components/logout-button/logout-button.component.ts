import { Component } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { ConfirmDialogComponent, ConfirmationDialogData } from '../_dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-logout-button',
  templateUrl: './logout-button.component.html',
  styleUrls: ['./logout-button.component.css']
})
export class LogoutButtonComponent {

  constructor(private afAuth: AngularFireAuth, private router: Router, private dialog: MatDialog) {}

  logout() {
    this.afAuth.signOut().then(() => {
      // Successful logout
      this.router.navigate(['/login']); // Redirect to login page after logout
    }).catch(error => {
      // Handle logout error
      console.error('Logout Error:', error);
    });
  }

  onLogoutClick() {
    const confirmationData: ConfirmationDialogData = {
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out?'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: confirmationData,
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      console.log("DIALOG CLOSED!", confirmed);
      if (confirmed) {
        this.logout();
      } 
    });
  }
}
