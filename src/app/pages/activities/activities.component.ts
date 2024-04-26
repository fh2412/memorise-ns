import { Component, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { GeocodingService } from '../../services/geocoding.service';
import { GeocoderResponse } from '../../models/geocoder-response.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ChooseLocationComponent } from '../../components/_dialogs/choose-location/choose-location.component';


@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss'
})
export class ActivitiesComponent {
  constructor( private geocodingService: GeocodingService, public dialog: MatDialog) {}

  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;

  mapCenter!: google.maps.LatLng;
  mapOptions: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 20,
    minZoom: 4,
    streetViewControl: false,
  };

  markerInfoContent = '';
  //markerOptions: google.maps.MarkerOptions = {
  //  draggable: false,
  //  animation: google.maps.Animation.DROP,
  //};

  geocoderWorking = false;
  geolocationWorking = false;

  address: string ='';
  formattedAddress?: string | null = null;
  locationCoords?: google.maps.LatLng | null = null;

  get isWorking(): boolean {
    return this.geolocationWorking || this.geocoderWorking;
  }

  openInfoWindow(marker: MapMarker) {
    if(this.infoWindow){
      this.infoWindow.open(marker);
    }
  }

  markerOptions: google.maps.MarkerOptions = {draggable: false};
  markerPosition!: google.maps.LatLngLiteral;
  addMarker(event: google.maps.MapMouseEvent) {
    if(event.latLng){
      this.markerPosition=event.latLng.toJSON();
      console.log(this.markerPosition);
    }
  }

  async submitAddress() {
    if(this.markerPosition) {
      var fulladdress = await this.geocodingService.geocodeLatLng(this.markerPosition);
      console.log(fulladdress.results[0]);
    }
  }


  findAddress() {
    if (!this.address || this.address.length === 0) {
      return;
    }
  
    this.geocoderWorking = true;
    this.geocodingService
      .getLocation(this.address)
      .subscribe(
        (response: GeocoderResponse) => {
          if (response.status === 'OK' && response.results?.length) {
            const location = response.results[0];
            const loc: any = location.geometry.location;
  
            this.locationCoords = new google.maps.LatLng(loc.lat, loc.lng);
  
            this.mapCenter = location.geometry.location;
  
            setTimeout(() => {
              if (this.map !== undefined) {
                this.map.panTo(location.geometry.location);
              }
            }, 500);
  
            this.address = location.formatted_address;
            this.formattedAddress = location.formatted_address;
            this.markerInfoContent = location.formatted_address;
  
            this.markerOptions = {
              draggable: true,
              animation: google.maps.Animation.DROP,
            };
          } else {
            console.log(response.error_message, response.status);
          }
        },
        (err: HttpErrorResponse) => {
          console.error('geocoder error', err);
        }
      )
      .add(() => {
        this.geocoderWorking = false;
      });
  }

  openMapDialog(): void {
    const dialogRef = this.dialog.open(ChooseLocationComponent, {
      data: { mapCenter: this.mapCenter },
      width: '500px',
      height: '542px'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log("result:", result);
        this.formattedAddress = result.formatted_address;
      }
    });
  }
}
