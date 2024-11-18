import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  isActionInProgress = false;
  isRegistering = false;

  constructor(
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

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
    console.log("setting localstorage!");
    localStorage.setItem('isFirstTimeUser', 'false');
    console.log(localStorage.getItem('isFirstTimeUser') === 'true');


    const redirectUrl = localStorage.getItem('redirectUrl') || '/';
    localStorage.removeItem('redirectUrl');
    this.router.navigate([redirectUrl]);
  }

  private handleError(error: Error, defaultMessage: string): void {
    const message = error?.message || defaultMessage;
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