import { Component, Input, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Marker } from '@googlemaps/markerclusterer';

interface Markers {
  lat: number;
  lng: number;
  title: string;
  id: number;
}

@Component({
  selector: 'app-home-map-view',
  templateUrl: './home-map-view.component.html',
  styleUrl: './home-map-view.component.scss'
})
export class HomeMapViewComponent {
  @Input() memories: any[] = [];

    /*const infoWindow = new google.maps.InfoWindow();
  
    // Add some markers to the map.
    const markers = location.map((position, i) => {
      const label = "";
      const marker = new google.maps.Marker({
        position,
        label,
      });
  
      marker.addListener("click", () => {
        const memory = this.memories[i];
        this.infoWindowComponent.memory = memory; // Pass memory data
        const infoWindowContent = this.infoWindowComponent;
        //infoWindow.setContent(infoWindowContent);
        infoWindow.open(map, marker);
      });
  
      return marker;
    });
  
    // Add a marker clusterer to manage the markers.
    new MarkerClusterer({ markers, map });
  }

  onButtonClick(memory: any) {
    this.router.navigate(['/memory', memory.memory_id]);
  }*/

  markers: any[] = [
    { lat: 37.7749, lng: -122.4194, title: 'Marker 1', id: 1 },
    // ... other markers
  ];

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap | undefined;
  @ViewChild(MapInfoWindow)
  infoWindow!: MapInfoWindow;
   
  zoom = 5;
  center: google.maps.LatLngLiteral = { lat: 37.7749, lng: -122.4194 };
  options: google.maps.MapOptions = {
    zoomControl: false,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    maxZoom: 15,
  };
  infoContent = '';
 
  ngOnInit() {
    /*navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    });*/
    const markers: any[] = this.memories.map((memory) => ({
      lat: parseFloat(memory.latitude), // Convert latitude to number
      lng: parseFloat(memory.longitude), // Convert longitude to number
      title: memory.title,
      id: memory.memory_id,
    }));
    const marker_locations = markers.map((position, i) => {
      const label = "";
      const marker = new google.maps.Marker({
        position,
        label,
      });
      return marker;
    });

    this.markers=marker_locations;
    this.center = { lat: markers[0].lat, lng: markers[0].lng };
  }
 
  openInfoWindow(marker: MapMarker) {
    this.infoWindow.open(marker);
  }
  
}
