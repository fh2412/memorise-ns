import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
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
    styleUrl: './home-map-view.component.scss',
    standalone: false
})
export class HomeMapViewComponent implements OnInit {
  @Input() memories: Memory[] = [];

  markers: CustomMarker[] = [];

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

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.initializeMarkers();
  }

  private initializeMarkers(): void {
    if (this.memories.length > 0) {
      this.markers = this.memories.map((memory, index): CustomMarker => {
        return {
          position: { lat: parseFloat(memory.latitude), lng: parseFloat(memory.longitude) },
          title: index.toString(),
        };
      }).filter(marker => marker !== null) as CustomMarker[];

      // Handle the case where there are no valid markers (same logic as before)
      if (this.markers.length === 0) {
        console.warn('No valid memories found for markers');
        return;
      }

      // Set map center to the first valid marker's position
      const firstMarker = this.markers[0];
      this.center = { lat: firstMarker.position.lat, lng: firstMarker.position.lng };
    }
  }

  openInfoWindow(marker: MapMarker, pos: CustomMarker): void {
    this.currentMemory = this.memories[+pos.title];
    this.infoWindow.open(marker);
  }

  onButtonClick(memory: Memory) {
    this.router.navigate(['/memory', memory.memory_id]);
  }
}
