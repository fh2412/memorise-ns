import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { GeocoderResponse, ParsedLocation } from '../models/geocoder-response.model';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeocodingService {
  private http = inject(HttpClient);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * Coordinates → address.
   * FIX: previously the promise never resolved when Google returned no results
   * (e.g. click into the ocean) → the map dialog hung. Now it always resolves;
   * non-OK results come back with their status and an empty result list.
   */
  async geocodeLatLng(location: google.maps.LatLngLiteral): Promise<GeocoderResponse> {
    const geocoder = await this.createGeocoder();
    try {
      const response = await geocoder.geocode({ location });
      return new GeocoderResponse('OK', response.results);
    } catch (error) {
      // MapsRequestError carries the status in `code` (e.g. ZERO_RESULTS)
      const status = (error as { code?: string } | null)?.code ?? 'ERROR';
      return new GeocoderResponse(status, []);
    }
  }

  /** Coordinates → { city, country, countryCode } or null. Never throws. */
  async reverseGeocode(location: google.maps.LatLngLiteral): Promise<ParsedLocation | null> {
    try {
      const response = await this.geocodeLatLng(location);
      if (response.status !== 'OK') return null;
      const parsed = this.parseGeocodingResponse(response);
      return parsed.country || parsed.city ? parsed : null;
    } catch {
      return null; // Maps not loaded / SSR
    }
  }

  async geocodeAddress(country: string, city: string, postalCode: string): Promise<GeocoderResponse> {
    const geocoder = await this.createGeocoder();
    const address = `${postalCode}, ${city}, ${country}`;
    try {
      const response = await geocoder.geocode({ address });
      return new GeocoderResponse('OK', response.results);
    } catch (error) {
      const status = (error as { code?: string } | null)?.code ?? 'ERROR';
      throw new Error(`Geocoding failed: ${status}`);
    }
  }

  getLocation(term: string): Observable<GeocoderResponse> {
    const url = `https://maps.google.com/maps/api/geocode/json?address=${term}&sensor=false&key=${environment.googleApiKey}`;
    return this.http.get<GeocoderResponse>(url);
  }

  parseGeocodingResponse(response: GeocoderResponse): ParsedLocation {
    const result: ParsedLocation = { country: '', countryCode: '', city: '' };

    if (response.status !== 'OK' || !response.results?.length) return result;

    const components = response.results[0].address_components;
    if (!components) return result;

    for (const component of components) {
      const types = component.types ?? [];
      if (types.includes('country')) {
        result.country = component.long_name;
        result.countryCode = component.short_name;
      }
      if (types.includes('locality')) {
        result.city = component.long_name;
      } else if (!result.city && types.includes('administrative_area_level_2')) {
        result.city = component.long_name;
      } else if (!result.city && types.includes('postal_town')) {
        result.city = component.long_name;
      }
    }

    return result;
  }

  /** Works with the classic script tag AND with the async loader (importLibrary). */
  private async createGeocoder(): Promise<google.maps.Geocoder> {
    if (!this.isBrowser || typeof google === 'undefined' || !google.maps) {
      throw new Error('Google Maps is not loaded');
    }
    if (!google.maps.Geocoder && typeof google.maps.importLibrary === 'function') {
      await google.maps.importLibrary('geocoding');
    }
    return new google.maps.Geocoder();
  }
}
