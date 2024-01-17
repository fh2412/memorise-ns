// friends.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private apiUrl = 'http://localhost:3000/api/friends'; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  getUserFriends(userId: string): Observable<any[]> {
    // Implement the logic to fetch user friends
    // Use HttpClient to make a GET request to your backend
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
  }

  getPendingFriends(userId: string): Observable<any[]> {
    // Implement the logic to fetch user friends
    // Use HttpClient to make a GET request to your backend
    return this.http.get<any[]>(`${this.apiUrl}/pending/${userId}`);
  }

  getIngoingFriends(userId: string): Observable<any[]> {
    // Implement the logic to fetch user friends
    // Use HttpClient to make a GET request to your backend
    return this.http.get<any[]>(`${this.apiUrl}/ingoing/${userId}`);
  }

  getFriendSuggestions(userId: string): Observable<any[]> {
    // Implement the logic to fetch friend suggestions
    // Use HttpClient to make a GET request to your backend
    return this.http.get<any[]>(`${this.apiUrl}/friend-suggestions/${userId}`);
  }

  // Add more methods as needed (e.g., send friend request, accept/reject friend request)
}
