import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { MemoryDisplayStats, VisitedCountry } from '../models/memoryInterface.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class MemorystatsService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}`;

  getDisplayStats(user_id: string): Observable<MemoryDisplayStats> {
    return this.http.get<MemoryDisplayStats>(`${this.apiUrl}/memorystats/display/${user_id}`);
  }

  getVisitedCountries(user_id: string): Observable<VisitedCountry[]> {
    return this.http.get<VisitedCountry[]>(`${this.apiUrl}/memorystats/visitedCounties/${user_id}`);
  }
}
