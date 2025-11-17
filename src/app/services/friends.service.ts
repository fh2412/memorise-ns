import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Friend, FriendStatus, MemoryDetailFriend } from '../models/userInterface.model';
import { DeleteStandardResponse, InsertStandardResult, UpdateStandardResponse } from '../models/api-responses.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private http = inject(HttpClient);

  private friendsDataSource = new BehaviorSubject<MemoryDetailFriend[]>([]);
  currentFriendData = this.friendsDataSource.asObservable();


  private apiUrl = `${environment.apiUrl}/friends`;

  updateFriendsData(friends: MemoryDetailFriend[]) {
    this.friendsDataSource.next(friends);
  }

  getUserFriends(userId: string): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/${userId}`);
  }

  getFriendsStatus(userId1: string, userId2: string): Observable<FriendStatus[]> {
    return this.http.get<FriendStatus[]>(`${this.apiUrl}/status/${userId1}/${userId2}`);
  }

  getMemoriesMissingFriends(memoryId: string, userId: string): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/missingMemory/${memoryId}/${userId}`);
  }

  getPendingFriends(userId: string): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/pending/${userId}`);
  }

  getIngoingFriends(userId: string): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/ingoing/${userId}`);
  }

  getFriendSuggestions(userId: string): Observable<Friend[]> {
    return this.http.get<Friend[]>(`${this.apiUrl}/friend-suggestions/${userId}`);
  }

  acceptFriendRequest(userId1: string, userId2: string): Observable<UpdateStandardResponse> {
    const url = `${this.apiUrl}/accept_request/${userId1}/${userId2}`;
    return this.http.put<UpdateStandardResponse>(url, {});
  }

  removeFriend(userId1: string, userId2: string): Observable<DeleteStandardResponse> {
    const url = `${this.apiUrl}/remove_friend/${userId1}/${userId2}`;
    return this.http.delete<DeleteStandardResponse>(url);
  }

  sendFriendRequest(senderId: string, receiverId: string): Observable<InsertStandardResult> {
    const url = `${this.apiUrl}/send_request`;
    const body = { senderId, receiverId };
    return this.http.post<InsertStandardResult>(url, body);
  }

  addFriendRequest(senderId: string, receiverId: string): Observable<InsertStandardResult> {
    const url = `${this.apiUrl}/add_friend`;
    const body = { senderId, receiverId };
    return this.http.post<InsertStandardResult>(url, body);
  }

}
