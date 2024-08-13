import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MemoryService } from '../../services/memory.service';
import { UserService } from '../../services/userService';
import { MatDatepicker } from '@angular/material/datepicker';
import { ChooseLocationComponent } from '../../components/_dialogs/choose-location/choose-location.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-adding-memory',
  templateUrl: './adding-memory.component.html',
  styleUrl: './adding-memory.component.scss'
})
export class AddingMemoryComponent {  
  
  @ViewChild('datepicker') datepicker: MatDatepicker<any> | undefined;
  @ViewChild('rangePicker') rangePicker: MatDatepicker<any> | undefined;


  isRangeSelected = false;
  memoryForm: FormGroup;
  userId: string | null | undefined;
  emailArray: any;
  constructor(private formBuilder: FormBuilder, public dialog: MatDialog, public memoryService: MemoryService, private userService: UserService, private router: Router) {
    this.memoryForm = this.formBuilder.group({
      creator_id: [this.userId],
      title: ['', Validators.required],
      description: [''],
      firestore_bucket_url: [''],
      memory_date: [null],
      memory_end_date: [null],
      title_pic: [''],
      location_id: [''],
      lng: [''],
      lat: [''],
      l_country: [''],
      l_city: [''],
      l_street: [''],
      l_housenumer: [''],
      l_postcode: [''],
    });
  }
  async ngOnInit() {
    await this.userService.userId$.subscribe((userId) => {
      this.userId = userId;
    });
    this.memoryForm.patchValue({ creator_id: this.userId });
  }

  onSelectedValuesChange(selectedValues: string[]) {
    this.emailArray = selectedValues.map(str => str.match(/\(([^)]+)\)/)?.[1] || null).filter(email => email !== null);
  }


  mapCenter: google.maps.LatLng= new google.maps.LatLng(47.5, 14.2);

  mapOptions: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 20,
    minZoom: 4,
    streetViewControl: false,
  };

  formattedAddress: any;


  openMapDialog(): void {
    const dialogRef = this.dialog.open(ChooseLocationComponent, {
      data: { mapCenter: this.mapCenter },
      width: '500px',
      height: '542px'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.formattedAddress = result[0].address_components;
        if (this.formattedAddress.length == 9) {
          this.memoryForm.patchValue({
            l_street: this.formattedAddress[1].long_name,
            l_housenumer: this.formattedAddress[0].long_name,
            l_city: this.formattedAddress[2].long_name,
            l_postcode: this.formattedAddress[7].long_name,
            l_country: this.formattedAddress[6].long_name,
          });
        }
        else if (this.formattedAddress.length >= 7){
          this.memoryForm.patchValue({
            l_street: this.formattedAddress[1].long_name,
            l_housenumer: this.formattedAddress[0].long_name,
            l_city: this.formattedAddress[2].long_name,
            l_postcode: this.formattedAddress[6].long_name,
            l_country: this.formattedAddress[5].long_name,
          });
        }
        else {
          this.memoryForm.patchValue({
            l_city: this.formattedAddress[1].long_name,
            l_country: this.formattedAddress[4].long_name,
          });
        }
        this.memoryForm.patchValue({
          lat: result[1].lat,
          lng: result[1].lng,
        });
      }
    });
  }

  cancelCreation(): void{
    this.router.navigate(['/home']);
  }
}
