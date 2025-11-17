import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    standalone: false
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authenticationService = inject(AuthenticationService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  registerForm: FormGroup;
  isSigningIn = false;
  isFirstTimeUser = false;
  email = '';

  @Output() cancelRegistration = new EventEmitter<void>();

  constructor() {
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
          this.isFirstTimeUser = true
        },
        error: () => {
          this.toggleSigningIn(false);
          this.snackBar.open('Email is already in use.', 'OK', { duration: 5000 });
        }
      });
    }
  }

  private toggleSigningIn(state: boolean): void {
    this.isSigningIn = state;
  }
  
  closeWelcomePage(): void {
    this.authenticationService.signIn(this.registerForm.value).subscribe({
      next: () => {
        this.toggleSigningIn(false);
        this.snackBar.open('Registration successful!', 'OK', { duration: 5000 });
        this.router.navigate(['/home']);
        this.isFirstTimeUser = false;
      },
      error: (error) => console.log(error, 'Login failed.')
    });
  }
}
