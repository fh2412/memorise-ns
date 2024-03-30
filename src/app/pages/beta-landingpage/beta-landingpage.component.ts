import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BetaUserService } from '../../services/user-registration.service';

@Component({
  selector: 'app-beta-landingpage',
  templateUrl: './beta-landingpage.component.html',
  styleUrl: './beta-landingpage.component.scss'
})
export class BetaLandingpageComponent {
  email = new FormControl('', [Validators.required, Validators.email]);

  constructor(private router: Router, private request: BetaUserService) {}

  onSubmit() {
    if(this.email?.value){
      this.request.sendRegistrationRequest(this.email.value).subscribe(
        (result) => {
          this.router.navigate(['thank-you']);
        },
        (error) => {
          console.error('Error:', error);
        }
      );
    }
  }
  
  get isEmailValid() {
    return this.email.valid;
  }
}
