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

  getAddressComponents(address: any[], length: 'short' | 'long', filter: string): string | undefined {
    const findType = (type: any) => type.types[0] === filter;
    const location = address.map(obj => obj);
    const rr = location.filter(findType)[0];
  
    return (
      length === 'short'
        ? rr?.short_name
        : rr?.long_name
    );
  }
}