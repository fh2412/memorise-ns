import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../services/authentication.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSigningIn: boolean = false;

  @Output() cancelRegistration = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private authenticationService: AuthenticationService, private router: Router, private snackBar: MatSnackBar) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  register() {
    this.isSigningIn = !this.isSigningIn;
    if (this.registerForm.valid) {
      this.authenticationService.registerNew({
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      }).subscribe({
        next: () => {
          this.login();
        },
        error: error => {
          this.isSigningIn = !this.isSigningIn;
          this.snackBar.open(error.message, "OK", {
            duration: 5000
          })
        }
      }); 
    }
  }

  login(){
    this.authenticationService.signIn({
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    }).subscribe({
      next: () => {
        // Retrieve redirect URL from query params (replace with your logic)
        const redirectUrl = localStorage.getItem('redirectUrl') || '/';
        localStorage.removeItem('redirectUrl');
        this.router.navigate([redirectUrl]);
      },
      error: error => {
        this.isSigningIn = !this.isSigningIn;
        this.snackBar.open(error.message, "OK", {
          duration: 5000
        })
      }
    }); 
  }
}
