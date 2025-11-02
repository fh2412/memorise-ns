import { Component, ViewChild, OnInit, Input } from '@angular/core';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Router } from '@angular/router';
import { Memory, MemoryMapData } from '../../../models/memoryInterface.model';
import { firstValueFrom } from 'rxjs';
import { MemoryService } from '../../../services/memory.service';


export interface CustomMarker {
  position: google.maps.LatLngLiteral;
  title: string;
  memory_id: number;
  element?: google.maps.marker.AdvancedMarkerElement;
}

@Component({
  selector: 'app-home-map-view',
  templateUrl: './home-map-view.component.html',
  styleUrl: './home-map-view.component.scss',
  standalone: false
})
export class HomeMapViewComponent implements OnInit {

  @Input() userId = '';
  memories: MemoryMapData[] = [];
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

  constructor(private router: Router, private memoryService: MemoryService) { }

  async ngOnInit(): Promise<void> {
    await this.loadMapMarkers(true);
    this.initializeMarkers();
  }

  private async loadMapMarkers(includeShared: boolean): Promise<void> {
    try {
      this.memories = await firstValueFrom(
        this.memoryService.getMemoriesMapData(this.userId, includeShared)
      );
      console.log(this.memories);
    } catch (error) {
      console.error('Error loading map markers:', error);
      this.memories = [];
    }
  }

  private initializeMarkers(): void {
    if (this.memories.length > 0) {
      this.markers = this.memories.map((memory, index): CustomMarker => {
        return {
          position: { lat: parseFloat(memory.latitude), lng: parseFloat(memory.longitude) },
          title: index.toString(),
          memory_id: memory.memory_id
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

  async openInfoWindow(marker: MapMarker, pos: CustomMarker): Promise<void> {
    this.currentMemory = await firstValueFrom(
        this.memoryService.getMemory(pos.memory_id)
    );
    this.infoWindow.open(marker);
  }

  onButtonClick(memory: Memory) {
    this.router.navigate(['/memory', memory.memory_id]);
  }
}
