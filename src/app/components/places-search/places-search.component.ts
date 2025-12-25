import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Observable, of, startWith, debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs';
import { GooglePlacesService } from '@services/googleplace.service';

export interface LocationResult {
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  placeId: string;
}

@Component({
  selector: 'app-places-search',
  templateUrl: './places-search.component.html',
  styleUrl: './places-search.component.scss',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatIconModule,
    AsyncPipe,
  ]
})
export class PlacesSearchComponent implements OnInit {
  private placesService = inject(GooglePlacesService);

  searchControl = new FormControl('');
  filteredLocations: Observable<LocationResult[]> = of([]);
  selectedLocation: LocationResult | null = null;
  isLoading = false;
  
  // Aktuelle Position für bessere Suchergebnisse
  currentLatitude?: number;
  currentLongitude?: number;

  ngOnInit() {
    this.setupAutocomplete();
    this.getCurrentLocation();
  }

  private setupAutocomplete() {
    this.filteredLocations = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(400), // Etwas länger warten für bessere Performance
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string' && value.length >= 2) {
          this.isLoading = true;
          
          return this.placesService.getLocationWithCoordinates(
            value,
            this.currentLatitude,
            this.currentLongitude
          ).pipe(
            map(results => {
              this.isLoading = false;
              return results.map(result => ({
                name: result.details.displayName.text,
                address: result.details.formattedAddress,
                coordinates: {
                  latitude: result.details.location.latitude,
                  longitude: result.details.location.longitude
                },
                placeId: result.details.id
              }));
            }),
            catchError(error => {
              this.isLoading = false;
              console.error('Search error:', error);
              return of([]);
            })
          );
        }
        this.isLoading = false;
        return of([]);
      })
    );
  }

  private getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLatitude = position.coords.latitude;
          this.currentLongitude = position.coords.longitude;
          console.log('Current location:', this.currentLatitude, this.currentLongitude);
        },
        (error) => {
          console.warn('Geolocation nicht verfügbar:', error);
        }
      );
    }
  }

  displayFn(location: LocationResult): string {
    return location ? location.name : '';
  }

  onLocationSelected(event: any) {
    const selectedLocation: LocationResult = event.option.value;
    this.selectedLocation = selectedLocation;
    
    console.log('Ausgewählter Ort:', selectedLocation);
    
    // Hier kannst du weitere Aktionen ausführen:
    // - Karte zu den Koordinaten zentrieren
    // - Formular mit Daten füllen
    // - Event emittieren für Parent-Komponente
  }
}
