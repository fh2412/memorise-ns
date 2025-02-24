import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { GoogleMap, MapInfoWindow } from '@angular/google-maps';

@Component({
    selector: 'app-map-snippet',
    templateUrl: './map-snippet.component.html',
    styleUrls: ['./map-snippet.component.scss'],
    standalone: false
})
export class MapSnippetComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow!: MapInfoWindow;
  @Input() lng!: number;
  @Input() lat!: number;

  mapOptions: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 20,
    minZoom: 4,
    streetViewControl: false,
  };
  options: google.maps.MapOptions = { draggable: false };
  mapCenter: google.maps.LatLngLiteral = { lat: 11.319161, lng: 18.684998 };
  markerPosition: google.maps.LatLngLiteral = { lat: 11.319161, lng: 18.684998 };

  ngOnInit() {
    const lat = Number(this.lat);
    const lng = Number(this.lng)
    this.mapCenter = { lat: lat, lng: lng };
    this.markerPosition = { lat: lat, lng: lng };
  }
}
