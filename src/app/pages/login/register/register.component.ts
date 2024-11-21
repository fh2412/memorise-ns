import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/userService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSigningIn = false;
  isFirstTimeUser = false;
  email: string = '';

  @Output() cancelRegistration = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  private passwordsMatchValidator(form: FormGroup): { passwordsMismatch: boolean } | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  register() {
    if (this.registerForm.invalid) {
      this.snackBar.open('Please fill out the form correctly.', 'OK', { duration: 5000 });
    }
    else {
      this.toggleSigningIn(true);

      const { email, password } = this.registerForm.value;
      this.email = this.registerForm.value.email;

      this.authenticationService.registerNew({ email, password }).subscribe({
        next: () => {
          this.createUser(email);
        },
        error: (error) => {
          this.toggleSigningIn(false);
          this.snackBar.open(error.message, 'OK', { duration: 5000 });
        }
      });
    }
  }

  private toggleSigningIn(state: boolean): void {
    this.isSigningIn = state;
  }

  handleFirstTimeUser(): void {
    const { email } = this.registerForm.value;
    this.userService.getUserByEmail(email).subscribe({
      next: () => {
        // Email exists
        this.snackBar.open('Email is already in use.', 'OK', { duration: 5000 });
      },
      error: (error) => {
        if (error.status === 404) {
          // Email does not exist
          this.isFirstTimeUser = true;
        } else {
          // Handle other errors (e.g., network issues)
          this.snackBar.open('An unexpected error occurred.', 'OK', { duration: 5000 });
          console.error(error);
        }
      }
    });
  }
  

  closeWelcomePage(): void {
    this.createUser(this.email);
    this.isFirstTimeUser = false;
  }

  private createUser(email: string): void {
    this.userService.createUser(email).subscribe({
      next: (response) => {
        this.toggleSigningIn(false);
        this.snackBar.open('Registration successful!', 'OK', { duration: 5000 });
        this.router.navigate(['/home']);
        console.log('User created successfully:', response);
      },
      error: (error) => {
        this.toggleSigningIn(false);
        console.error('Error creating user:', error);
        this.snackBar.open('Failed to complete registration. Please try again.', 'OK', { duration: 5000 });
      }
    });
  }
}
