import { Component, ViewChild, inject } from '@angular/core';
import { GoogleMap, GoogleMapsModule, MapInfoWindow } from '@angular/google-maps';
import { GeocodingService } from '@services/geocoding.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { GeocoderResponse, ParsedLocation } from '@models/geocoder-response.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
    selector: 'app-choose-location',
    templateUrl: './choose-location.component.html',
    standalone: true,
    imports: [
      MatDialogModule,
      GoogleMapsModule,
      MatIconModule,
      MatButtonModule
    ]
})
export class ChooseLocationComponent {
  private geocodingService = inject(GeocodingService);
  dialogRef = inject<MatDialogRef<ChooseLocationComponent>>(MatDialogRef);
  data = inject<{
    lat: number;
    long: number;
}>(MAT_DIALOG_DATA);


  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;

  mapZoom = 5;
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

  locationCoords: google.maps.LatLng | null = null;
  parsedLocation: ParsedLocation | undefined;

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
      this.parsedLocation = await this.geocodingService.parseGeocodingResponse(this.fulladdress);
      console.log(this.parsedLocation);
    }
    this.dialogRef.close(
      {
        parsedLocation: this.parsedLocation,
        markerPosition: this.markerPosition,
      }
    );
  }
}
