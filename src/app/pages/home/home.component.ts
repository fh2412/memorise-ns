import { Component } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/compat/auth';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  currentUser: any;
  constructor(private afAuth: AngularFireAuth) {}

ngOnInit() {
  this.afAuth.authState.subscribe(user => {
    if (user) {
      // User is signed in.
      console.log(user);
      // You can access user details like user.email, user.displayName, etc.
      this.currentUser = user;
    } else {
      // No user is signed in.
      this.currentUser = null;
    }
  });
}
}
