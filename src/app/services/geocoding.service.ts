import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GeocoderResponse, ParsedLocation } from '../models/geocoder-response.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeocodingService {
  private http = inject(HttpClient);


  geocodeLatLng(location: google.maps.LatLngLiteral): Promise<GeocoderResponse> {
    const geocoder = new google.maps.Geocoder();

    return new Promise((resolve) => {
      geocoder.geocode({ 'location': location }, (results, status) => {
        if(results){
            const response = new GeocoderResponse(status, results);
            resolve(response);
        }
      });
    });
  }

  geocodeAddress(country: string, city: string, postalCode: string): Promise<GeocoderResponse> {
    const geocoder = new google.maps.Geocoder();
    const address = `${postalCode}, ${city}, ${country}`;  // Combine the address parts
  
    return new Promise((resolve, reject) => {
      geocoder.geocode({ 'address': address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          const response = new GeocoderResponse(status, results);
          resolve(response);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  getLocation(term: string): Observable<GeocoderResponse> {
    const url = `https://maps.google.com/maps/api/geocode/json?address=${term}&sensor=false&key=${environment.googleApiKey}`;
    return this.http.get<GeocoderResponse>(url);
  }

  parseGeocodingResponse(response: GeocoderResponse): ParsedLocation {
    const result: ParsedLocation = {
      country: '',
      countryCode: '',
      city: ''
    };

    // Prüfe ob die Antwort erfolgreich war und Ergebnisse enthält
    if (response.status !== 'OK' || !response.results || response.results.length === 0) {
      return result;
    }

    // Nimm das erste Ergebnis
    const firstResult = response.results[0];
    
    if (!firstResult.address_components) {
      return result;
    }

    // Durchsuche alle address_components
    firstResult.address_components.forEach(component => {
      if (!component.types || component.types.length === 0) {
        return;
      }

      // Land extrahieren
      if (component.types.includes('country')) {
        result.country = component.long_name;
        result.countryCode = component.short_name;
      }

      // Stadt extrahieren - verschiedene Typen berücksichtigen
      if (component.types.includes('locality')) {
        result.city = component.long_name;
      } else if (!result.city && component.types.includes('administrative_area_level_2')) {
        // Fallback auf administrative_area_level_2 wenn keine locality gefunden
        result.city = component.long_name;
      } else if (!result.city && component.types.includes('postal_town')) {
        // Weiterer Fallback für UK und andere Länder
        result.city = component.long_name;
      }
    });

    return result;
  }
}