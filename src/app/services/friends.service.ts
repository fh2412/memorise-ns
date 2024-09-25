// friends.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private apiUrl = 'http://localhost:3000/api/friends';

  constructor(private http: HttpClient) {}

  getUserFriends(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${userId}`);
  }

  getFriendsStatus(userId1: string, userId2: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/status/${userId1}/${userId2}`);
  }

  getMemoriesMissingFriends(memoryId: string, userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/missingMemory/${memoryId}/${userId}`);
  }

  getPendingFriends(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending/${userId}`);
  }

  getIngoingFriends(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ingoing/${userId}`);
  }

  getFriendSuggestions(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/friend-suggestions/${userId}`);
  }

  acceptFriendRequest(userId1: string, userId2: string): Observable<any> {
    const url = `${this.apiUrl}/accept_request/${userId1}/${userId2}`;
    return this.http.put(url, {});
  }

  removeFriend(userId1: string, userId2: string): Observable<any> {
    const url = `${this.apiUrl}/remove_friend/${userId1}/${userId2}`;
    return this.http.delete(url);
  }
  
  sendFriendRequest(senderId: string, receiverId: string): Observable<any> {
    const url = `${this.apiUrl}/send_request`;
    const body = { senderId, receiverId };
    return this.http.post(url, body);
  }

  addFriendRequest(senderId: string, receiverId: string): Observable<any> {
    const url = `${this.apiUrl}/add_friend`;
    const body = { senderId, receiverId };
    return this.http.post(url, body);
  }
  
}
