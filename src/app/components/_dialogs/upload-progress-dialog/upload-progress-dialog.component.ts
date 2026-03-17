import { Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';
import { FileUploadService } from '@services/file-upload.service';
import { MemoryService } from '@services/memory.service';
import { LocationService } from '@services/location.service';
import { GeocodingService } from '@services/geocoding.service';
import { ImageFileWithDimensions } from '../../image-upload/image-upload.component';
import { MemoryFormData } from '@models/memoryInterface.model';
import { ActivityService } from '@services/activity.service';
import { BillingService } from '@services/billing.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'app-upload-progress-dialog',
  templateUrl: './upload-progress-dialog.component.html',
  styleUrl: './upload-progress-dialog.component.scss',
  imports: [MatDialogTitle, CdkScrollable, MatDialogContent, MatProgressBar]
})
export class UploadProgressDialogComponent implements OnInit {
  readonly data = inject<{
    userId: string;
    memoryId: string;
    filesWithDimensions: ImageFileWithDimensions[];
    memoryData: MemoryFormData;
    friends_emails: string[];
    picture_count: number;
    googleStorageUrl: string;
    starredIndex: number;
  }>(MAT_DIALOG_DATA);

  private readonly storageService = inject(FileUploadService);
  private readonly memoryService = inject(MemoryService);
  private readonly locationService = inject(LocationService);
  private readonly dialogRef = inject(MatDialogRef<UploadProgressDialogComponent>);
  private readonly geocodingService = inject(GeocodingService);
  private readonly activityService = inject(ActivityService);
  private readonly billingService = inject(BillingService);
  private readonly snackbar = inject(MatSnackBar);

  // Using signals for progress tracking (Angular 21 standard)
  progress = signal<number[]>([]);
  uploadedCount = signal(0);
  downloadURLs: string[] = [];

  constructor() {
    this.progress.set(Array(this.data.filesWithDimensions.length).fill(0));
    this.downloadURLs = Array(this.data.filesWithDimensions.length).fill('');
  }

  ngOnInit() {
    this.startProcessing();
  }

  async startProcessing() {
    const totalSizeBytes = this.data.filesWithDimensions.reduce((sum, img) => sum + img.file.size, 0);

    try {
      // 1. Storage Check
      const hasSpace = await firstValueFrom(this.billingService.updateFreeUserStorageUsed(this.data.userId, totalSizeBytes));
      if (!hasSpace) throw new Error('STORAGE_FULL');

      // 2. Create Memory Structure First
      let currentMemoryId = this.data.memoryId;
      if (this.data.picture_count === 0) {
        currentMemoryId = await this.orchestrateMemoryCreation();
      }

      // 3. Batch Upload Images using the new Memory ID
      await this.performBatchUpload(currentMemoryId);

      // 4. Update the Starred Image (Title Pic)
      const starredUrl = this.downloadURLs[this.data.starredIndex];
      if (starredUrl) {
        await firstValueFrom(this.memoryService.updateTitlePic(currentMemoryId, starredUrl));
      }

      // 5. Finalize
      await firstValueFrom(this.memoryService.incrementPictureCount(currentMemoryId, this.data.filesWithDimensions.length));

      this.snackbar.open('Successfully created Memory!', 'Success', { duration: 3000 });
      this.dialogRef.close(this.data.googleStorageUrl);

    } catch (error) {
      console.error('Process failed:', error);

      // Rollback storage on failure
      await firstValueFrom(this.billingService.updateFreeUserStorageUsed(this.data.userId, -totalSizeBytes));

      const message = error === 'STORAGE_FULL'
        ? 'Your Storage is full! Delete old images or upgrade.'
        : 'Upload failed. Please try again.';

      this.snackbar.open(message, 'Close', { duration: 5000 });
      this.dialogRef.close(null);
    }
  }

  private async orchestrateMemoryCreation(): Promise<string> {
    const memoryData = { ...this.data.memoryData };

    // Handle Geocoding if missing
    if (!memoryData.lat || !memoryData.lng) {
      if (!(memoryData.l_city && memoryData.l_country && memoryData.l_postcode)) {
        memoryData.location_id = 1;
      }
      else {
        const coords = await this.get_geocoords(memoryData.l_city, memoryData.l_postcode, memoryData.l_country);
        memoryData.lat = coords.lat.toString();
        memoryData.lng = coords.lng.toString();
      }
    }

    // Create Location
    if (memoryData.location_id !== 1) {
      const locResponse = await firstValueFrom(this.locationService.createLocation({
        latitude: Number(memoryData.lat),
        longitude: Number(memoryData.lng),
        country: memoryData.l_country,
        countryCode: memoryData.l_countryCode,
        city: memoryData.l_city,
        location_id: 0
      }));
      memoryData.location_id = locResponse.locationId;
    }
    // Create Activity if needed
    if (memoryData.activity_id === 0 && memoryData.quickActivityTitle) {
      const actResponse = await firstValueFrom(this.activityService.createQuickActivity(memoryData.quickActivityTitle));
      memoryData.activity_id = actResponse.activityId;
    }

    // Set dates
    if (!memoryData.memory_end_date) memoryData.memory_end_date = memoryData.memory_date;
    memoryData.firestore_bucket_url = this.data.googleStorageUrl;

    // Create Memory
    const memResponse = await firstValueFrom(this.memoryService.createMemory(memoryData));

    // Add Friends
    if (this.data.friends_emails.length > 0) {
      await firstValueFrom(this.memoryService.addFriendToMemory({
        emails: this.data.friends_emails,
        memoryId: memResponse.memory_id
      }));
    }

    return memResponse.memory_id;
  }

  private async performBatchUpload(memoryId: string) {
    const uploadPromises = this.data.filesWithDimensions.map((file, index) => {
      const isStarred = index === this.data.starredIndex;

      return new Promise<void>((resolve, reject) => {
        this.storageService.uploadMemoryPicture(memoryId, file, this.data.userId, isStarred)
          .subscribe({
            next: (result) => {
              if (result.progress !== undefined) {
                const currentProgress = [...this.progress()];
                currentProgress[index] = result.progress;
                this.progress.set(currentProgress);
              }
              if (result.downloadURL) {
                this.downloadURLs[index] = result.downloadURL;
              }
            },
            error: reject,
            complete: () => {
              this.uploadedCount.update(c => c + 1);
              resolve();
            }
          });
      });
    });

    await Promise.all(uploadPromises);
  }

  async get_geocoords(city: string, postcode: string, country: string): Promise<{ lat: number, lng: number }> {
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
