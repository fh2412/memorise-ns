import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { GeocoderResponse } from '../../../models/geocoder-response.model';
import { MatDividerModule } from '@angular/material/divider';
import { CountryService } from '../../../services/restCountries.service';
import { ChooseLocationComponent } from '../choose-location/choose-location.component';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

interface FilterData {
  currentFilters: any;
  currentLocation?: GeocoderResponse | null;
  userId: string;
}

@Component({
  selector: 'app-filter-bottom-sheet',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatIconModule,
    MatChipsModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatDividerModule
],
  templateUrl: 'filter-bottom-sheet.component.html',
  styleUrl: 'filter-bottom-sheet.component.scss'
})
export class FilterBottomSheetComponent implements OnInit {
  filterForm: FormGroup;
  currentLocation: GeocoderResponse | null = null;
  private initialFormValue: any;

  constructor(
    private fb: FormBuilder,
    private bottomSheetRef: MatBottomSheetRef<FilterBottomSheetComponent>,
    private countryService: CountryService,
    public dialog: MatDialog,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: FilterData,
  ) {
    this.filterForm = this.fb.group({
      location: [''],
      locationCoords: [{ lat: 0, lng: 0 }],
      distance: [25],
      season: [''],
      weather: [''],
      activityType: [''],
      groupSize: [1],
      price: [100],
      freeActivities: [false],
      familyFriendly: [false],
      petFriendly: [false],
      accessibleActivities: [false]
    });
  }

  ngOnInit(): void {
    if (this.data?.currentLocation) {
      this.currentLocation = this.data.currentLocation;
    }

    // Set current filters if provided
    if (this.data?.currentFilters) {
      this.filterForm.patchValue(this.data.currentFilters);
    }

    // Store initial form value to detect changes
    this.initialFormValue = this.filterForm.value;
  }

  useCurrentLocation(): void {
    if (this.currentLocation) {
      this.filterForm.patchValue({
        location: this.currentLocation.results[0].formatted_address,
        locationCoords: {lat: this.currentLocation.results[0].geometry.location.lat(), lng: this.currentLocation.results[0].geometry.location.lng()}
      });
    }
  }

async openMapDialog(): Promise<void> {
  try {
    const coords = await firstValueFrom(this.countryService.getCountryGeocordsByUserId(this.data.userId));
    if (!coords || coords.length === 0) {
      console.error("No coordinates found for the specified country.");
      return;
    }

    const dialogRef = this.dialog.open(ChooseLocationComponent, {
      data: { lat: coords[0].lat, long: coords[0].long },
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (result) {
      this.filterForm.patchValue({
        location: result.formattedAddress,
        locationCoords: result.markerPosition
      });
    } else {
      console.error("Incomplete location data received from map dialog.");
    }
  } catch (error) {
    console.error('Error in openMapDialog:', error);
  }
}


  hasChanges(): boolean {
    return JSON.stringify(this.filterForm.value) !== JSON.stringify(this.initialFormValue);
  }

  resetFilters(): void {
    this.filterForm.reset({
      location: '',
      distance: 25,
      season: '',
      weather: '',
      activityType: '',
      groupSize: 1,
      price: 100,
      freeActivities: false,
      familyFriendly: false,
      petFriendly: false,
      accessibleActivities: false
    });
  }

  applyFilters(): void {
    this.bottomSheetRef.dismiss(this.filterForm.value);
  }

  dismiss(): void {
    this.bottomSheetRef.dismiss();
  }
}