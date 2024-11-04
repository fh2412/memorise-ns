import { Component, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { GoogleMap, MapInfoWindow } from '@angular/google-maps';

@Component({
  selector: 'app-map-snippet',
  templateUrl: './map-snippet.component.html',
  styleUrls: ['./map-snippet.component.scss']
})
export class MapSnippetComponent implements OnChanges {
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;
  @Input() lng!: number;
  @Input() lat!: number;

  mapOptions: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 20,
    minZoom: 4,
    streetViewControl: false,
  };
  markerOptions: google.maps.MarkerOptions = { draggable: false };

  mapCenter: google.maps.LatLng | undefined;
  markerPosition!: google.maps.LatLng;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lat'] || changes['lng']) {
      this.updateMapCenter();
    }
  }

  private updateMapCenter(): void {
    if (this.isValidCoordinate(this.lat, this.lng)) {
      this.mapCenter = new google.maps.LatLng(this.lat, this.lng);
      this.markerPosition = this.mapCenter;
    } else {
      console.warn('Invalid latitude or longitude. Centering map to default location.');
      // Fallback to a default location if coordinates are invalid (e.g., New York City)
      this.mapCenter = new google.maps.LatLng(40.7128, -74.0060);
      this.markerPosition = this.mapCenter;
    }
  }

  private isValidCoordinate(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
}
