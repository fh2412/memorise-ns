import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';


export interface LocationBias {
  circle: {
    center: {
      latitude: number;
      longitude: number;
    };
    radius: number;
  };
}

export interface AutocompleteRequest {
  input: string;
  locationBias?: LocationBias;
  includedPrimaryTypes?: string[];
  includeQueryPredictions?: boolean;
}

export interface PlaceSuggestion {
  placePrediction: {
    place: string;
    placeId: string;
    text: {
      text: string;
    };
    structuredFormat: {
      mainText: {
        text: string;
      };
      secondaryText: {
        text: string;
      };
    };
    types: string[];
  };
}

export interface PlaceDetails {
  id: string;
  displayName: {
    text: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  formattedAddress: string;
  types: string[];
}

export interface PlaceDetailsRequest {
  name: string;
  languageCode?: string;
}

export interface AutocompleteResponse {
  suggestions: PlaceSuggestion[];
}

@Injectable({
  providedIn: 'root'
})
export class GooglePlacesService {
  private readonly AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
  private readonly PLACE_DETAILS_URL = 'https://places.googleapis.com/v1/places';
  private readonly API_KEY = environment.googlePlacesKey;

  constructor(private http: HttpClient) {}

  autocomplete(request: AutocompleteRequest): Observable<AutocompleteResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': this.API_KEY
    });

    return this.http.post<AutocompleteResponse>(
      this.AUTOCOMPLETE_URL,
      request,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Places API Error:', error);
        return of({ suggestions: [] });
      })
    );
  }

  // Place Details API Call um Koordinaten zu erhalten
  getPlaceDetails(placeId: string): Observable<PlaceDetails> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': this.API_KEY
    });

    // Spezifische Felder anfordern um Kosten zu reduzieren
    const url = `${this.PLACE_DETAILS_URL}/${placeId}?fields=id,displayName,location,formattedAddress,types&languageCode=de&key=${environment.googleApiKey}`;

    return this.http.get<PlaceDetails>(url, { headers }).pipe(
      catchError(error => {
        console.error('Place Details API Error:', error);
        throw error;
      })
    );
  }

  // Erweiterte Methode: Autocomplete nur für Orte (nicht Geschäfte)
  getLocationSuggestions(query: string, latitude?: number, longitude?: number, radius = 5000): Observable<PlaceSuggestion[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    const request: AutocompleteRequest = {
      input: query,
      // Nur geografische Orte, keine Geschäfte
      includedPrimaryTypes: [
        'locality',           // Städte
        'sublocality',        // Stadtteile
        'administrative_area_level_1', // Bundesländer/Staaten
        'administrative_area_level_2', // Landkreise
        'country',            // Länder
        'postal_code',        // Postleitzahlen
      ],
      includeQueryPredictions: false // Nur Orte, keine Suchanfragen
    };

    if (latitude && longitude) {
      request.locationBias = {
        circle: {
          center: { latitude, longitude },
          radius
        }
      };
    }

    return this.autocomplete(request).pipe(
      map(response => response.suggestions || [])
    );
  }

  // Kombinierte Methode: Autocomplete + Details in einem Aufruf
  getLocationWithCoordinates(query: string, latitude?: number, longitude?: number): Observable<{suggestion: PlaceSuggestion, details: PlaceDetails}[]> {
    return this.getLocationSuggestions(query, latitude, longitude).pipe(
      switchMap(suggestions => {
        if (suggestions.length === 0) {
          return of([]);
        }

        // Für jeden Vorschlag die Details abrufen
        const detailRequests = suggestions.map(suggestion => 
          this.getPlaceDetails(suggestion.placePrediction.placeId).pipe(
            map(details => ({ suggestion, details })),
            catchError(error => {
              console.error('Error loading details for:', suggestion.placePrediction.text.text, error);
              return of(null);
            })
          )
        );

        return forkJoin(detailRequests).pipe(
          map(results => results.filter(result => result !== null))
        );
      })
    );
  }
}