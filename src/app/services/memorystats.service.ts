import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

interface Count {
  count: number;
}

@Injectable({
  providedIn: 'root'
})

export class MemorystatsService {
  private apiUrl = `${environment.apiUrl}/api`;


  constructor(private http: HttpClient) { }
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
