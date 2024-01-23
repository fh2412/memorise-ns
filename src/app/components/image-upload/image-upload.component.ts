import { Component, Input, OnInit } from '@angular/core';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileUploadService } from '../../services/file-upload.service';
import { UploadProgressDialogComponent } from '../_dialogs/upload-progress-dialog/upload-progress-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {
  @Input() userId: any;
  @Input() memoryData: any;

  selectedFiles?: FileList;
  progressInfos: any[] = [];
  message: string[] = [];

  previews: string[] = [];
  imageInfos?: Observable<any>;

  constructor(private uploadService: FileUploadService, private dialog: MatDialog) { }


  selectFiles(event: any): void {
    this.message = [];
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
  
    this.previews = [];
    if (this.selectedFiles && this.selectedFiles[0]) {
      const numberOfFiles = this.selectedFiles.length;
      for (let i = 0; i < numberOfFiles; i++) {
        const reader = new FileReader();
  
        reader.onload = (e: any) => {
          console.log(e.target.result);
          this.previews.push(e.target.result);
        };
  
        reader.readAsDataURL(this.selectedFiles[i]);
      }
    }
  }
  

  uploadFiles(): void {
    this.message = [];
  
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.upload(i, this.selectedFiles[i]);
      }
    }
  }

  upload(idx: number, file: File): void {
    this.openUploadDialog();
  }
  
  
  ngOnInit(): void {
    this.imageInfos = this.uploadService.getFiles();
  }

  openUploadDialog() {
    const filesArray: File[] = Array.from(this.selectedFiles || []);
    const dialogRef = this.dialog.open(UploadProgressDialogComponent, {
      width: '300px',
      disableClose: true, // Prevent closing the dialog by clicking outside
      data: { userId: this.userId, files: filesArray },
    });

    // Subscribe to the dialog's afterClosed event to handle actions after the dialog is closed
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed with result:', result);
      // Handle any actions after the dialog is closed
      if(true/*if result is successful*/ ) {
        this.createMemory();
      }
    });
  }
  
  createMemory() {
    if (this.memoryData.valid) {
      const memoryData = this.memoryData.value;
      console.log(memoryData);
      /*this.memoryService.createMemory(memoryData).subscribe(
        (response) => {
          console.log('Memory created successfully:', response);
          // Handle success (e.g., show a success message to the user)
        },
        (error) => {
          console.error('Error creating memory:', error);
          // Handle error (e.g., show an error message to the user)
        }
      );*/
    } else {
      // Handle form validation errors if needed
      console.error('Form is not valid. Please fill in all required fields.');
    }
  }
}



