import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MemoryService } from '@services/memory.service';
import { UserService } from '@services/userService';
import { MatDatepicker } from '@angular/material/datepicker';
import { ChooseLocationComponent } from '@components/_dialogs/choose-location/choose-location.component';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Country, CountryService } from '@services/restCountries.service';
import { ActivityService } from '@services/activity.service';
import { firstValueFrom, map, Observable, startWith } from 'rxjs';
import { ParsedLocation } from '@models/geocoder-response.model';

@Component({
  selector: 'app-adding-memory',
  templateUrl: './adding-memory.component.html',
  styleUrls: ['./adding-memory.component.scss'],
  standalone: false
})
export class AddingMemoryComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private countryService = inject(CountryService);
  dialog = inject(MatDialog);
  private location = inject(Location);
  memoryService = inject(MemoryService);
  private userService = inject(UserService);
  private activityService = inject(ActivityService);
  private router = inject(Router);


  @ViewChild('datepicker') datepicker?: MatDatepicker<Date>;
  @ViewChild('rangePicker') rangePicker?: MatDatepicker<Date>;

  isRangeSelected = false;
  memoryForm: FormGroup;
  userId = '';
  emailArray: string[] = [];
  hasActivity = false;

  filteredCountries!: Observable<Country[]>;
  countries: Country[] = [];

  constructor() {
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
      l_countryCode: [''],
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
    this.initializeCountries();
  }

  private initializeCountries() {
    this.countryService.getCountries().subscribe(countries => {
      this.countries = countries;
      // Initialize filteredCountries after countries are fetched
      this.filteredCountries = this.memoryForm.get('l_country')!.valueChanges.pipe(
        startWith(''),
        map(value => this._filterCountries(value || ''))
      );
    });
  }

  private _filterCountries(value: string): Country[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter(country =>
      country.name.toLowerCase().includes(filterValue)
    );
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
              this.updateLocationData(result.parsedLocation, result.markerPosition);
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

  private updateLocationData(parsedLocation: ParsedLocation, coordinates: { lat: number; lng: number }): void {
    this.memoryForm.patchValue({
      l_city: parsedLocation.city,
      l_country: parsedLocation.country,
      l_countryCode: parsedLocation.countryCode,
      lat: coordinates.lat.toFixed(4),
      lng: coordinates.lng.toFixed(4),
    });
    console.log("Location Data: ", this.memoryForm.value);
  }

  private async patchActivityData(): Promise<void> {
    const state = this.location.getState() as { quickActivity: string; activityId: number };
    this.memoryForm.patchValue({ activity_id: state?.activityId });
    if (state.activityId === 1) {
      this.memoryForm.patchValue({ quickActivityTitle: "placeholder" });
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

  updateCca2Code() {
  if (this.memoryForm.valid) {
    // Find the selected country and set the country_cca2
    const selectedCountryName = this.memoryForm.get('l_country')?.value;
    const selectedCountry = this.countries.find(
      country => country.name.toLowerCase() === selectedCountryName?.toLowerCase()
    );
    
    if (selectedCountry) {
      this.memoryForm.patchValue({
        l_countryCode: selectedCountry.cca2
      });
    }
    console.log("Sat Code to: ", this.memoryForm.value);
  }
}

  cancelCreation(): void {
    this.router.navigate(['/home']);
  }
}
