import { Component, Inject, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow } from '@angular/google-maps';
import { GeocodingService } from '../../../services/geocoding.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GeocoderResponse } from '../../../models/geocoder-response.model';


@Component({
    selector: 'app-choose-location',
    templateUrl: './choose-location.component.html',
    styleUrl: './choose-location.component.scss',
    standalone: false
})
export class ChooseLocationComponent {
  constructor(private geocodingService: GeocodingService, public dialogRef: MatDialogRef<ChooseLocationComponent>, @Inject(MAT_DIALOG_DATA) public data: { lat: number, long: number }) { }

  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;

  mapZoom = 5;
  //mapCenter: google.maps.LatLng = new google.maps.LatLng(this.data.lat, this.data.long);
  mapCenter: google.maps.LatLngLiteral = {lat: this.data.lat, lng: this.data.long};
  mapOptions: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 20,
    minZoom: 4,
    streetViewControl: false,
  };

  fulladdress!: GeocoderResponse;
  geocoderWorking = false;
  geolocationWorking = false;

  formattedAddress: string | null = null;
  locationCoords: google.maps.LatLng | null = null;

  markerOptions: google.maps.MarkerOptions = { draggable: false };
  markerPosition!: google.maps.LatLngLiteral;

  addMarker(event: google.maps.MapMouseEvent) {
    if (event.latLng) {
      this.markerPosition = event.latLng.toJSON();
    }
  }

  async submitAddress() {
    if (this.markerPosition) {
      this.fulladdress = await this.geocodingService.geocodeLatLng(this.markerPosition);
      console.log("Full Adress: ", this.fulladdress.results[0]);
      this.formattedAddress = this.fulladdress.results[0].formatted_address;
    }
    this.dialogRef.close(
      {
        formattedAddress: this.formattedAddress,
        markerPosition: this.markerPosition,
      }
    );
  }
}
