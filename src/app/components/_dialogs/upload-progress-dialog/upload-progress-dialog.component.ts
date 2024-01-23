import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadService } from '../../../services/file-upload.service';

@Component({
  selector: 'app-upload-progress-dialog',
  templateUrl: './upload-progress-dialog.component.html',
  styleUrl: './upload-progress-dialog.component.css'
})
export class UploadProgressDialogComponent implements OnInit {
  progress: number[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { userId: string; files: File[] },
    private storageService: FileUploadService
  ) {
    // Initialize progress array with zeros
    this.progress = Array(data.files.length).fill(0);
  }

  ngOnInit() {
    this.uploadFiles();
  }

  uploadFiles() {
    this.storageService.uploadMemoryPictures(this.data.userId, this.data.files).subscribe(
      (progress: number[]) => {
        this.progress = progress;
      },
      (error) => {
        console.error('Error uploading pictures:', error);
        // Handle error, e.g., close the dialog or show an error message
      },
      () => {
        console.log('Upload completed successfully');
        // Handle completion, e.g., close the dialog or show a success message
      }
    );
  }
}
