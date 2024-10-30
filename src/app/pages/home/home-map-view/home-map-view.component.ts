import { Component, Input, ViewChild } from '@angular/core';
import {  MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Router } from '@angular/router';
import { Memory } from '../../../models/memoryInterface.model';


export interface CustomMarker {
  position: google.maps.LatLngLiteral;
  title: string;
  element?: google.maps.marker.AdvancedMarkerElement;
}

@Component({
  selector: 'app-home-map-view',
  templateUrl: './home-map-view.component.html',
  styleUrl: './home-map-view.component.scss'
})
export class HomeMapViewComponent {
  @Input() memories: Memory[] = [];

  markers: any[] = [];

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

  zoom = 5;
  center: google.maps.LatLngLiteral = { lat: 37.7749, lng: -122.4194 };
  options: google.maps.MapOptions = {
    zoomControl: false,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 15,
  };
  currentMemory: Memory | null = null;
 
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeMarkers();
  }

  private initializeMarkers(): void {
    if (this.memories.length > 0) {
      this.markers = this.memories.map((memory, index) => new google.maps.Marker({
        position: {
          lat: parseFloat(memory.latitude),
          lng: parseFloat(memory.longitude),
        },
        title: index.toString(),
      }));

      // Set map center to the first marker's position
      const firstMarkerPosition = this.markers[0].getPosition();
      if (firstMarkerPosition) {
        this.center = {
          lat: firstMarkerPosition.lat(),
          lng: firstMarkerPosition.lng(),
        };
      }
    }
  }
 
  openInfoWindow(marker: MapMarker, pos: any): void {
    this.currentMemory = this.memories[+pos.title];
    this.infoWindow.open(marker);
  }

  onButtonClick(memory: any) {
    this.router.navigate(['/memory', memory.memory_id]);
  }
}
