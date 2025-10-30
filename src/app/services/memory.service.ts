import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Storage, getDownloadURL, ref } from '@angular/fire/storage';
import { lastValueFrom, Observable } from 'rxjs';
import { CreateMemoryResponse, Memory, MemoryFormData, MemoryJoinResponse, ShareLinkResponse, ValidateTokenResponse } from '../models/memoryInterface.model';
import { Friend, MemoryDetailFriend } from '../models/userInterface.model';
import { DeleteStandardResponse, InsertStandardResult, UpdateStandardResponse } from '../models/api-responses.model';
import { FormGroup } from '@angular/forms';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  private apiUrl = `${environment.apiUrl}`; // Replace with your API endpoint
  private storage = inject(Storage);

  constructor(private http: HttpClient) { }

  getMemory(memory_id: number): Observable<Memory> {
    return this.http.get<Memory>(`${this.apiUrl}/memories/${memory_id}`);
  }

  getUserCreatedMemories(user_id: string, ascending: boolean) {
    return this.http.get<Memory[]>(`${this.apiUrl}/memories/createdMemories/${user_id}`, {
      params: { ascending: ascending }
    });
  }

  getUserCreatedAndAddedMemories(user_id: string, ascending: boolean): Observable<Memory[]> {
    return this.http.get<Memory[]>(`${this.apiUrl}/memories/all/${user_id}`, {
      params: { ascending: ascending }
    });
  }

  getAllMemories(user_id: string): Observable<Memory[]> {
    return this.http.get<Memory[]>(`${this.apiUrl}/memories/allMemories/${user_id}`);
  }

  async getMemoryTitlePictureUrl(memoryId: string, starredIndex: number): Promise<string> {
    const path = `memories/${memoryId}/picture_${starredIndex + 1}.jpg`;
    const storageRef = ref(this.storage, path);

    try {
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL; // The download URL of the file
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw error; // You may handle this error accordingly
    }
  }

  getMemorysFriends(memory_id: string, user_id: string) {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<Friend[]>(`${this.apiUrl}/memories/${memory_id}/${user_id}/friends`);
  }

  getMemorysFriendsWithShared(memory_id: number, user_id: string) {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<MemoryDetailFriend[]>(`${this.apiUrl}/memories/${memory_id}/${user_id}/friends-with-shared-count`);
  }

  updateMemory(memory_id: string, memoryData: FormGroup): Observable<UpdateStandardResponse> {
    return this.http.put<UpdateStandardResponse>(`${this.apiUrl}/memories/${memory_id}`, memoryData);
  }

  incrementPictureCount(memoryId: string, increment: number): Observable<{ message: string; newCount: number }> {
    return this.http.post<{ message: string; newCount: number }>(
      `${this.apiUrl}/memories/picturecount/${memoryId}/increment`,
      { increment }
    );
  }

  updateMemoryLocation(memoryId: number, locationId: number): Observable<UpdateStandardResponse> {
    const url = `${this.apiUrl}/memories/updateMemoryLocation/${memoryId}`;
    return this.http.put<UpdateStandardResponse>(url, { locationId });
  }

  updateTitlePic(imageId: string | null, imageUrl: string): Observable<UpdateStandardResponse> {
    const url = `${this.apiUrl}/memories/updateTitlePic/${imageId}`;
    return this.http.put<UpdateStandardResponse>(url, { imageUrl });
  }

  createMemory(memoryData: MemoryFormData): Observable<CreateMemoryResponse> {
    return this.http.post<CreateMemoryResponse>(`${this.apiUrl}/memories/createMemory`, memoryData);
  }

  deleteMemoryAndFriends(memoryId: string): Observable<DeleteStandardResponse> {
    const url = `${this.apiUrl}/memories/${memoryId}`;
    return this.http.delete<DeleteStandardResponse>(url);
  }

  addFriendToMemory(friendData: { emails: string[], memoryId: string }): Observable<InsertStandardResult> {
    return this.http.post<InsertStandardResult>(`${this.apiUrl}/memories/addFriendsToMemory`, friendData);
  }

  deleteFriendsFromMemory(userId: string, memoryId: string): Observable<DeleteStandardResponse> {
    const url = `${this.apiUrl}/memories/${memoryId}/${userId}`;
    return this.http.delete<DeleteStandardResponse>(url);
  }

  async checkMemoriseUserPermission(memoryId: string, loggedInUserId: string): Promise<boolean> {
    try {
      const creator: Memory = await lastValueFrom(
        this.getMemory(Number(memoryId))
      );
      const creatorId = creator.user_id;

      const friends: Friend[] = await lastValueFrom(
        this.getMemorysFriends(memoryId, creatorId)
      );

      if (Array.isArray(friends)) {
        const friendIds = friends.map(friend => friend.user_id);
        return friendIds.includes(loggedInUserId) || creatorId === loggedInUserId;
      }
      else {
        return creatorId === loggedInUserId;
      }
    } catch (error) {
      console.error('Failed to fetch memory friends:', error);
      return false;
    }
  }

  generateShareLink(memoryId: number): Observable<ShareLinkResponse> {
    return this.http.post<ShareLinkResponse>(
      `${this.apiUrl}/memories/${memoryId}/share`,
      {}
    );
  }

  // Validate a share token
  validateShareToken(token: string): Observable<ValidateTokenResponse> {
    return this.http.get<ValidateTokenResponse>(
      `${this.apiUrl}/memories/share/validate/${token}`
    );
  }

  // Join a memory via share token
  joinMemoryViaToken(token: string, userId: string): Observable<MemoryJoinResponse> {
    return this.http.post<MemoryJoinResponse>(
      `${this.apiUrl}/memories/share/join`,
      { token, userId }
    );
  }

  // Check if user is already a member
  isUserMemoryMember(memoryId: number, userId: string): Observable<{ isMember: boolean }> {
    return this.http.get<{ isMember: boolean }>(
      `${this.apiUrl}/memories/${memoryId}/member/${userId}`
    );
  }
}
