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
  betaTitles: string[] = [
    'We\'re in Beta!',
    'Memorise is in Early Access.',
    'Experience Memorise Before Anyone Else.',
    'Memorise: Coming Soon, Better Now (in Beta).',
    'Unlock the Power of Memorise (Beta).',
    'Never let those special moments fade away.',
    'Relive the magic of shared experiences.',
    'Make every gathering a memory that lasts.',
    'Turn fleeting moments into lasting memories.',
    'Building a memory bank for your happiest moments.'
  ];
  betaMessages: string[] = [
    'Join us as we build something special. Sign up for early access to Memorise.',
    'Get a sneak peek and help us shape the future of memoriseing. Sign up now!',
    'Our Beta is live! Secure your spot and start memorizing effectively.',
    'Be among the first to try our innovative memorization tool. Sign up for Beta access.',
    'We\'re putting Memorise to the test – join our Beta and help us refine the future of adventure finding',
    'Join the Memorise Beta and treasure them forever. Capture and cherish the laughter, love, and joy you share with friends and family.',
    'Try the Memorise Beta to keep those precious memories close. Create a lasting memory bank and revisit the joy of moments with loved ones.',
    'Sign up for the Memorise Beta and capture the beauty of time spent with friends and family. Don\'t miss a chance to cherish those special moments forever.',
    'Join the Memorise Beta! Our innovative tool helps you treasure the joy of shared experiences. Keep those beautiful moments close and relive them whenever you wish.',
  ];
  randomBetaTitle: string = "";
  randomBetaMessage: string = "";

  ngOnInit() {
    this.randomBetaTitle = this.betaTitles[Math.floor(Math.random() * this.betaTitles.length)];
    this.randomBetaMessage = this.betaMessages[Math.floor(Math.random() * this.betaMessages.length)];
  }
  
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
