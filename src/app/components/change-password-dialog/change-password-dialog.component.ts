import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.css']
})
export class ChangePasswordDialogComponent implements OnInit {
  changePasswordForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private afAuth: AngularFireAuth
  ) {
    this.changePasswordForm = new FormGroup({
      currentPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  ngOnInit(): void {}

  changePassword() {
    if (this.changePasswordForm.valid) {
      const currentPassword = this.changePasswordForm.get('currentPassword')?.value;
      const newPassword = this.changePasswordForm.get('newPassword')?.value;

      // Firebase Authentication: Implement change password logic
      const user = this.afAuth.currentUser;
      if (user) {
        user.updatePassword(newPassword)
          .then(() => {
            // Password updated successfully
            this.dialogRef.close();
          })
          .catch((error: any) => {
            // Handle password update error
            console.error('Password update error:', error);
          });
      }
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
