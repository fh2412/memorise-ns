import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../services/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss']
})
export class WelcomePageComponent {
  
  @Input() email: string = "Back";
  @Input() password: string = "Back";


  constructor(private router: Router, private authenticationService: AuthenticationService, private snackBar: MatSnackBar) { }

  closeWelcomePage() {
    localStorage.setItem('isFirstTimeUser', 'false');
    this.login();
  }
  
  login(){
    this.authenticationService.signIn({
      email: this.email,
      password: this.password
    }).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: error => {
        this.snackBar.open(error.message, "OK", {
          duration: 5000
        })
      }
    }); 
  }
}
