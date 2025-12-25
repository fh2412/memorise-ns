import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileUploadService } from '@services/file-upload.service';
import { MemoryService } from '@services/memory.service';
import { LocationService } from '@services/location.service';
import { GeocodingService } from '@services/geocoding.service';
import { ImageFileWithDimensions } from '../../image-upload/image-upload.component';
import { MemoryFormData } from '@models/memoryInterface.model';
import { ActivityService } from '@services/activity.service';
import { MemoriseLocation } from '@models/location.model';
import { BillingService } from '@services/billing.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-upload-progress-dialog',
  templateUrl: './upload-progress-dialog.component.html',
  styleUrl: './upload-progress-dialog.component.scss',
  standalone: false
})
export class UploadProgressDialogComponent implements OnInit {
  data = inject<{
    userId: string;
    memoryId: string;
    filesWithDimensions: ImageFileWithDimensions[];
    memoryData: MemoryFormData;
    friends_emails: string[];
    picture_count: number;
    googleStorageUrl: string;
    starredIndex: number;
  }>(MAT_DIALOG_DATA);
  private storageService = inject(FileUploadService);
  private memoryService = inject(MemoryService);
  private locationService = inject(LocationService);
  private dialogRef = inject<MatDialogRef<UploadProgressDialogComponent>>(MatDialogRef);
  private geocodingService = inject(GeocodingService);
  private activityService = inject(ActivityService);
  private billingService = inject(BillingService);
  private snackbar = inject(MatSnackBar);

  progress: number[] = [];
  downloadURLs: string[] = [];
  uploadedCount = 0;
  memoryId = '';

  constructor() {
    const data = this.data;

    this.progress = Array(data.filesWithDimensions.length).fill(0);
    this.downloadURLs = Array(data.filesWithDimensions.length).fill('');
  }

  ngOnInit() {
    this.batchUpload();
  }

  async batchUpload() {
    this.uploadedCount = 0;

    // Calculate total size upfront
    const totalSizeBytes = this.data.filesWithDimensions.reduce(
      (sum, img) => sum + img.file.size,
      0
    );

    // Use atomic increment for storage quota
    let hasStorageSpace = false;
    try {
      hasStorageSpace = await this.billingService
        .updateFreeUserStorageUsed(this.data.userId, totalSizeBytes)
        .toPromise();
    } catch {
      this.snackbar.open(
        'Your Storage is full! Delete old Images or upgrade to Premium.',
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        }
      );
      this.dialogRef.close(null);
      return;
    }

    if (!hasStorageSpace) {
      this.snackbar.open(
        'Your Storage is full! Delete old Images or upgrade to Premium.',
        'Close',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        }
      );
      this.dialogRef.close(null);
      return;
    }

    // Upload all files concurrently
    const uploadPromises = this.data.filesWithDimensions.map((file, index) => {
      const isStarred = (index === this.data.starredIndex);

      return new Promise<void>((resolve, reject) => {
        this.storageService.uploadMemoryPicture(
          this.data.googleStorageUrl,
          file,
          this.data.userId,
          isStarred
        ).subscribe({
          next: (result) => {
            if (result.progress !== undefined) {
              this.progress[index] = result.progress;
            }
            if (result.downloadURL) {
              this.downloadURLs[index] = result.downloadURL;
            }
          },
          error: (error) => {
            console.error(`Error uploading picture ${index}:`, error);
            reject(error);
          },
          complete: () => {
            this.uploadedCount++;
            resolve();
          }
        });
      });
    });

    try {
      await Promise.all(uploadPromises);
      console.log("All uploads finished!");

      if (this.data.picture_count === 0) {
        await this.createMemory();
        console.log("Memory Created: ", this.memoryId);
      }

      const incrementResult = await firstValueFrom(this.memoryService.incrementPictureCount(this.memoryId || this.data.googleStorageUrl, this.data.filesWithDimensions.length));
      console.log(`Picture count updated to: ${incrementResult?.newCount}`);
      this.snackbar.open(
        'Successfully created Memory!',
        'Yeay',
        { duration: 3000 }
      );
      this.dialogRef.close(this.data.googleStorageUrl);
    } catch (error) {
      console.error('Error during upload process:', error);

      // Rollback storage quota on failure
      const updatedStroage = await firstValueFrom(this.billingService.updateFreeUserStorageUsed(this.data.userId, -totalSizeBytes));

      this.snackbar.open(
        'Upload failed. Please try again.',
        'Close',
        { duration: 3000 }
      );
      this.dialogRef.close(updatedStroage);
    }
  }

  async createMemory() {
    try {
      if (!this.data.memoryData) {
        console.error('Form is not valid. Please fill in all required fields.');
        return;
      }

      const memoryData = { ...this.data.memoryData };
      memoryData.firestore_bucket_url = this.data.googleStorageUrl;
      memoryData.title_pic = this.downloadURLs[this.data.starredIndex] || '';
      const locationData: MemoriseLocation = {
        latitude: Number(memoryData.lat),
        longitude: Number(memoryData.lng),
        country: memoryData.l_country,
        countryCode: memoryData.l_countryCode,
        city: memoryData.l_city,
        location_id: 0
      }


      if (!memoryData.memory_end_date) {
        memoryData.memory_end_date = memoryData.memory_date;
      }

      const hasCoordinates = memoryData.lat && memoryData.lng;
      const hasAddressInfo = memoryData.l_city || memoryData.l_country || memoryData.l_postcode;

      if (!hasCoordinates && !hasAddressInfo) {
        memoryData.location_id = 1;
      } else {
        // Get coordinates if we don't have them yet
        if (!hasCoordinates) {
          const coords = await this.get_geocoords(
            memoryData.l_city,
            memoryData.l_country,
            memoryData.l_postcode
          );
          memoryData.lat = coords.lat.toString();
          memoryData.lng = coords.lng.toString();
        }

        // Create location with coordinates
        const response = await firstValueFrom(this.locationService.createLocation(locationData));
        memoryData.location_id = response.locationId;
      }

      if (memoryData.activity_id == 0) {
        memoryData.activity_id = await this.handleActivityCreation(memoryData);
      }

      await this.handleMemoryCreation(memoryData);
    } catch (error) {
      console.error('Error creating memory:', error);
    }
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
        async (response: { memory_id: string }) => {
          this.memoryId = response.memory_id;
          console.log('Memory created successfully:', response);

          if (this.data.friends_emails.length > 0) {
            await this.addFriendsToMemory(this.memoryId, this.data.friends_emails);
          }

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

  async get_geocoords(
    city: string,
    postcode: string,
    country: string
  ): Promise<{ lat: number, lng: number }> {
    const address = await this.geocodingService.geocodeAddress(country, city, postcode);

    if (address && address.results && address.results.length > 0) {
      const geometry = address.results[0].geometry;

      if (geometry.bounds) {
        const ne = geometry.bounds.getNorthEast();
        const sw = geometry.bounds.getSouthWest();
        const lat = (ne.lat() + sw.lat()) / 2;
        const lng = (ne.lng() + sw.lng()) / 2;
        return { lat, lng };
      } else if (geometry.location) {
        return {
          lat: geometry.location.lat(),
          lng: geometry.location.lng()
        };
      }
    }

    throw new Error('Geocoding failed to return results');
  }
}