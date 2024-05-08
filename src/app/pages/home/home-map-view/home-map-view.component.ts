import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

interface Location {
  lat: number;
  lng: number;
}

interface Memory {
  memory_id: number;
  title: string;
  text: string;
  date: string;
}

@Component({
  selector: 'app-home-map-view',
  templateUrl: './home-map-view.component.html',
  styleUrl: './home-map-view.component.scss'
})
export class HomeMapViewComponent {
  locations = [
    { lat: -31.56391, lng: 147.154312 },
  ];

  @Input() memories: any[] = [];
  

  ngOnInit() {
    const location: Location[] = this.memories.map(obj => ({
      lat: parseFloat(obj.latitude),
      lng: parseFloat(obj.longitude),
    }));
    const map = new google.maps.Map(
      document.getElementById("map") as HTMLElement,
      {
        zoom: 3,
        center: { lat: 47.5, lng: 14.5 },
      }
    );
  
    const infoWindow = new google.maps.InfoWindow({
      content: "",
      disableAutoPan: true,
    });
  
    // Add some markers to the map.
    const markers = location.map((position, i) => {
      const label = "";
      const marker = new google.maps.Marker({
        position,
        label,
      });
  
      // markers can only be keyboard focusable when they have click listeners
      // open info window when marker is clicked
      marker.addListener("click", () => {
        infoWindow.setContent(this.memories[i].title);
        infoWindow.open(map, marker);
      });
  
      return marker;
    });
  
    // Add a marker clusterer to manage the markers.
    new MarkerClusterer({ markers, map });
  }
  
}
