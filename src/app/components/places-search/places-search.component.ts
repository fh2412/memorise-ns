import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Observable, of, startWith, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { PlaceSuggestion, GooglePlacesService } from '../../services/googleplace.service';

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
  searchControl = new FormControl('');
  filteredSuggestions: Observable<PlaceSuggestion[]> = of([]);

  // Optional: Aktuelle Position für bessere Suchergebnisse
  currentLatitude?: number;
  currentLongitude?: number;

  constructor(private placesService: GooglePlacesService) { }

  ngOnInit() {
    this.setupAutocomplete();
    this.getCurrentLocation();
  }

  private setupAutocomplete() {
    this.filteredSuggestions = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300), // Wartet 300ms nach dem letzten Tastendruck
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string') {
          return this.placesService.getPlaceSuggestions(
            value,
            this.currentLatitude,
            this.currentLongitude
          );
        }
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
        },
        (error) => {
          console.warn('Geolocation nicht verfügbar:', error);
        }
      );
    }
  }

  displayFn(suggestion: PlaceSuggestion): string {
    return suggestion ? suggestion.placePrediction.text.text : '';
  }

  onPlaceSelected(event: any) {
    const selectedPlace: PlaceSuggestion = event.option.value;
    console.log('Ausgewählter Ort:', selectedPlace);

    // Hier kannst du weitere Aktionen ausführen, z.B.:
    // - Place Details API aufrufen
    // - Navigation zu dem Ort
    // - Formular mit Daten füllen
  }
}
