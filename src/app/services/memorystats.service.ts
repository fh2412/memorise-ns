import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MemorystatsService {
  private apiUrl = 'http://localhost:3000/api'; // Replace with your API endpoint


  constructor(private http: HttpClient) { }
  getMemoryCount(user_id: string) {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<any>(`${this.apiUrl}/memorystats/created/${user_id}`); // Adjust the endpoint according to your API
  }

  getMemoryCountThisYear(user_id: string) {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<any>(`${this.apiUrl}/memorystats/createdthisyear/${user_id}`); // Adjust the endpoint according to your API
  }

  getFriendsCount(user_id: string) {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<any>(`${this.apiUrl}/memorystats/friendcount/${user_id}`); // Adjust the endpoint according to your API
  }
}
