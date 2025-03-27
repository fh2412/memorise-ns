import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChooseLocationComponent } from '../../components/_dialogs/choose-location/choose-location.component';
import { CountryService } from '../../services/restCountries.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-create-activity',
  standalone: false,
  templateUrl: './create-activity.component.html',
  styleUrl: './create-activity.component.scss'
})
export class CreateActivityComponent {
  activityForm: FormGroup;
  selectedImageUrl: string | null = null;
  location: string | null = null;
  
  constructor(private fb: FormBuilder, private countryService: CountryService, public dialog: MatDialog) {
    this.activityForm = this.fb.group({
      title: ['', Validators.required],
      isPrivate: [false],
      groupSizeMin: [1, [Validators.min(1), Validators.max(20)]],
      groupSizeMax: [20, [Validators.min(1), Validators.max(20)]],
      costs: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  openMapDialog(): void {
    const dialogRef = this.dialog.open(ChooseLocationComponent, {
      data: { lat: 0, long: 0 },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result.markerPosition);
      } else {
        console.error("Incomplete location data received from map dialog.");
      }
    });
    /*
    this.countryService.getCountryGeocordsByUserId("this.userId").subscribe(
      response => {
        if (response) {
          const coords = response; // Assuming response is already the desired Geocords object
          console.log(coords[0].lat, coords[0].long);
          const dialogRef = this.dialog.open(ChooseLocationComponent, {
            data: { lat: coords[0].lat, long: coords[0].long },
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(result.markerPosition);
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
    );*/
  }

  addLocation() {
    // In a real application, this would open a location picker
    // For demonstration purposes, we're just setting a placeholder
    this.location = 'Central Park, New York';
  }

  addPicture() {
    // In a real application, this would open a file picker
    // For demonstration purposes, we're just setting a placeholder image
    this.selectedImageUrl = '/api/placeholder/600/400';
  }

  onSubmit() {
    if (this.activityForm.valid) {
      console.log('Form submitted:', this.activityForm.value);
      console.log('Location:', this.location);
      console.log('Image URL:', this.selectedImageUrl);
    }
  }
}
