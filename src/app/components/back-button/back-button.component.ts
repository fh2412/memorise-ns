import { Component, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.scss',
  imports: [
    MatButtonModule,
    MatIconModule
]
})
export class BackButtonComponent {
  private location = inject(Location);
  private router = inject(Router);


  readonly text = input("Back");

  cancelCreation(): void {
    const state = history.state;
    
    if (state && state.fromInvite) {
      this.router.navigate(['/home']);
    } else {
      this.location.back();
    }
  }
}
