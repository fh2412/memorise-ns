import { Component } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/compat/auth';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  loggedIn: boolean | undefined;

  constructor(private afAuth: AngularFireAuth) {}
  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        // User is signed in.
        console.log(user);
        // You can access user details like user.email, user.displayName, etc.
        this.loggedIn = true;
      } else {
        // No user is signed in.
        this.loggedIn = false;
      }
    });
  }



  title = 'memorise-ns';
}
