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
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      }
    });
  }



  title = 'memorise-ns';
}
