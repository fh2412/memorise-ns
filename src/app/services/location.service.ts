import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/api/locations';

  constructor(private http: HttpClient) {}

  getLocationById(locationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${locationId}`);
  }
  
  createLocation(locationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createLocation`, locationData);
  }
}