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

@Component({
  selector: 'app-adding-memory',
  templateUrl: './adding-memory.component.html',
  styleUrls: ['./adding-memory.component.scss']
})
export class AddingMemoryComponent implements OnInit {

  @ViewChild('datepicker') datepicker?: MatDatepicker<Date>;
  @ViewChild('rangePicker') rangePicker?: MatDatepicker<Date>;

  isRangeSelected = false;
  memoryForm: FormGroup;
  userId = '';
  emailArray: string[] = [];


  constructor(
    private formBuilder: FormBuilder,
    private countryService: CountryService,
    public dialog: MatDialog,
    private location: Location,
    public memoryService: MemoryService,
    private userService: UserService,
    private locationService: LocationService,
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
      }
    });
    this.memoryForm.patchValue({ creator_id: this.userId });
    const state = this.location.getState() as { quickActivity: string; activityId: number };
    this.memoryForm.patchValue({ quickActivityTitle: state?.quickActivity });
    this.memoryForm.patchValue({ activity_id: state?.activityId });
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
          const dialogRef = this.dialog.open(ChooseLocationComponent, {
            data: { lat: coords[0].lat, long: coords[0].long },
            width: '500px',
            height: '542px'
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result && result[0]?.address_components && result[1]?.lat && result[1]?.lng) {
              this.patchLocationData(result[0].address_components, result[1].lat, result[1].lng);
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



  private patchLocationData(addressComponents: any, lat: number, lng: number): void {
    this.memoryForm.patchValue({
      l_city: this.locationService.getAddressComponents(addressComponents, 'long', 'locality'),
      l_postcode: this.locationService.getAddressComponents(addressComponents, 'long', 'postal_code'),
      l_country: this.locationService.getAddressComponents(addressComponents, 'long', 'country'),
      lat,
      lng
    });
  }

  cancelCreation(): void {
    this.router.navigate(['/home']);
  }
}
