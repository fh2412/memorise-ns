// feedback-button.component.ts
import { Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FeedbackDialogComponent } from '../_dialogs/feedback-dialog/feedback-dialog.component';

@Component({
  selector: 'app-feedback-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatDialogModule],
  template: `
  <div class="theme-controls">
    Raise Feedback:
  <button 
      matIconButton 
      aria-label="Feedback button"
      class="feedback-button"
      (click)="openFeedbackDialog()">
      <mat-icon>feedback</mat-icon>
    </button>
    </div>
  `,
  styles: [`
    .theme-controls {
    display: flex;
    align-items: center;
    padding-left: 22px;
    border-radius: 12px;
    background: var(--mat-sys-surface);
    border: 1px solid var(--mat-sys-outline);
    font-weight: 500;
    margin-bottom: 4px;
  }
    .feedback-button {

    }
  `]
})
export class FeedbackButtonComponent {
  constructor(private dialog: MatDialog) { }

  openFeedbackDialog(): void {
    this.dialog.open(FeedbackDialogComponent, {
      width: '500px',
      panelClass: 'feedback-dialog'
    });
  }
}