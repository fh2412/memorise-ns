import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChooseLocationComponent } from '../../components/_dialogs/choose-location/choose-location.component';
import { CountryService } from '../../services/restCountries.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../services/userService';
import { UploadActivityDialogComponent } from '../../components/_dialogs/upload-activity-dialog/upload-activity-dialog.component';
import { ActivityService } from '../../services/activity.service';
import { catchError, of } from 'rxjs';
import { MemoriseUserActivity } from '../../models/activityInterface.model';
import { MemoriseLocation } from '../../models/location.model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-create-activity',
  standalone: false,
  templateUrl: './create-activity.component.html',
  styleUrl: './create-activity.component.scss'
})
export class CreateActivityComponent implements OnInit {
  activityForm: FormGroup;
  selectedImageUrl = '';
  selectedImageFile: File | undefined;
  userId: string | null = null;
  lat = 0;
  lng = 0;
  uploadedFiles: File[] = [];
  uploadStarted = false;
  leadMemoryId = 0;

  constructor(private fb: FormBuilder, private countryService: CountryService, public dialog: MatDialog, private userService: UserService, private activityService: ActivityService, private router: Router,) {
    this.activityForm = this.fb.group({
      title: ['', Validators.required],
      isPrivate: [false],
      groupSizeMin: [1, [Validators.min(1), Validators.max(20)]],
      groupSizeMax: [20, [Validators.min(1), Validators.max(20)]],
      costs: [0, [Validators.min(0), Validators.max(100)]],
      description: [''],
      link: ['', Validators.pattern('https?://.+')],
      indoor_outdoor_flag: ['indoor'],
      season: [['summer']],
      weather: [['sunny']],
    });
  }

  ngOnInit(): void {
    this.userService.userId$.subscribe(userId => {
      this.userId = userId;
      console.log("Component received userId:", this.userId);
    });
  }

  openMapDialog(): void {
    if (this.userId) {
      this.countryService.getCountryGeocordsByUserId(this.userId).subscribe(
        response => {
          if (response) {
            const coords = response;
            const dialogRef = this.dialog.open(ChooseLocationComponent, {
              data: { lat: coords[0].lat, long: coords[0].long },
            });

            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                this.lat = result.markerPosition.lat;
                this.lng = result.markerPosition.lng;
              } else {
                console.error("Incomplete location data received from map dialog.");
              }
            });
          } else {
            console.error("No coordinates found for the specified country.");
          }
        },
        error => {
          console.error('Error getting country geocoordinates:', error);
        }
      );
    }
  }

  selectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImageFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.selectedImageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onSupportingFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const files: File[] = Array.from(input.files);
      this.uploadedFiles = [...this.uploadedFiles, ...files];
    }
  }

  removeFile(fileToRemove: File) {
    this.uploadedFiles = this.uploadedFiles.filter(file => file !== fileToRemove);
  }

  onSubmit() {
    if (this.activityForm.valid) {
      const dialogRef = this.dialog.open(UploadActivityDialogComponent, {
        width: '400px',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(() => {
        this.router.navigate(['/activities']);
      });

      this.createActivity(dialogRef);
    }
  }

  private async createActivity(dialogRef: MatDialogRef<UploadActivityDialogComponent>): Promise<void> {
    const formData = this.activityForm.value;
    let activityId: string;
    let titlePictureUrl = '';
    const location: MemoriseLocation = {
      country: '',
      latitude: this.lat,
      longitude: this.lng,
      locality: null,
      location_id: 1,
    }

    // Initialize with 5% to show something is happening
    dialogRef.componentInstance.updateProgress(5, 'Initializing activity creation...');

    // Step 1: Create activity in backend to get the ID
    const activityData: MemoriseUserActivity = {
      activityId: 0,
      title: formData.title,
      description: formData.description,
      isPrivate: formData.isPrivate,
      groupSizeMin: formData.groupSizeMin,
      groupSizeMax: formData.groupSizeMax,
      costs: formData.costs,
      link: formData.link,
      indoor: formData.indoor_outdoor_flag == 'indoor',
      season: formData.season,
      weather: formData.weather,
      location: location,
      firebaseUrl: ''
    };

    await this.activityService.createActivity(activityData)
      .pipe(
        catchError(error => {
          dialogRef.componentInstance.showError(new Error('Failed to create activity: ' + error.message));
          return of(null);
        })
      )
      .subscribe(async response => {
        if (!response) return; // Error was handled
        activityId = response.activityId.toString();
        console.log("Activity created: ", activityId);
        dialogRef.componentInstance.updateProgress(10, 'Activity created. Starting uploads...');

        // Step 2: Upload title picture (progress to 20%)
        if (this.selectedImageFile) {
          this.activityService.uploadTitlePicture(this.selectedImageFile, activityId)
            .subscribe({
              next: (url) => {
                console.log("Picture uploaded ", url);
                titlePictureUrl = url;
                dialogRef.componentInstance.updateProgress(20, 'Title picture uploaded successfully');
                // Step 3: Upload supporting documents (progress to 60%)
                this.uploadSupportingFiles(dialogRef, activityId, titlePictureUrl);
              },
              error: (error) => {
                dialogRef.componentInstance.showError(new Error('Failed to upload title picture: ' + error.message));
                return of(null);
              }
            });
        } else {
          // Skip title picture upload if none provided
          dialogRef.componentInstance.updateProgress(20, 'No title picture to upload');

          // Handle supporting documents
          this.uploadSupportingFiles(dialogRef, activityId, titlePictureUrl);
        }
      });
  }


  private uploadSupportingFiles(dialogRef: MatDialogRef<UploadActivityDialogComponent>, activityId: string, titlePictureUrl: string){
    if (this.uploadedFiles && this.uploadedFiles.length > 0) {
      this.activityService.uploadSupportingDocuments(this.uploadedFiles, activityId)
        .pipe(
          catchError(error => {
            dialogRef.componentInstance.showError(new Error('Failed to upload supporting documents: ' + error.message));
            return of(null);
          })
        )
        .subscribe(urls => {
          if (!urls) return;
          dialogRef.componentInstance.updateProgress(60, 'Supporting documents uploaded');
          this.finalizeActivity(dialogRef, activityId, titlePictureUrl);
        });
    } else {
      // Skip document upload if none provided
      dialogRef.componentInstance.updateProgress(60, 'No supporting documents to upload');
      this.finalizeActivity(dialogRef, activityId, titlePictureUrl);
    }
  }

  private async finalizeActivity(dialogRef: MatDialogRef<UploadActivityDialogComponent>, activityId: string, titlePictureUrl: string): Promise<void> {
    // Step 4: Update activity with URLs (progress to 80%)
    await this.activityService.updateActivityWithDocuments(activityId, titlePictureUrl)
      .pipe(
        catchError(error => {
          dialogRef.componentInstance.showError(new Error('Failed to update activity with document URLs: ' + error.message));
          return of(null);
        })
      )
      .subscribe(result => {
        if (!result) return;
        dialogRef.componentInstance.updateProgress(80, 'Activity updated with files');
        dialogRef.close();
      });
  }

  onMemorySelected(memoryId: number) {
    this.leadMemoryId = memoryId;
  }
}
