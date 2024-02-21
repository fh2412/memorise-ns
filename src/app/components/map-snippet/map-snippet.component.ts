import { Component, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow } from '@angular/google-maps';

@Component({
  selector: 'app-map-snippet',
  templateUrl: './map-snippet.component.html',
  styleUrl: './map-snippet.component.css'
})
export class MapSnippetComponent {
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
  location_details: any[] = [];
}
