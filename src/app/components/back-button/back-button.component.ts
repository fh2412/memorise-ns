import { Component, Input } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.scss',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class BackButtonComponent {
  constructor(
    private location: Location,
    private router: Router
  ) { }

  @Input() text = "Back";

  cancelCreation(): void {
    const state = history.state;
    
    if (state && state.fromInvite) {
      this.router.navigate(['/home']);
    } else {
      this.location.back();
    }
  }
}
