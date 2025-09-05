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
import { CommonModule } from '@angular/common';
import { GeocoderResponse } from '../../../models/geocoder-response.model';
import { MatDividerModule } from '@angular/material/divider';

interface FilterData {
  currentFilters: any;
  currentLocation?: GeocoderResponse | null;
}

@Component({
  selector: 'app-filter-bottom-sheet',
  standalone: true,
  imports: [
    CommonModule,
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
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: FilterData,
  ) {
    this.filterForm = this.fb.group({
      location: [''],
      distance: [25],
      season: [''],
      weather: [''],
      activityType: [[]],
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
        location: this.currentLocation.results[0].formatted_address
      });
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
      activityType: [],
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