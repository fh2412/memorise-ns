import { Component, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-comming-soon',
  imports: [MatCardModule, MatIconModule, MatButton],
  templateUrl: './comming-soon.component.html',
  styleUrl: './comming-soon.component.scss'
})
export class CommingSoonComponent {
  private snackBar = inject(MatSnackBar);

  readonly featureName = input('New Feature');
  readonly imageUrl = input('');
  readonly text = input('');

  notifyMe() {
    this.snackBar.open('You will be notified once Activities are fully available!', 'Great', { duration: 3000, verticalPosition: 'bottom' });
  }

  learnMore() {
    window.open('https://info.memorise.online');
  }
}
