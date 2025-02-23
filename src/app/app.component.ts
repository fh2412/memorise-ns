import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Auth, authState, User } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { environment } from '../environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false
})
export class AppComponent implements OnDestroy, OnInit {
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
    })
  }

  ngOnDestroy() {
    // when manually subscribing to an observable remember to unsubscribe in ngOnDestroy
    this.authStateSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.loadGoogleMaps();
  }

  private loadGoogleMaps() {
    if (document.getElementById('google-maps-script')) return;

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleApiKey}&v=weekly`;
    script.defer = true;
    script.async = true;

    document.head.appendChild(script);
  }


  title = 'memorise-ns';
}
