import { Component, Input, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow } from '@angular/google-maps';

@Component({
  selector: 'app-map-snippet',
  templateUrl: './map-snippet.component.html',
  styleUrl: './map-snippet.component.css'
})
export class MapSnippetComponent {
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;
  @Input() long: string='';
  @Input() lat: string='';

  mapOptions: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 20,
    minZoom: 4,
    streetViewControl: false,
  };
  markerOptions: google.maps.MarkerOptions = {draggable: false};

  mapCenter: google.maps.LatLng | undefined;
  markerPosition!: google.maps.LatLng;

  ngOnInit() {
    const lat: number = parseFloat(this.lat);
    const lng: number = parseFloat(this.long);
    this.mapCenter = (new google.maps.LatLng(lng, lat));
    this.markerPosition = (new google.maps.LatLng(lng, lat));
  }
}
