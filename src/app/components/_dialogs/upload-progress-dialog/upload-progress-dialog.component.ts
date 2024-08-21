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
  originalCount: any = 0;
  counter: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { userId: string; memoryId: string; files: File[]; memoryData: any; emails: any; },
    private storageService: FileUploadService,
    private memoryService: MemoryService,
    private locationService: LocationService,
    private dialogRef: MatDialogRef<UploadProgressDialogComponent>,
  ) {
    // Initialize progress array with zeros
    this.progress = Array(data.files.length).fill(0);
  }

  ngOnInit() {
    this.oneByOneUpload();
  }

  uploadFiles() {
    if (this.data.memoryId == '') {
      this.googleStorageUrl = this.data.userId.toString() + Date.now().toString();
      this.storageService.uploadMemoryPictures(this.googleStorageUrl, this.data.files, "0").subscribe(
        (progress: number[]) => {
          console.log(`Upload Progress: ${progress}%`);
          this.progress = progress;
        },
        (error) => {
          console.error('Error uploading pictures:', error);
          // Handle error, e.g., close the dialog or show an error message
        },
        async () => {
          this.downloadURL = await this.memoryService.getMemoryTitlePictureUrl(this.googleStorageUrl);
          this.dialogRef.close(this.googleStorageUrl);
          this.createMemory();
        }
      );
    }
    else {
      this.googleStorageUrl = this.data.memoryData;
      this.storageService.uploadMemoryPictures(this.googleStorageUrl, this.data.files, this.data.emails).subscribe(             //this.data.emails is the count of the pictures, needed to append new pictures instead of overwriting them
        (progress: number[]) => {
          this.progress = progress;
        },
        (error) => {
          console.error('Error uploading pictures:', error);
        },
        async () => {
          this.originalCount = this.data.emails;
          this.updatePicureCount(this.data.memoryId);
          this.dialogRef.close(this.googleStorageUrl);
        }
      );
    }
  }
  async oneByOneUpload() {
    this.counter=0;
    this.data.files.forEach(file => {
      if (file) {
        this.googleStorageUrl = this.data.userId.toString() + Date.now().toString();
        this.storageService.uploadMemoryPicture(this.googleStorageUrl, file, "0", this.counter).subscribe(
          (uploadProgress: number | undefined) => {
            console.log(`Upload Progress: ${uploadProgress}%`, "picture:", this.counter);
            this.progress[this.counter] = uploadProgress ?? 0;
          },
          error => {
            console.error('Error uploading profile picture:', error);
          },
          async () => {
            this.counter++;
          }
        );
      }
    })
    console.log("finished upload!");
    this.downloadURL = await this.memoryService.getMemoryTitlePictureUrl(this.googleStorageUrl);
    this.dialogRef.close(this.googleStorageUrl);
    this.createMemory();
  }

  updatePicureCount(memoryId: string) {
    const pictureCountData: any = {};
    pictureCountData.picture_count = this.data.files.length + this.originalCount;
    this.originalCount = 0;
    console.log("New Picture Count:", pictureCountData.picture_count);
    this.memoryService.updatePictureCount(memoryId, pictureCountData).subscribe(
      (response) => {
        console.log(response);
      },
      (error) => {
        console.error('Error updating memory:', error);
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
      if (memoryData.lat != '' && memoryData.lng != '') {
        this.create_location(memoryData);
      }
      else {
        memoryData.location_id = 1;
        this.create_memory(memoryData);
      }
    } else {
      // Handle form validation errors if needed
      console.error('Form is not valid. Please fill in all required fields.');
    }
  }

  create_memory(memoryData: any) {
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
        this.updatePicureCount(response.memoryId[0]?.insertId);
      },
      (error) => {
        console.error('Error creating memory:', error);
        // Handle error (e.g., show an error message to the user)
      }
    );
  }

  create_location(memoryData: any) {
    this.locationService.createLocation(memoryData).subscribe(
      (response: { message: string, locationId: any }) => {
        console.log('Location added to memory successfully:', response.locationId[0]?.insertId);
        memoryData.location_id = response.locationId[0]?.insertId;

        this.create_memory(memoryData);
      },
      (locationResponse) => {
        console.error('Error creating Location:', locationResponse);
      }
    );
  }
}
