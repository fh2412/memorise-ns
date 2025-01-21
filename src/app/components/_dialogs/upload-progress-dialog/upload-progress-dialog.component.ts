import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileUploadService } from '../../../services/file-upload.service';
import { MemoryService } from '../../../services/memory.service';
import { LocationService } from '../../../services/location.service';
import { GeocodingService } from '../../../services/geocoding.service';
import { ImageFileWithDimensions } from '../../image-upload/image-upload.component';
import { MemoryFormData } from '../../../models/memoryInterface.model';
import { ActivityService } from '../../../services/activity.service';

@Component({
  selector: 'app-upload-progress-dialog',
  templateUrl: './upload-progress-dialog.component.html',
  styleUrl: './upload-progress-dialog.component.scss'
})
export class UploadProgressDialogComponent implements OnInit {
  progress: number[] = [];
  downloadURL: string | undefined;
  originalCount = 0;
  counter = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { userId: string; memoryId: string; filesWithDimensions: ImageFileWithDimensions[]; memoryData: MemoryFormData; friends_emails: string[]; picture_count: number; googleStorageUrl: string; starredIndex: number },
    private storageService: FileUploadService,
    private memoryService: MemoryService,
    private locationService: LocationService,
    private dialogRef: MatDialogRef<UploadProgressDialogComponent>,
    private geocodingService: GeocodingService,
    private activityService: ActivityService
  ) {
    // Initialize progress array with zeros
    this.progress = Array(data.filesWithDimensions.length).fill(0);
  }

  ngOnInit() {
    this.oneByOneUpload();
  }
  async oneByOneUpload() {
    this.counter = 0;
    const uploadPromises: Promise<void>[] = [];
    this.data.filesWithDimensions.forEach((file, index) => {
      if (file) {
        const isStarred = (index === this.data.starredIndex);
        const uploadPromise = new Promise<void>((resolve, reject) => {
          this.storageService.uploadMemoryPicture(this.data.googleStorageUrl, file, this.data.picture_count, index, isStarred).subscribe(
            (uploadProgress: number | undefined) => {
              this.progress[index] = uploadProgress ?? 0;
            },
            error => {
              console.error('Error uploading picture:', error);
              reject(error);
            },
            () => {
              this.counter++;
              resolve();
            }
          );
        });
        uploadPromises.push(uploadPromise);
      }
    });

    try {
      await Promise.all(uploadPromises);
      console.log("finished upload!");

      if (this.data.picture_count == 0) {
        this.downloadURL = await this.memoryService.getMemoryTitlePictureUrl(this.data.googleStorageUrl, this.data.starredIndex);
        this.dialogRef.close(this.data.googleStorageUrl);
        this.createMemory();
      }
      else {
        this.originalCount = this.data.picture_count;
        this.updatePictureCount(this.data.memoryId);
        this.dialogRef.close(this.data.googleStorageUrl);
      }
    } catch (error) {
      console.error('Error during upload process:', error);
      // Handle the error appropriately here.
    }
  }


  updatePictureCount(memoryId: string): void {
    const pictureCount = this.calculatePictureCount();
    const pictureCountData = { picture_count: pictureCount };
  
    this.memoryService.updatePictureCount(memoryId, pictureCountData).subscribe({
      next: (response) => console.log('Picture count updated successfully:', response),
      error: (error) => console.error('Error updating picture count:', error),
    });
  }
  
  private calculatePictureCount(): number {
    const currentCount = this.data.filesWithDimensions?.length || 0;
    const totalCount = currentCount + this.originalCount;
    this.originalCount = 0; // Reset original count
    return totalCount;
  }
  

  async createMemory() {
    try {
      if (!this.data.memoryData) {
        console.error('Form is not valid. Please fill in all required fields.');
        return;
      }
  
      const memoryData = { ...this.data.memoryData };
      memoryData.firestore_bucket_url = this.data.googleStorageUrl;
      memoryData.title_pic = this.downloadURL || '';
  
      if (!memoryData.memory_end_date) {
        memoryData.memory_end_date = memoryData.memory_date;
      }
  
      if (memoryData.lat && memoryData.lng) {
        memoryData.location_id = await this.handleLocationCreation(memoryData);
        console.log("location created!: ", memoryData.location_id);
      } else if (memoryData.l_city || memoryData.l_country || memoryData.l_postcode) {
        const coords = await this.get_geocoords(memoryData.l_city, memoryData.l_country, memoryData.l_postcode);
        memoryData.lat = coords.lat.toString();
        memoryData.lng = coords.lng.toString();
        memoryData.location_id = await this.handleLocationCreation(memoryData);
        console.log("location created address!: ", memoryData.location_id);
      } else {
        memoryData.location_id = 1;
        console.log("location set to 1 ", memoryData.location_id);
      }
      console.log("Acitiviy: ", memoryData);
      if(memoryData.activity_id==0){
        console.log("Creating new Activity!");
        memoryData.activity_id = await this.handleActivityCreation(memoryData);
        console.log("activity created!: ", memoryData.activity_id);
      }
      await this.handleMemoryCreation(memoryData);
      console.log("Memory Created!");
    } catch (error) {
      console.error('Error creating memory:', error);
    }
  }
  
  private handleLocationCreation(memoryData: MemoryFormData): Promise<number> {
    return new Promise((resolve, reject) => {
      this.locationService.createLocation(memoryData).subscribe(
        (response: { locationId: number }) => resolve(response.locationId),
        (error) => reject(`Error creating location: ${error}`)
      );
    });
  }
  
  private handleActivityCreation(memoryData: MemoryFormData): Promise<number | null> {
    return new Promise((resolve, reject) => {
      if (!memoryData.quickActivityTitle) {
        resolve(null);
        return;
      }
  
      this.activityService.createQuickActivity(memoryData.quickActivityTitle).subscribe(
        (response: { activityId: number }) => resolve(response.activityId),
        (error) => reject(`Error creating activity: ${error}`)
      );
    });
  }
  
  private handleMemoryCreation(memoryData: MemoryFormData): Promise<void> {
    return new Promise((resolve, reject) => {
      this.memoryService.createMemory(memoryData).subscribe(
        async (response: { memoryId: string }) => {
          const memoryId = response.memoryId;
          console.log('Memory created successfully:', memoryId);
  
          if (this.data.friends_emails) {
            await this.addFriendsToMemory(memoryId, this.data.friends_emails);
          }
          this.updatePictureCount(memoryId);
          resolve();
        },
        (error) => reject(`Error creating memory: ${error}`)
      );
    });
  }
  
  private addFriendsToMemory(memoryId: string, friendsEmails: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const friendData = { emails: friendsEmails, memoryId };
      this.memoryService.addFriendToMemory(friendData).subscribe(
        () => {
          console.log('Friends added to memory successfully.');
          resolve();
        },
        (error) => reject(`Error adding friends to memory: ${error}`)
      );
    });
  }

  async get_geocoords(city: string, postcode: string, country: string): Promise<{ lat: number, lng: number }> {
    const address = await this.geocodingService.geocodeAddress(country, city, postcode);
  
    if (address && address.results && address.results.length > 0) {
      const geometry = address.results[0].geometry;
  
      // If bounds are present, calculate the center of the bounds
      if (geometry.bounds) {
        const ne = geometry.bounds.getNorthEast();
        const sw = geometry.bounds.getSouthWest();
  
        const lat = (ne.lat() + sw.lat()) / 2;
        const lng = (ne.lng() + sw.lng()) / 2;
  
        return { lat, lng };  // Return the approximate center of the bounds
      } else if (geometry.location) {
        // If bounds are not present, return the location directly
        return {
          lat: geometry.location.lat(),
          lng: geometry.location.lng()
        };
      }
    }
  
    throw new Error('Geocoding failed to return results');
  }
}
