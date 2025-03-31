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


@Component({
  selector: 'app-create-activity',
  standalone: false,
  templateUrl: './create-activity.component.html',
  styleUrl: './create-activity.component.scss'
})
export class CreateActivityComponent implements OnInit {
  activityForm: FormGroup;
  selectedImageUrl = '';
  userId: string | null = null;
  lat = 0;
  lng = 0;
  uploadedFiles: File[] = [];
  uploadStarted = false;

  constructor(private fb: FormBuilder, private countryService: CountryService, public dialog: MatDialog, private userService: UserService, private activityService: ActivityService) {
    this.activityForm = this.fb.group({
      title: ['', Validators.required],
      isPrivate: [false],
      groupSizeMin: [1, [Validators.min(1), Validators.max(20)]],
      groupSizeMax: [20, [Validators.min(1), Validators.max(20)]],
      costs: [0, [Validators.min(0), Validators.max(100)]],
      description: [''],
      link: ['', Validators.pattern('https?://.+')],
      location: ['indoor'],
      season: ['summer'],
      weather: ['sunny'],
    });
  }

  ngOnInit(): void {
    // Subscribe to get the logged-in user ID
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
                console.log(this.lat, this.lng);
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
    console.log("Select files!");
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.selectedImageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onSupportingFileSelected(event: any) {
    const files: File[] = Array.from(event.target.files);
    this.uploadedFiles = [...this.uploadedFiles, ...files];
    console.log(files);
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

      this.createActivity(dialogRef);
    }
  }

  private createActivity(dialogRef: MatDialogRef<UploadActivityDialogComponent>): void {
    const formData = this.activityForm.value;
    let activityId: string;
    let titlePictureUrl = '';
    let supportingDocUrls: string[] = [];
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
      title: formData.title,
      description: formData.description,
      isPrivate: formData.isPrivate,
      groupSizeMin: formData.groupSizeMin,
      groupSizeMax: formData.groupSizeMax,
      costs: formData.costs,
      link: formData.link,
      indoor: formData.indoor,
      season: formData.season,
      weather: formData.weather,
      location: location,
      firebaseUrl: ''
    };

    this.activityService.createActivity(activityData)
      .pipe(
        catchError(error => {
          dialogRef.componentInstance.showError(new Error('Failed to create activity: ' + error.message));
          return of(null);
        })
      )
      .subscribe(response => {
        if (!response) return; // Error was handled

        activityId = response.activityId.toString();
        dialogRef.componentInstance.updateProgress(10, 'Activity created. Starting uploads...');

        // Step 2: Upload title picture (progress to 20%)
        if (formData.titlePicture) {
          this.activityService.uploadTitlePicture(formData.titlePicture, activityId)
            .pipe(
              catchError(error => {
                dialogRef.componentInstance.showError(new Error('Failed to upload title picture: ' + error.message));
                return of(null);
              })
            )
            .subscribe(url => {
              if (!url) return; // Error was handled

              titlePictureUrl = url;
              dialogRef.componentInstance.updateProgress(20, 'Title picture uploaded successfully');

              // Step 3: Upload supporting documents (progress to 60%)
              if (formData.supportingDocuments && formData.supportingDocuments.length > 0) {
                this.activityService.uploadSupportingDocuments(formData.supportingDocuments, activityId)
                  .pipe(
                    catchError(error => {
                      dialogRef.componentInstance.showError(new Error('Failed to upload supporting documents: ' + error.message));
                      return of(null);
                    })
                  )
                  .subscribe(urls => {
                    if (!urls) return; // Error was handled

                    supportingDocUrls = urls;
                    dialogRef.componentInstance.updateProgress(60, 'Supporting documents uploaded');
                    this.finalizeActivity(dialogRef, activityId, titlePictureUrl, supportingDocUrls);
                  });
              } else {
                // Skip document upload if none provided
                dialogRef.componentInstance.updateProgress(60, 'No supporting documents to upload');
                this.finalizeActivity(dialogRef, activityId, titlePictureUrl, []);
              }
            });
        } else {
          // Skip title picture upload if none provided
          dialogRef.componentInstance.updateProgress(20, 'No title picture to upload');

          // Handle supporting documents
          if (formData.supportingDocuments && formData.supportingDocuments.length > 0) {
            this.activityService.uploadSupportingDocuments(formData.supportingDocuments, activityId)
              .pipe(
                catchError(error => {
                  dialogRef.componentInstance.showError(new Error('Failed to upload supporting documents: ' + error.message));
                  return of(null);
                })
              )
              .subscribe(urls => {
                if (!urls) return; // Error was handled

                supportingDocUrls = urls;
                dialogRef.componentInstance.updateProgress(60, 'Supporting documents uploaded');
                this.finalizeActivity(dialogRef, activityId, '', supportingDocUrls);
              });
          } else {
            // Skip document upload if none provided
            dialogRef.componentInstance.updateProgress(60, 'No files to upload');
            this.finalizeActivity(dialogRef, activityId, '', []);
          }
        }
      });
  }

  private finalizeActivity(dialogRef: MatDialogRef<UploadActivityDialogComponent>, activityId: string, titlePictureUrl: string, supportingDocUrls: string[]): void {
    // Step 4: Update activity with URLs (progress to 80%)
    this.activityService.updateActivityWithDocuments(activityId, titlePictureUrl, supportingDocUrls)
      .pipe(
        catchError(error => {
          dialogRef.componentInstance.showError(new Error('Failed to update activity with document URLs: ' + error.message));
          return of(null);
        })
      )
      .subscribe(result => {
        if (!result) return; // Error was handled

        dialogRef.componentInstance.updateProgress(80, 'Activity updated with files');
      });
  }
}
