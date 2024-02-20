import { Component, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow } from '@angular/google-maps';
import { GeocodingService } from '../../../services/geocoding.service';
import { MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-choose-location',
  templateUrl: './choose-location.component.html',
  styleUrl: './choose-location.component.css'
})
export class ChooseLocationComponent {
  constructor( private geocodingService: GeocodingService, public dialogRef: MatDialogRef<ChooseLocationComponent>,) {}

  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;

  mapZoom = 7;
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

  fulladdress: any;
  geocoderWorking = false;
  geolocationWorking = false;

  address: string ='';
  formattedAddress?: string | null = null;
  locationCoords?: google.maps.LatLng | null = null;

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
      this.fulladdress = await this.geocodingService.geocodeLatLng(this.markerPosition);
      console.log(this.fulladdress.results[0]);
    }
    this.dialogRef.close(this.fulladdress.results[0]);
  }
}
