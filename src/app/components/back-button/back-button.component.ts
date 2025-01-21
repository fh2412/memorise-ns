import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.scss'
})
export class BackButtonComponent {
  constructor(private location: Location) {}  
  @Input() text = "Back";

  cancelCreation(): void{
    this.location.back();
  }
}
