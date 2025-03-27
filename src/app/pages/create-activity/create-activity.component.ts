import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChooseLocationComponent } from '../../components/_dialogs/choose-location/choose-location.component';
import { CountryService } from '../../services/restCountries.service';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../services/userService';

@Component({
  selector: 'app-create-activity',
  standalone: false,
  templateUrl: './create-activity.component.html',
  styleUrl: './create-activity.component.scss'
})
export class CreateActivityComponent implements OnInit {
  activityForm: FormGroup;
  selectedImageUrl: string | null = null;
  location: string | null = null;
  preview = '';
  userId: string | null = null;

  constructor(private fb: FormBuilder, private countryService: CountryService, public dialog: MatDialog, private userService: UserService) {
    this.activityForm = this.fb.group({
      title: ['', Validators.required],
      isPrivate: [false],
      groupSizeMin: [1, [Validators.min(1), Validators.max(20)]],
      groupSizeMax: [20, [Validators.min(1), Validators.max(20)]],
      costs: [0, [Validators.min(0), Validators.max(100)]]
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
    if(this.userId){
      this.countryService.getCountryGeocordsByUserId(this.userId).subscribe(
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
      );
    }
  }

  selectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.preview = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  onSubmit() {
    if (this.activityForm.valid) {
      console.log('Form submitted:', this.activityForm.value);
      console.log('Location:', this.location);
      console.log('Image URL:', this.selectedImageUrl);
    }
  }
}
