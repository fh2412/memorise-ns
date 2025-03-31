import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-upload-activity-dialog',
  templateUrl: './upload-activity-dialog.component.html',
  styleUrl: './upload-activity-dialog.component.scss',
  imports: [
    MatProgressSpinnerModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class UploadActivityDialogComponent {
  progress = 0;
  currentStepLabel = 'Starting...';
  error: string | null = null;
  
  constructor(
    public dialogRef: MatDialogRef<UploadActivityDialogComponent>
  ) { }
  
  updateProgress(value: number, label: string): void {
    this.progress = value;
    this.currentStepLabel = label;
  }
  
  showError(error: Error): void {
    this.error = error.message || 'An error occurred during activity creation';
  }
}
