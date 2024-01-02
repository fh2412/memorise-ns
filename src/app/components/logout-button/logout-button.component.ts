import { Component } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout-button',
  templateUrl: './logout-button.component.html',
  styleUrls: ['./logout-button.component.css']
})
export class LogoutButtonComponent {

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  logout() {
    this.afAuth.signOut().then(() => {
      // Successful logout
      this.router.navigate(['/login']); // Redirect to login page after logout
    }).catch(error => {
      // Handle logout error
      console.error('Logout Error:', error);
    });
  }
}
