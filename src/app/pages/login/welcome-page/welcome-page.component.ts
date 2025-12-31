import { Component, output } from '@angular/core';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-welcome-page',
    templateUrl: './welcome-page.component.html',
    styleUrls: ['./welcome-page.component.scss'],
    imports: [MatButton]
})
export class WelcomePageComponent {
  readonly closeWelcomePage = output<void>();

  closeWelcomePageHandler(): void {
    // TODO: The 'emit' function requires a mandatory void argument
    this.closeWelcomePage.emit();
  }
}
