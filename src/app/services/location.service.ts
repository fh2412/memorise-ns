import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateLocationResponse, MemoriseLocation } from '../models/location.model';
import { MemoryFormData } from '../models/memoryInterface.model';
import { UpdateStandardResponse } from '../models/api-responses.model';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/api/locations';

  constructor(private http: HttpClient) {}

  getLocationById(locationId: number): Observable<MemoriseLocation> {
    return this.http.get<MemoriseLocation>(`${this.apiUrl}/${locationId}`);
  }
  
  createLocation(locationData: MemoryFormData): Observable<CreateLocationResponse> {
    return this.http.post<CreateLocationResponse>(`${this.apiUrl}/createLocation`, locationData);
  }
  updateLocation(locationId: number, locationData: FormGroup): Observable<UpdateStandardResponse> {
    const url = `${this.apiUrl}/updateLocation/${locationId}`;
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