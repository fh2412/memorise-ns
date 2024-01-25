import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FileUploadService } from '../../services/file-upload.service';
import { UploadProgressDialogComponent } from '../_dialogs/upload-progress-dialog/upload-progress-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MemoryService } from '../../services/memory.service';
import { Router } from '@angular/router';
import { response } from 'express';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {
  @Input() userId: any;
  @Input() memoryData: any;
  @Input() friends: any;
  @Input() emails: any;


  selectedFiles?: FileList;
  progressInfos: any[] = [];
  message: string[] = [];

  previews: string[] = [];
  imageInfos?: Observable<any>;

  constructor(private uploadService: FileUploadService, private dialog: MatDialog, private memoryService: MemoryService, private router: Router,) { }


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
      this.upload();
    }
  }

  upload(): void {
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
      this.createMemory(result);
    });
  }
  
  createMemory(result: string) {
    if (this.memoryData.valid) {
      const memoryData = this.memoryData.value;
      memoryData.firestore_bucket_url = result;
  
      this.memoryService.createMemory(memoryData).subscribe(
        (response: { message: string, memoryId: any }) => {
          console.log('Memory created successfully:', response.memoryId[0]?.insertId);
          
          const friendData = { emails: this.emails, memoryId: response.memoryId[0]?.insertId };
  
          this.memoryService.addFriendToMemory(friendData).subscribe(
            (friendResponse) => {
              console.log('Friend added to memory successfully:', friendResponse);
              // Handle success (e.g., show a success message to the user)
            },
            (friendError) => {
              console.error('Error adding friend to memory:', friendError);
              // Handle error (e.g., show an error message to the user)
            }
          );
        },
        (error) => {
          console.error('Error creating memory:', error);
          // Handle error (e.g., show an error message to the user)
        }
      );
  
    } else {
      // Handle form validation errors if needed
      console.error('Form is not valid. Please fill in all required fields.');
    }
  
    this.router.navigate(['/home']);
  }
  
}



