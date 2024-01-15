import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordDialogComponent } from '../_dialogs/change-password-dialog/change-password-dialog.component';

@Component({
  selector: 'app-change-password-button',
  templateUrl: './change-password-button.component.html',
  styleUrls: ['./change-password-button.component.css']
})
export class ChangePasswordButtonComponent {

  constructor(private dialog: MatDialog) {}

  openChangePasswordDialog() {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '400px' // Adjust the width as needed
    });

    // You can subscribe to dialog events if needed
    // dialogRef.afterClosed().subscribe(result => {
    //   // Handle dialog close event
    // });
  }
}
