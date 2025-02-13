import { Component, inject, OnDestroy } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false
})
export class AppComponent implements OnDestroy {
  private auth: Auth = inject(Auth);
  authState$ = authState(this.auth);
  authStateSubscription: Subscription;

  loggedIn: boolean | undefined;
  isFirstTimeUser = false;

  constructor() {
    this.authStateSubscription = this.authState$.subscribe((aUser: User | null) => {
      if (aUser && !this.isFirstTimeUser) {
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      } 
      console.log(aUser, this.loggedIn);
    })
  }

  ngOnDestroy() {
    // when manually subscribing to an observable remember to unsubscribe in ngOnDestroy
    this.authStateSubscription.unsubscribe();
  }

  title = 'memorise-ns';
}
