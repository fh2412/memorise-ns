import { Component } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/compat/auth';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  loggedIn: boolean | undefined;
  isFirstTimeUser: boolean = false;

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
