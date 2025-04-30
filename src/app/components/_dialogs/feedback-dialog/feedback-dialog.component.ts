// feedback-dialog.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FeedbackService } from '../../../services/feedback.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-feedback-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './feedback-dialog.component.html',
  styleUrl: './feedback-dialog.component.scss',
})
export class FeedbackDialogComponent {
  feedbackForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<FeedbackDialogComponent>,
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private snackBar: MatSnackBar
  ) {
    this.feedbackForm = this.fb.group({
      type: ['bug', Validators.required],
      title: ['', Validators.required],
      path: ['', Validators.required],
      description: ['', Validators.required],
      email: ['', Validators.email],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.feedbackForm.valid) {
      console.log('Feedback submitted:', this.feedbackForm.value);

      this.feedbackService.submitFeedback(this.feedbackForm.value).subscribe({
        next: () => {
          this.snackBar.open('Your Feedback has been sent! Thanks for helping!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        },
        error: () => {
          this.snackBar.open('There was a problem sending your Feedback :(', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom'
          });
        }
      });

      this.dialogRef.close(this.feedbackForm.value);
    }
  }
}