import { Component, EventEmitter, Output } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-welcome-page',
    templateUrl: './welcome-page.component.html',
    styleUrls: ['./welcome-page.component.scss'],
    imports: [MatButton]
})
export class WelcomePageComponent {
  @Output() closeWelcomePage = new EventEmitter<void>();

  closeWelcomePageHandler(): void {
    this.closeWelcomePage.emit();
  }
}
