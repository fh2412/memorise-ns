import { Component, OnInit, inject, output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { MemoriseUser } from '@models/userInterface.model';
import { Country, CountryService } from '@services/restCountries.service';
import { map, Observable, startWith } from 'rxjs';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatInput, MatSuffix } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'app-edit-user-dialog',
    templateUrl: 'edit-user-dialog.component.html',
    styleUrls: ['edit-user-dialog.component.scss'],
    imports: [MatDialogTitle, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, MatSelect, MatOption, MatAutocompleteTrigger, MatAutocomplete, MatIcon, MatDialogActions, MatButton, MatDialogClose, AsyncPipe]
})
export class EditUserDialogComponent implements OnInit {
  private countryService = inject(CountryService);
  dialogRef = inject<MatDialogRef<EditUserDialogComponent>>(MatDialogRef);
  userdata = inject<MemoriseUser>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  readonly updateUserData = output<MemoriseUser>();
  userForm: FormGroup;
  countries: Country[] = [];
  filteredCountries!: Observable<Country[]>;

  constructor() {
    const userdata = this.userdata;

    this.userForm = this.fb.group({
      name: [userdata.name, Validators.required],
      bio: [userdata.bio, Validators.maxLength(500)],
      dob: [userdata.dob, Validators.required],
      gender: [userdata.gender, Validators.required],
      country: [userdata.country, Validators.required],
      country_cca2: [''],
      username: [userdata.username],
      instagram: [userdata.instagram],
    });
  }

  ngOnInit(): void {
    // Fetch countries from the service
    this.initializeCountries();
  }

  private initializeCountries(){
    this.countryService.getCountries().subscribe(countries => {
      this.countries = countries;
      // Initialize filteredCountries after countries are fetched
      this.filteredCountries = this.userForm.get('country')!.valueChanges.pipe(
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

  saveChanges() {
    if (this.userForm.invalid) {
      console.error('Form is invalid');
      return;
    }
    
    // Find the selected country and set the country_cca2
    const selectedCountryName = this.userForm.get('country')?.value;
    const selectedCountry = this.countries.find(
      country => country.name.toLowerCase() === selectedCountryName.toLowerCase()
    );
    
    if (selectedCountry) {
      this.userForm.patchValue({
        country_cca2: selectedCountry.cca2
      });
    }
    
    this.updateUserData.emit(this.userForm.value);
    this.dialogRef.close();
  }
}
