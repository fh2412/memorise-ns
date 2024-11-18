import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileUploadService } from '../../../services/file-upload.service';
import { MemoryService } from '../../../services/memory.service';
import { LocationService } from '../../../services/location.service';
import { GeocodingService } from '../../../services/geocoding.service';
import { ImageFileWithDimensions } from '../../image-upload/image-upload.component';
import { MemoryFormData } from '../../../models/memoryInterface.model';

@Component({
  selector: 'app-upload-progress-dialog',
  templateUrl: './upload-progress-dialog.component.html',
  styleUrl: './upload-progress-dialog.component.scss'
})
export class UploadProgressDialogComponent implements OnInit {
  progress: number[] = [];
  downloadURL: string | undefined;
  originalCount: number = 0;
  counter: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { userId: string; memoryId: string; filesWithDimensions: ImageFileWithDimensions[]; memoryData: MemoryFormData; friends_emails: string[]; picture_count: number; googleStorageUrl: string; starredIndex: number },
    private storageService: FileUploadService,
    private memoryService: MemoryService,
    private locationService: LocationService,
    private dialogRef: MatDialogRef<UploadProgressDialogComponent>,
    private geocodingService: GeocodingService,
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
    if (this.data.memoryData) {
      const memoryData = this.data.memoryData;
      memoryData.firestore_bucket_url = this.data.googleStorageUrl;
      memoryData.title_pic = this.downloadURL || '';
      if (memoryData.memory_end_date == null) {
        memoryData.memory_end_date = memoryData.memory_date;
      }
      if (memoryData.lat != '' && memoryData.lng != '') {
        this.create_location(memoryData);
      }
      else {
        if(memoryData.l_city || memoryData.l_country || memoryData.l_postcode){
          const coords = await this.get_geocoords(memoryData.l_city, memoryData.l_country, memoryData.l_postcode);
          memoryData.lat = coords.lat.toString();
          memoryData.lng = coords.lng.toString();
          this.create_location(memoryData);
        }
        else{
          memoryData.location_id = '1';
          this.create_memory(memoryData);
        }
      }
    } else {
      // Handle form validation errors if needed
      console.error('Form is not valid. Please fill in all required fields.');
    }
  }

  create_memory(memoryData: MemoryFormData) {
    this.memoryService.createMemory(memoryData).subscribe(
      (response: { message: string, memoryId: any }) => {

        const friendData = { emails: this.data.friends_emails, memoryId: response.memoryId[0]?.insertId };
        console.log("Friends: ", friendData);
        if (this.data.friends_emails) {
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
        this.updatePictureCount(response.memoryId[0]?.insertId);
      },
      (error) => {
        console.error('Error creating memory:', error);
        // Handle error (e.g., show an error message to the user)
      }
    );
  }
  

  create_location(memoryData: MemoryFormData) {
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
