// feedback-button.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FeedbackDialogComponent } from '../_dialogs/feedback-dialog/feedback-dialog.component';

@Component({
  selector: 'app-feedback-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <button 
      mat-fab 
      color="primary" 
      aria-label="Feedback button"
      class="feedback-button"
      (click)="openFeedbackDialog()">
      <mat-icon>feedback</mat-icon>
    </button>
  `,
  styles: [`
    .feedback-button {
      position: fixed;
      bottom: 20px;
      right: 40px;
      z-index: 100;
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