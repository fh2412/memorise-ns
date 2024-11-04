import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/api/locations';

  constructor(private http: HttpClient) {}

  getLocationById(locationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${locationId}`);
  }
  
  createLocation(locationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createLocation`, locationData);
  }
  updateLocation(locationId: number, locationData: any): Observable<any> {
    const url = `${this.apiUrl}/updateLocation/${locationId}`;
    return this.http.put(url, locationData);
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