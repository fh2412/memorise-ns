import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from "firebase/auth";


@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent implements OnInit {
  @Output() updateUserPassword = new EventEmitter<any>();
  changePasswordForm: FormGroup;
  currentUser: any;

  errorMessage: string | null = null;




  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private afAuth: AngularFireAuth
  ) {
    this.changePasswordForm = new FormGroup({
      currentPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.currentUser = user;
      } else {
        this.currentUser = null;
      }
    });
  }

  submitPassword() {
    const currentPassword = this.changePasswordForm.get('currentPassword')?.value;
    const newPassword = this.changePasswordForm.get('newPassword')?.value;
    console.log(this.currentUser.email, newPassword, currentPassword);

    this.currentUser.reauthenticateWithCredential(this.currentUser.email, currentPassword)
      .then(() => {
        this.currentUser.updatePassword(newPassword)
          .then(() => {
            console.log('Password updated successfully');
            // Password updated successfully, handle success
          })
          .catch((error: any) => {
            console.error('Error updating password:', error);
            // Handle error updating password
          });
      })
      .catch((error: any) => {
        console.error('Error reauthenticating user:', error);
        // Handle error reauthenticating user
      });
    this.dialogRef.close();
  }

  closeDialog() {
    this.dialogRef.close();
  }


  changePassword() {
    const auth = getAuth();
    const user = auth.currentUser;
    const newPassword = this.changePasswordForm.get('newPassword')?.value;
    const currentPassword = this.changePasswordForm.get('currentPassword')?.value;

    if (user && currentPassword && newPassword && user.email != null) {
      // Validate new password strength (client-side)
      if (!this.validateNewPassword(newPassword)) {
        this.errorMessage = 'New password does not meet complexity requirements.';
        return; // Prevent proceeding with weak password
      } else {
        this.errorMessage = null; // Clear previous error if any
      }
    
      // Verify current password using reauthenticateWithCredential
      reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, currentPassword))
        .then(() => {
          this.errorMessage = null; // Clear previous error if any
          // Current password is correct, proceed with updatePassword
          updatePassword(user, newPassword)
            .then(() => {
              console.log('Password updated successfully!');
              this.closeDialog(); // Assuming you have a closeDialog function for the modal
            })
            .catch((error) => {
              console.error('Error updating password:', error);
              this.errorMessage = 'An error occurred while changing password.'; // Generic error message
            });
        })
        .catch((error) => {
          this.errorMessage = 'Incorrect current password or other error.'; // More generic error
        });
      }
  }
  
  // Function to validate new password strength (adjust requirements as needed)
  validateNewPassword(password: string): boolean {
    const minLength = 8; // Minimum password length
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[^\w\s]/.test(password);
  
    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSymbol
    );
  }
}
