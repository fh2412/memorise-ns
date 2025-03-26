import { Component, Input } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
  constructor(private location: Location) { }
  @Input() text = "Back";

  cancelCreation(): void {
    this.location.back();
  }
}
