import { Component, Input, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-map-view',
  templateUrl: './home-map-view.component.html',
})
export class HomeMapViewComponent {
  @Input() memories: any[] = [];

  markers: any[] = [];

  @ViewChild(MapInfoWindow)infoWindow!: MapInfoWindow;

  zoom = 5;
  center: google.maps.LatLngLiteral = { lat: 37.7749, lng: -122.4194 };
  options: google.maps.MapOptions = {
    zoomControl: false,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 15,
  };
  currentmemory: any = '';
 
  constructor(private router: Router) {}

  ngOnInit() {
    const markers: any[] = this.memories.map((memory) => ({
      lat: parseFloat(memory.latitude), // Convert latitude to number
      lng: parseFloat(memory.longitude), // Convert longitude to number
    }));
    const marker_locations = markers.map((position, i) => {
      const marker = new google.maps.Marker({
        position,
        title: i.toString(),
      });
      return marker;
    });

    this.markers = marker_locations;
    this.center = { lat: markers[0].lat, lng: markers[0].lng };
  }
 
  openInfoWindow(marker: MapMarker, pos: any) {
    this.currentmemory = this.memories[pos.title];
    this.infoWindow.open(marker);
  }
  onButtonClick(memory: any) {
    this.router.navigate(['/memory', memory.memory_id]);
  }
}
