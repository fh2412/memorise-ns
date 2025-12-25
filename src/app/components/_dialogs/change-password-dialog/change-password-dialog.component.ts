import { Component, EventEmitter, inject, OnDestroy, Output } from '@angular/core';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators, ReactiveFormsModule } from '@angular/forms';
import { FirebaseError } from 'firebase/app';
import { Auth, User, user, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatInput, MatError, MatSuffix, MatHint } from '@angular/material/input';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-change-password-dialog',
    templateUrl: './change-password-dialog.component.html',
    styleUrls: ['./change-password-dialog.component.scss'],
    imports: [MatDialogTitle, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatInput, MatError, MatIconButton, MatSuffix, MatIcon, MatHint, MatDialogActions, MatButton, MatDialogClose]
})
export class ChangePasswordDialogComponent implements OnDestroy {
  dialogRef = inject<MatDialogRef<ChangePasswordDialogComponent>>(MatDialogRef);

  private auth: Auth = inject(Auth);
  private snackBar = inject(MatSnackBar);
  
  user$ = user(this.auth);
  userSubscription: Subscription;
  currentUser!: User;
  
  @Output() updateUserPassword = new EventEmitter<void>();
  
  changePasswordForm!: FormGroup;
  errorMessage: string | null = null;
  isSubmitting = false;
  hideCurrentPassword = true;
  hideNewPassword = true;
  
  passwordStrength = {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false
  };
  
  constructor() {
    this.userSubscription = this.user$.subscribe((aUser: User | null) => {
      if (aUser) {
        this.currentUser = aUser;
      }
    });
    
    this.initializeForm();
  }
  
  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
  
  private initializeForm(): void {
    this.changePasswordForm = new FormGroup({
      currentPassword: new FormControl('', [
        Validators.required
      ]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        this.createPasswordStrengthValidator()
      ])
    });
    
    // Listen for password changes to update strength indicators
    this.changePasswordForm.get('newPassword')?.valueChanges.subscribe(
      (password: string) => this.updatePasswordStrength(password)
    );
  }
  
  private createPasswordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return null;
      }
      
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSymbol = /[^\w\s]/.test(value);
      const isLongEnough = value.length >= 8;
      
      const passwordValid = hasUpperCase && hasLowerCase && hasNumber && hasSymbol && isLongEnough;
      
      return !passwordValid ? { weakPassword: true } : null;
    };
  }
  
  private updatePasswordStrength(password: string): void {
    this.passwordStrength = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^\w\s]/.test(password)
    };
  }
  
  async submitPasswordChange(): Promise<void> {
    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }
    
    if (!this.currentUser || !this.currentUser.email) {
      this.errorMessage = 'User authentication error. Please sign in again.';
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = null;
    
    const currentPassword = this.changePasswordForm.get('currentPassword')?.value;
    const newPassword = this.changePasswordForm.get('newPassword')?.value;
    
    try {
      // First reauthenticate the user
      await reauthenticateWithCredential(
        this.currentUser,
        EmailAuthProvider.credential(this.currentUser.email, currentPassword)
      );
      
      // Then update the password
      await updatePassword(this.currentUser, newPassword);
      
      // Success! Close dialog and show notification
      this.dialogRef.close(true);
      this.updateUserPassword.emit();
      this.snackBar.open('Password updated successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    } catch (error) {
      this.handleAuthError(error as FirebaseError);
    } finally {
      this.isSubmitting = false;
    }
  }
  
  private handleAuthError(error: FirebaseError): void {
    switch (error.code) {
      case 'auth/wrong-password':
        this.errorMessage = 'Current password is incorrect.';
        this.changePasswordForm.get('currentPassword')?.setErrors({ incorrect: true });
        break;
      case 'auth/weak-password':
        this.errorMessage = 'The new password is too weak. Please choose a stronger password.';
        this.changePasswordForm.get('newPassword')?.setErrors({ weakPassword: true });
        break;
      case 'auth/requires-recent-login':
        this.errorMessage = 'This operation requires recent authentication. Please log in again.';
        break;
      case 'auth/too-many-requests':
        this.errorMessage = 'Too many unsuccessful attempts. Please try again later.';
        break;
      default:
        this.errorMessage = `An error occurred!`;
        if(error.code === 'auth/invalid-credential'){
          this.errorMessage = `Current Password is wrong!`;  
        }
        console.error('Auth error:', error);
    }
  }
  
  getPasswordHint(): string {
    if (this.changePasswordForm.get('newPassword')?.pristine) {
      return 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.';
    }
    return '';
  }
  
  getErrorMessage(controlName: string): string {
    const control = this.changePasswordForm.get(controlName);
    
    if (!control?.errors || control.pristine) {
      return '';
    }
    
    if (controlName === 'currentPassword' && control.hasError('required')) {
      return 'Current password is required';
    } else if (controlName === 'currentPassword' && control.hasError('incorrect')) {
      return 'Current password is incorrect';
    } else if (controlName === 'newPassword') {
      if (control.hasError('required')) {
        return 'New password is required';
      } else if (control.hasError('minlength')) {
        return 'Password must be at least 8 characters';
      } else if (control.hasError('weakPassword')) {
        return 'Password doesn\'t meet complexity requirements';
      }
    }
    
    return 'Invalid input';
  }
}