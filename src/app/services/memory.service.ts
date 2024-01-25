import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  private apiUrl = 'http://localhost:3000/api'; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  getMemory(memory_id: string) {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<any>(`${this.apiUrl}/memories/${memory_id}`); // Adjust the endpoint according to your API
  }

  getMemorysFriends(memory_id: string, user_id: string) {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<any>(`${this.apiUrl}/memories/${memory_id}/${user_id}/friends`); // Adjust the endpoint according to your API
  }

  updateMemory(memoryData: any): Observable<any> {
    // Implement the logic to update user data in your backend API
    return this.http.put<any>(`${this.apiUrl}/memory`, memoryData); // Adjust the endpoint and request payload
  }

  createMemory(memoryData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/memories/createMemory`, memoryData);
  }

  addFriendToMemory(friendData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/memories/addFriendsToMemory`, friendData);
  }
}
