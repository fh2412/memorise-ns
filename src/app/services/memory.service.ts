import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  private apiUrl = 'http://localhost:3000/api'; // Replace with your API endpoint

  constructor(private http: HttpClient, private storage: AngularFireStorage) {}

  getMemory(memory_id: string) {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<any>(`${this.apiUrl}/memories/${memory_id}`);
  }

  getCreatedMemory(user_id: string) {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<any>(`${this.apiUrl}/memories/createdMemories/${user_id}`);
  }

  getAddedMemories(user_id: string) {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<any>(`${this.apiUrl}/memories/getAddedMemories/${user_id}`);
  }

  getMemoryTitlePictureUrl(memoryId: string): Promise<string> {
    const path = `memories/${memoryId}/picture_1.jpg`;
    const ref = this.storage.ref(path);
    return ref.getDownloadURL().toPromise();
  }

  getMemorysFriends(memory_id: string, user_id: string) {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<any>(`${this.apiUrl}/memories/${memory_id}/${user_id}/friends`);
  }

  updateMemory(memory_id: string, memoryData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/memories/${memory_id}`, memoryData);
  }

  createMemory(memoryData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/memories/createMemory`, memoryData);
  }

  addFriendToMemory(friendData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/memories/addFriendsToMemory`, friendData);
  }

  deleteMemoryAndFriends(memoryId: string): Observable<any> {
    const url = `${this.apiUrl}/memories/${memoryId}`;
    return this.http.delete(url);
  }

  deleteFriendsFromMemory(userId: string, memoryId: string): Observable<any> {
    const url = `${this.apiUrl}/memories/${memoryId}/${userId}`;
    return this.http.delete(url);
  }
}
