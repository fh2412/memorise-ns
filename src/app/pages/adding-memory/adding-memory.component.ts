import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MemoryService } from '../../services/memory.service';
import { UserService } from '../../services/userService';
import { MatDatepicker } from '@angular/material/datepicker';
import { ChooseLocationComponent } from '../../components/_dialogs/choose-location/choose-location.component';
import { Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { Location } from '@angular/common';
import { CountryService } from '../../services/restCountries.service';
import { ActivityService } from '../../services/activity.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-adding-memory',
  templateUrl: './adding-memory.component.html',
  styleUrls: ['./adding-memory.component.scss'],
  standalone: false
})
export class AddingMemoryComponent implements OnInit {

  @ViewChild('datepicker') datepicker?: MatDatepicker<Date>;
  @ViewChild('rangePicker') rangePicker?: MatDatepicker<Date>;

  isRangeSelected = false;
  memoryForm: FormGroup;
  userId = '';
  emailArray: string[] = [];
  hasActivity = false;


  constructor(
    private formBuilder: FormBuilder,
    private countryService: CountryService,
    public dialog: MatDialog,
    private location: Location,
    public memoryService: MemoryService,
    private userService: UserService,
    private locationService: LocationService,
    private activityService: ActivityService,
    private router: Router
  ) {
    this.memoryForm = this.formBuilder.group({
      creator_id: [this.userId],
      title: ['', Validators.required],
      description: [''],
      firestore_bucket_url: [''],
      memory_date: [null, Validators.required],
      memory_end_date: [null],
      title_pic: [''],
      location_id: [''],
      lng: [''],
      lat: [''],
      l_country: [''],
      l_city: [''],
      l_postcode: [''],
      quickActivityTitle: [''],
      activity_id: [''],
    });
  }

  async ngOnInit() {
    await this.userService.userId$.subscribe((userId) => {
      if (userId) {
        this.userId = userId;
        this.memoryForm.patchValue({ creator_id: this.userId });
      }
    });
    this.patchActivityData();
  }

  onSelectedValuesChange(selectedValues: string[]): void {
    this.emailArray = selectedValues
      .map(str => str.match(/\(([^)]+)\)/)?.[1] || '')
      .filter(email => email);
  }

  openMapDialog(): void {
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
              this.patchLocationData(result.formattedAddress, result.markerPosition);
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



  private patchLocationData(formattedAddress: string, coordinates: { lat: number; lng: number }): void {
    const addressComponents = this.locationService.parseFormattedAddress(formattedAddress);

    this.memoryForm.patchValue({
      l_city: addressComponents.city,
      l_postcode: addressComponents.postalCode,
      l_country: addressComponents.country,
      lat: coordinates.lat.toFixed(4),
      lng: coordinates.lng.toFixed(4),
    });
  }

  private async patchActivityData(): Promise<void> {
    const state = this.location.getState() as { quickActivity: string; activityId: number };
    this.memoryForm.patchValue({ activity_id: state?.activityId });
    if (state.quickActivity) {
      this.memoryForm.patchValue({ quickActivityTitle: state?.quickActivity });
    }
    else {
      this.hasActivity = true;
      const activityData = await firstValueFrom(this.activityService.getActivityDetails(state?.activityId));
      this.memoryForm.patchValue({
        lat: activityData.location.latitude,
        lng: activityData.location.longitude,
        location_id: activityData.location.location_id,
        description: activityData.description,
      });
      console.log(this.memoryForm.value);
    }
  }

  cancelCreation(): void {
    this.router.navigate(['/home']);
  }
}
