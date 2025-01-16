import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MemoriseUser } from '../../../models/userInterface.model';
import { Country, CountryService } from '../../../services/restCountries.service';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'edit-user-dialog',
  templateUrl: 'edit-user-dialog.component.html',
  styleUrls: ['edit-user-dialog.component.scss']
})
export class EditUserDialogComponent {
  @Output() updateUserData = new EventEmitter<MemoriseUser>();  // Emit the full user object
  userForm: FormGroup;
  countries: Country[] = [];
  filteredCountries!: Observable<Country[]>;

  constructor(
    private countryService: CountryService,
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public userdata: MemoriseUser,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      name: [userdata.name, Validators.required],
      bio: [userdata.bio, Validators.maxLength(500)],
      dob: [userdata.dob, Validators.required],
      gender: [userdata.gender, Validators.required],
      country: [userdata.country, Validators.required],
      username: [userdata.username],
      instagram: [userdata.instagram],
    });
  }

  ngOnInit(): void {
    // Fetch countries from the service
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
    this.userForm.value.dob.setHours(12, 12, 12, 12);

    this.updateUserData.emit(this.userForm.value);
    this.dialogRef.close();
  }
}
