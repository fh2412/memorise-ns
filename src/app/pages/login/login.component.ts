import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthenticationService } from '@services/authentication.service';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { RegisterComponent } from './register/register.component';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatButton, MatProgressSpinner, RegisterComponent]
})
export class LoginComponent implements OnInit {
  private authenticationService = inject(AuthenticationService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  form!: FormGroup;
  isActionInProgress = false;
  isRegistering = false;

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm() {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  login(): void {
    if (this.form.invalid) {
      this.showSnackBar('Please provide valid email and password.', 'OK');
      return;
    }

    this.toggleActionState(true);

    this.authenticationService.signIn(this.form.value).subscribe({
      next: () => this.handleLoginSuccess(),
      error: (error) => this.handleError(error, 'Login failed.')
    });
  }

  recoverPassword(): void {
    if (!this.form.value.email) {
      this.showSnackBar('Please enter a valid email address.', 'OK');
      return;
    }

    this.toggleActionState(true);

    this.authenticationService.recoverPassword(this.form.value.email).subscribe({
      next: () => {
        this.toggleActionState(false);
        this.showSnackBar('Password recovery email sent. Check your inbox.', 'OK');
      },
      error: (error) => this.handleError(error, 'Password recovery failed.')
    });
  }

  toggleRegister(): void {
    this.isRegistering = !this.isRegistering;
  }

  private handleLoginSuccess(): void {
    const pendingToken = localStorage.getItem('pendingMemoryJoinToken');
    const redirectUrl = localStorage.getItem('redirectUrl') || '/';
    localStorage.setItem('isFirstTimeUser', 'false');
    if (pendingToken) {
      localStorage.removeItem('pendingMemoryJoinToken');
      localStorage.removeItem('redirectUrl');

      this.router.navigate(['/memory/join', pendingToken]);
    } else if (redirectUrl) {
      localStorage.removeItem('redirectUrl');
      this.router.navigateByUrl(redirectUrl);
    } else {
      this.router.navigate(['/home']);
    }
  }

  private handleError(error: Error, defaultMessage: string): void {
    const message = error?.message === "Firebase: Error (auth/invalid-credential)."
      ? "Username or Password is wrong!"
      : error?.message || defaultMessage;

    this.showSnackBar(message, 'OK');
    this.toggleActionState(false);
  }


  private showSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, { duration: 5000 });
  }

  private toggleActionState(isInProgress: boolean): void {
    this.isActionInProgress = isInProgress;
  }
}