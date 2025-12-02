import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MemorySelectorComponent } from '../memory-selecter/memory-selecter.component';
import { MatDialog } from '@angular/material/dialog';
import { CountryService } from '../../services/restCountries.service';
import { ChooseLocationComponent } from '../_dialogs/choose-location/choose-location.component';
import { ActivityDetails, MemoriseUserActivity } from '../../models/activityInterface.model';

@Component({
  selector: 'app-activity-form',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatStepperModule,
    ReactiveFormsModule,
    FormsModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatButtonToggleModule,
    MatListModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MemorySelectorComponent
  ],
  templateUrl: './activity-form.component.html',
  styleUrl: './activity-form.component.scss'
})
export class ActivityFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialog = inject(MatDialog);
  private countryService = inject(CountryService);

  @Input() userId = '';
  @Input() activity!: ActivityDetails;
  @Input() mode = 'edit';
  selectedImageFile: File | undefined;
  imageChanged = false;
  selectedImageUrl = '';


  activityForm: FormGroup;
  uploadedFiles: File[] = [];
  lat = 0;
  lng = 0;
  leadMemoryId: string | null = null;

  constructor() {
    this.activityForm = this.fb.group({
      title: ['', Validators.required],
      isPrivate: [false],
      groupSizeMin: [1, [Validators.min(1), Validators.max(20)]],
      groupSizeMax: [20, [Validators.min(1), Validators.max(20)]],
      costs: [0, [Validators.min(0), Validators.max(100)]],
      description: [''],
      link: ['', Validators.pattern('https?://.+')],
      indoor_outdoor_flag: ['indoor'],
      season: [['2']],
      weather: [['1']],
      location: [null],
      leadMemoryId: [],
    });
  }

  ngOnInit(): void {
    if (this.activity) {
      this.populateForm(this.activity);
    }
  }

  populateForm(activity: ActivityDetails): void {
    this.lat = activity.location.latitude;
    this.lng = activity.location.longitude;
    this.selectedImageUrl = activity.firebaseUrl;
    this.leadMemoryId = activity.baseMemoryId;
    this.activityForm.patchValue({
      title: activity.title,
      isPrivate: !activity.activeFlag,
      groupSizeMin: activity.groupSizeMin,
      groupSizeMax: activity.groupSizeMax,
      costs: activity.costs,
      description: activity.description,
      link: activity.websiteUrl,
      indoor_outdoor_flag: activity.indoor.toLowerCase(),
      season: activity.seasons.map(s => s.season_id.toString()),
      weather: activity.weatherConditions.map(w => w.weather_id.toString()),
      location: activity.location,
      leadMemoryId: activity.baseMemoryId
    });
  }
  
  

  selectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImageFile = input.files[0];
      this.imageChanged = true;
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.selectedImageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
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
                const newLocation = { 
                  country: '',
                  latitude: this.lat,
                  longitude: this.lng,
                  locality: null,
                  location_id: this.activity.location.location_id
                 };
                this.activityForm.patchValue({ 
                  location: newLocation,
                });
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

  onMemorySelected(memoryId: number) {
    this.leadMemoryId = memoryId.toString();
    this.activityForm.patchValue({
      leadMemoryId: this.leadMemoryId
    });
  }

  onSubmit(){
    console.log("Submited: ", this.activityForm);
  }

  getFormData(): MemoriseUserActivity {
    return this.activityForm.value;
  }
  getImageFile(): File | null {
    if(this.imageChanged && this.selectedImageFile){
      return this.selectedImageFile;
    } 
    else {
      return null;
    }
  }
}
