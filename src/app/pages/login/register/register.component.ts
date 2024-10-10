import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../services/authentication.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../../services/userService';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSigningIn: boolean = false;
  isFirstTimeUser: boolean = false;


  @Output() cancelRegistration = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private authenticationService: AuthenticationService, private snackBar: MatSnackBar, private userService: UserService) {
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
        next: async () => {
          this.isSigningIn = !this.isSigningIn;
          localStorage.setItem('isFirstTimeUser', 'true');
          await this.createUser();
          this.isFirstTimeUser = localStorage.getItem('isFirstTimeUser') === 'true';
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

  async createUser(){
    this.userService.createUser(this.registerForm.value.email).subscribe(
      response => {
        console.log('User created successfully:', response);
        // Handle success response (e.g., show a success message or redirect)
      },
      error => {
        console.error('Error creating user:', error);
        // Handle error response (e.g., show an error message)
      }
    );
  }
}
