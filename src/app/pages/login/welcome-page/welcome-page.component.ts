import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-welcome-page',
    templateUrl: './welcome-page.component.html',
    styleUrls: ['./welcome-page.component.scss'],
    standalone: false
})
export class WelcomePageComponent {
  @Output() closeWelcomePage = new EventEmitter<void>();

  closeWelcomePageHandler(): void {
    this.closeWelcomePage.emit();
  }
}
