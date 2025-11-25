import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { MemoryDisplayStats, VisitedCountry } from '../models/memoryInterface.model';
import { Observable } from 'rxjs';

interface Count {
  count: number;
}

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









  //the following routes are currently UNUSED!!!

  getMemoryCount(user_id: string) {
    return this.http.get<Count>(`${this.apiUrl}/memorystats/created/${user_id}`);
  }

  getMemoryCountThisYear(user_id: string) {
    return this.http.get<Count>(`${this.apiUrl}/memorystats/createdthisyear/${user_id}`); // Adjust the endpoint according to your API
  }

  getFriendsCount(user_id: string) {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<Count>(`${this.apiUrl}/memorystats/friendcount/${user_id}`); // Adjust the endpoint according to your API
  }
}
