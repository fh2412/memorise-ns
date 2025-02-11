import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false
})
export class AppComponent implements OnInit {
  loggedIn: boolean | undefined;
  isFirstTimeUser = false;

  constructor(private afAuth: AngularFireAuth) {}
  ngOnInit() {
    this.isFirstTimeUser = localStorage.getItem('isFirstTimeUser') === 'true';
    console.log("first time user: ", this.isFirstTimeUser);
    this.afAuth.authState.subscribe(user => {
      if (user && !this.isFirstTimeUser) {
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      }
    });
  }

  title = 'memorise-ns';
}
