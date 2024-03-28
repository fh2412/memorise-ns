import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-beta-landingpage',
  templateUrl: './beta-landingpage.component.html',
  styleUrl: './beta-landingpage.component.scss'
})
export class BetaLandingpageComponent {
  email = new FormControl('', [Validators.required, Validators.email]);

  constructor(private router: Router) {}

  onSubmit() {
    console.log(`Email submitted for beta access: ${this.email.value}`);
  }
  
  get isEmailValid() {
    return this.email.valid;
  }
}
