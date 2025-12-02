import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateLocationResponse, MemoriseLocation } from '../models/location.model';
import { UpdateStandardResponse } from '../models/api-responses.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/locations`;

  getLocationById(locationId: number): Observable<MemoriseLocation> {
    return this.http.get<MemoriseLocation>(`${this.apiUrl}/${locationId}`);
  }
  
  createLocation(locationData: MemoriseLocation): Observable<CreateLocationResponse> {
    console.log("Creating Location: ", locationData);
    return this.http.post<CreateLocationResponse>(`${this.apiUrl}/createLocation`, locationData);
  }
  updateLocation(locationId: number, locationData: MemoriseLocation): Observable<UpdateStandardResponse> {
    const url = `${this.apiUrl}/updateLocation/${locationId}`;
    console.log("Updating Location: ", locationData);
    return this.http.put<UpdateStandardResponse>(url, locationData);
  }

  parseFormattedAddress(formattedAddress: string): { city: string; postalCode: string; country: string } {
    const postalCodeRegex = /\b\d{4,5}\b/;
    const countryRegex = /,\s?([^,]+)$/;
    const cityRegex = /,?\s?(\d{4,5}\s[^\d,]+)/;
  
    // Extract components
    const postalCodeMatch = formattedAddress.match(postalCodeRegex);
    const countryMatch = formattedAddress.match(countryRegex);
    const cityMatch = formattedAddress.match(cityRegex);
  
    return {
      postalCode: postalCodeMatch ? postalCodeMatch[0] : '',
      country: countryMatch ? countryMatch[1].trim() : '',
      city: cityMatch ? cityMatch[1].trim() : '',
    };
  }
  
}