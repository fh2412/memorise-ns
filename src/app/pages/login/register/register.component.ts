import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;

  @Output() cancelRegistration = new EventEmitter<void>();

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  register() {
    // Handle registration logic here
    if (this.registerForm.valid) {
      const email = this.registerForm.get('email')!.value;
      const password = this.registerForm.get('password')!.value;
      // Handle user registration using Firebase or any other auth service
    }
  }
}
