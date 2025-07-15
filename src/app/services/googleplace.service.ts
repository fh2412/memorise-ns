import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
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
  };
}

export interface AutocompleteResponse {
  suggestions: PlaceSuggestion[];
}

@Injectable({
  providedIn: 'root'
})
export class GooglePlacesService {
  private readonly API_URL = 'https://places.googleapis.com/v1/places:autocomplete';

  constructor(private http: HttpClient) {}

  autocomplete(request: AutocompleteRequest): Observable<AutocompleteResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': environment.googleApiKey
    });

    return this.http.post<AutocompleteResponse>(
      this.API_URL,
      request,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Places API Error:', error);
        return of({ suggestions: [] });
      })
    );
  }

  // Convenience-Methode für Autocomplete mit besserer Struktur
  getPlaceSuggestions(query: string, latitude?: number, longitude?: number): Observable<PlaceSuggestion[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    const request: AutocompleteRequest = {
      input: query
    };

    if (latitude && longitude) {
      request.locationBias = {
        circle: {
            center: { latitude, longitude },
            radius: 100
        }
      };
    }

    return this.autocomplete(request).pipe(
      map(response => response.suggestions || [])
    );
  }
}