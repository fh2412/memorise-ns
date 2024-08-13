import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  templateUrl: './back-button.component.html',
  styleUrl: './back-button.component.scss'
})
export class BackButtonComponent {
  constructor(private router: Router){}
  
  @Input() text: string = "Back";

  cancelCreation(): void{
    this.router.navigate(['/home']);
  }
}
