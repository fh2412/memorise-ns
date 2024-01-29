import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileUploadService } from '../../../services/file-upload.service';
import { MemoryService } from '../../../services/memory.service';

@Component({
  selector: 'app-upload-progress-dialog',
  templateUrl: './upload-progress-dialog.component.html',
  styleUrl: './upload-progress-dialog.component.css'
})
export class UploadProgressDialogComponent implements OnInit {
  progress: number[] = [];
  downloadURL: string | undefined;
  googleStorageUrl: string = "";


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { userId: string; files: File[]; memoryData: any; emails: any;},
    private storageService: FileUploadService,
    private memoryService: MemoryService,
    private dialogRef: MatDialogRef<UploadProgressDialogComponent> // Inject MatDialogRef
  ) {
    // Initialize progress array with zeros
    this.progress = Array(data.files.length).fill(0);
  }

  ngOnInit() {
    this.uploadFiles();
  }

  uploadFiles() {
    this.googleStorageUrl = this.data.userId.toString() + Date.now().toString();
    this.storageService.uploadMemoryPictures(this.googleStorageUrl, this.data.files).subscribe(
      (progress: number[]) => {
        this.progress = progress;
      },
      (error) => {
        console.error('Error uploading pictures:', error);
        // Handle error, e.g., close the dialog or show an error message
      },
      async () => {
        this.downloadURL = await this.memoryService.getMemoryTitlePictureUrl(this.googleStorageUrl);
        console.log("downloadUtl1:", this.downloadURL);
        this.dialogRef.close(this.googleStorageUrl);
        this.createMemory();
      }
    );
  }

  createMemory() {
    if (this.data.memoryData.valid) {
      const memoryData = this.data.memoryData.value;
      memoryData.firestore_bucket_url = this.googleStorageUrl;
      memoryData.title_pic = this.downloadURL;
      console.log("downloadUtl2:", memoryData.title_pic);
  
      this.memoryService.createMemory(memoryData).subscribe(
        (response: { message: string, memoryId: any }) => {
          console.log('Memory created successfully:', response.memoryId[0]?.insertId);
          
          const friendData = { emails: this.data.emails, memoryId: response.memoryId[0]?.insertId };
          if(this.data.emails){
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
          }
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
  }
}
