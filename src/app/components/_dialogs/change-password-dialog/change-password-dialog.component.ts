import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { FirebaseError } from 'firebase/app';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent implements OnInit {
  @Output() updateUserPassword = new EventEmitter<void>();
  changePasswordForm!: FormGroup;
  currentUser: any;
  errorMessage: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private afAuth: AngularFireAuth
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      this.currentUser = user;
    });
  }

  private initializeForm(): void {
    this.changePasswordForm = new FormGroup({
      currentPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ])
    });
  }

  submitPasswordChange(): void {
    if (!this.currentUser || !this.currentUser.email) return;

    const currentPassword = this.changePasswordForm.get('currentPassword')?.value;
    const newPassword = this.changePasswordForm.get('newPassword')?.value;

    // Client-side password validation
    if (!this.validateNewPassword(newPassword)) {
      this.errorMessage = 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.';
      return;
    }

    // Reauthenticate and update password
    reauthenticateWithCredential(
      this.currentUser,
      EmailAuthProvider.credential(this.currentUser.email, currentPassword)
    )
      .then(() => {
        this.errorMessage = null;
        return updatePassword(this.currentUser, newPassword);
      })
      .then(() => {
        console.log('Password updated successfully!');
        this.dialogRef.close();
        this.updateUserPassword.emit();
      })
      .catch(error => {
        this.handleAuthError(error);
      });
  }

  private handleAuthError(error: FirebaseError): void {
    if (error.code === 'auth/wrong-password') {
      this.errorMessage = 'The current password is incorrect.';
    } else if (error.code === 'auth/weak-password') {
      this.errorMessage = 'The new password is too weak.';
    } else {
      this.errorMessage = 'An error occurred while updating the password.';
    }
    console.error('Auth error:', error);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  // Password strength validator
  private validateNewPassword(password: string): boolean {
    const minLength = 8;
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
