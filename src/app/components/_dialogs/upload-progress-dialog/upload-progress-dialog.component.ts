import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileUploadService } from '../../../services/file-upload.service';
import { MemoryService } from '../../../services/memory.service';
import { LocationService } from '../../../services/location.service';

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
    @Inject(MAT_DIALOG_DATA) public data: { userId: string; files: File[]; memoryData: any; emails: any; },
    private storageService: FileUploadService,
    private memoryService: MemoryService,
    private locationService: LocationService,
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
        this.dialogRef.close(this.googleStorageUrl);
        if(this.data.userId!="justAddPhotos!"){
          this.createMemory();
        }
        else{
          console.log(this.data.userId);
        }
      }
    );
  }

  createMemory() {
    if (this.data.memoryData.valid) {
      const memoryData = this.data.memoryData.value;
      memoryData.firestore_bucket_url = this.googleStorageUrl;
      memoryData.title_pic = this.downloadURL;
      if (memoryData.memory_end_date == null) {
        memoryData.memory_end_date = memoryData.memory_date;
      }
      console.log("Date:", memoryData.memory_date, memoryData.memory_end_date);

      this.locationService.createLocation(memoryData).subscribe(
        (response: { message: string, locationId: any }) => {
          console.log('Location added to memory successfully:', response.locationId[0]?.insertId);
          memoryData.location_id = response.locationId[0]?.insertId;

          this.memoryService.createMemory(memoryData).subscribe(
            (response: { message: string, memoryId: any }) => {

              const friendData = { emails: this.data.emails, memoryId: response.memoryId[0]?.insertId };
              if (this.data.emails) {
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
        },
        (locationResponse) => {
          console.error('Error creating Location:', locationResponse);
        }
      );

    } else {
      // Handle form validation errors if needed
      console.error('Form is not valid. Please fill in all required fields.');
    }
  }
}
