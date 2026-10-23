import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Storage } from '@angular/fire/storage';
import { forkJoin, map, Observable, of, tap } from 'rxjs';
import { Memory, MemoryJoinResponse, MemoryMapData, MemoryPageQuery, MemorySearchData, PaginatedMemoryResponse, PlannedMemory, ShareLinkResponse, ValidateTokenResponse } from '../models/memoryInterface.model';
import { CrewMember, Friend, MemoryDetailFriend } from '../models/userInterface.model';
import { AddPlaceholdersPayload, DeleteStandardResponse, InsertStandardResult, UpdateStandardResponse } from '../models/api-responses.model';
import { environment } from '../../environments/environment';
import { CreateUploadSessionRequest, UploadSessionResponse, RegisterPhotoRequest, RegisterPhotoResponse, CompleteUploadSessionRequest, CompleteUploadSessionResponse } from '@models/photo-upload.model';
import { CreateMemoryRequest, CreateMemoryResult } from '@models/memory-create.model';
import { MemoryPhoto } from '@models/memory-photo.model';
import { DeletePhotosResult, MemoryPlaceholder, UpdateMemoryRequest, UpdateMemoryResult } from '@models/memory-edit.model';

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}`; // Replace with your API endpoint
  private storage = inject(Storage);

  private readonly _listVersion = signal(0);
  readonly listVersion = this._listVersion.asReadonly();

  getMemory(memory_id: number): Observable<Memory> {
    return this.http.get<Memory>(`${this.apiUrl}/memories/${memory_id}`);
  }

  getMemoriesPage(userId: string, query: MemoryPageQuery): Observable<PaginatedMemoryResponse> {
    let params = new HttpParams()
      .set('ascending', query.ascending.toString())
      .set('page', query.page.toString())
      .set('pageSize', query.pageSize.toString())
      .set('filter', query.filter);

    if (query.search) {
      params = params.set('search', query.search);
    }
    if (query.pinnedOnly) {
      params = params.set('pinnedOnly', 'true');
    }

    return this.http.get<PaginatedMemoryResponse>(`${this.apiUrl}/memories/all/${userId}`, { params });
  }


  getUserCreatedAndAddedMemories(userId: string, ascending: boolean, page: number, pageSize: number, filter: 'past' | 'active' | 'future'): Observable<PaginatedMemoryResponse> {
    return this.http.get<PaginatedMemoryResponse>(`${this.apiUrl}/memories/all/${userId}`, {
      params: { ascending: ascending.toString(), page: page.toString(), pageSize: pageSize.toString(), filter: filter }
    });
  }

  getUserPlannedMemories(loggedInUserId: string): Observable<PlannedMemory[]> {
    return this.http.get<PlannedMemory[]>(`${this.apiUrl}/memories/planned/${loggedInUserId}`, {
    });
  }

  getMemoryToPlan(memoryId: string): Observable<PlannedMemory> {
    return this.http.get<PlannedMemory>(`${this.apiUrl}/memories/planning/${memoryId}`, {
    });
  }

  getMemoriesSearchData(userId: string, includeShared: boolean): Observable<MemorySearchData[]> {
    return this.http.get<MemorySearchData[]>(
      `${this.apiUrl}/memories/searchData/${userId}`,
      {
        params: { includeShared: includeShared.toString() }
      }
    );
  }

  getMemoriesMapData(userId: string, includeShared: boolean): Observable<MemoryMapData[]> {
    return this.http.get<MemoryMapData[]>(
      `${this.apiUrl}/memories/mapData/${userId}`,
      {
        params: { includeShared: includeShared.toString() }
      }
    );
  }

  getMemorysFriends(memory_id: string, user_id: string) {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<Friend[]>(`${this.apiUrl}/memories/${memory_id}/${user_id}/friends`);
  }

  getMemorysFriendsWithShared(memory_id: number, user_id: string) {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<MemoryDetailFriend[]>(`${this.apiUrl}/memories/${memory_id}/${user_id}/friends-with-shared-count`);
  }

  getPhotos(memoryId: number | string): Observable<MemoryPhoto[]> {
    return this.http
      .get<{ photos: MemoryPhoto[] }>(`${this.apiUrl}/memories/${memoryId}/photos`)
      .pipe(map(response => response.photos ?? []));
  }

  /** Reserves storage for an upload. 409 { code: 'STORAGE_FULL' } if not enough space. */
  createUploadSession(memoryId: string, body: CreateUploadSessionRequest): Observable<UploadSessionResponse> {
    return this.http.post<UploadSessionResponse>(`${this.apiUrl}/memories/${memoryId}/upload-sessions`, body);
  }

  /** Registers one uploaded photo. Idempotent per clientId. */
  registerPhoto(memoryId: string, body: RegisterPhotoRequest): Observable<RegisterPhotoResponse> {
    return this.http.post<RegisterPhotoResponse>(`${this.apiUrl}/memories/${memoryId}/photos`, body);
  }

  /** Closes the session and releases unused reserved storage. */
  completeUploadSession(
    memoryId: string,
    uploadSessionId: string,
    body: CompleteUploadSessionRequest,
  ): Observable<CompleteUploadSessionResponse> {
    return this.http
      .post<CompleteUploadSessionResponse>(
        `${this.apiUrl}/memories/${memoryId}/upload-sessions/${uploadSessionId}/complete`,
        body,
      )
      .pipe(this.invalidateOnSuccess());
  }

  updateMemoryTitle(memoryId: string | null, newTitle: string): Observable<UpdateStandardResponse> {
    const url = `${this.apiUrl}/memories/updateMemoryTitle/${memoryId}`;
    return this.http.put<UpdateStandardResponse>(url, { newTitle }).pipe(this.invalidateOnSuccess());
  }

  create(request: CreateMemoryRequest): Observable<CreateMemoryResult> {
    return this.http
      .post<CreateMemoryResult>(`${this.apiUrl}/memories`, request)
      .pipe(this.invalidateOnSuccess());
  }

  deleteMemoryAndFriends(memoryId: string): Observable<DeleteStandardResponse> {
    const url = `${this.apiUrl}/memories/${memoryId}`;
    return this.http.delete<DeleteStandardResponse>(url).pipe(this.invalidateOnSuccess());
  }

  addFriendToMemory(friendData: { friendIds: string[], memoryId: string }): Observable<InsertStandardResult> {
    return this.http.post<InsertStandardResult>(`${this.apiUrl}/memories/addFriendsToMemory`, friendData);
  }

  deleteFriendsFromMemory(userId: string, memoryId: string): Observable<DeleteStandardResponse> {
    const url = `${this.apiUrl}/memories/${memoryId}/${userId}`;
    return this.http.delete<DeleteStandardResponse>(url);
  }

  addPlaceholdersToMemory(memoryId: string, placeholders: Partial<CrewMember>[]): Observable<InsertStandardResult> {
    const payload: AddPlaceholdersPayload = {
      memoryId,
      placeholders: placeholders.map(p => ({
        name: p.name || 'Unnamed Crew Member',
      }))
    };

    return this.http.post<InsertStandardResult>(`${this.apiUrl}/memories/addPlaceholdersToMemory`, payload);
  }

  deletePlaceholderFromMemory(memoryId: string, placeholderId: string): Observable<InsertStandardResult> {
    return this.http.delete<InsertStandardResult>(
      `${this.apiUrl}/memories/deletePlaceholderFromMemory`,
      {
        body: { placeholderId, memoryId }
      }
    );
  }

  syncMemoryCrew(
    memoryId: string,
    oldCrew: CrewMember[],
    newCrew: CrewMember[]
  ): Observable<unknown> {
    const oldUsers = new Map(oldCrew.filter(c => !c.isPlaceholder).map(c => [c.user_id, c]));
    const newUsers = new Map(newCrew.filter(c => !c.isPlaceholder).map(c => [c.user_id, c]));

    const oldPlaceholders = new Map(oldCrew.filter(c => c.isPlaceholder).map(c => [c.user_id, c]));
    const newPlaceholders = new Map(newCrew.filter(c => c.isPlaceholder).map(c => [c.user_id, c]));

    // Diffs for Real Users
    const addedUserIds = Array.from(newUsers.keys()).filter(id => !oldUsers.has(id));
    const removedUserIds = Array.from(oldUsers.keys()).filter(id => !newUsers.has(id));

    // Diffs for Placeholders
    const addedPlaceholders = Array.from(newPlaceholders.entries())
      .filter(([id]) => !oldPlaceholders.has(id))
      .map(([_, member]) => member);

    const removedPlaceholderIds = Array.from(oldPlaceholders.keys()).filter(id => !newPlaceholders.has(id));

    const requests: Observable<unknown>[] = [];

    // Real User Sync
    if (addedUserIds.length > 0) {
      requests.push(this.addFriendToMemory({ friendIds: addedUserIds, memoryId }));
    }
    for (const userId of removedUserIds) {
      requests.push(this.deleteFriendsFromMemory(userId, memoryId));
    }

    // Placeholder Sync
    if (addedPlaceholders.length > 0) {
      requests.push(this.addPlaceholdersToMemory(memoryId, addedPlaceholders));
    }
    for (const placeholderId of removedPlaceholderIds) {
      requests.push(this.deletePlaceholderFromMemory(memoryId, placeholderId));
    }

    return requests.length === 0 ? of(null) : forkJoin(requests);
  }

  generateShareLink(memoryId: string): Observable<ShareLinkResponse> {
    return this.http.post<ShareLinkResponse>(
      `${this.apiUrl}/memories/${memoryId}/share`,
      {}
    );
  }

  validateShareToken(token: string): Observable<ValidateTokenResponse> {
    return this.http.get<ValidateTokenResponse>(
      `${this.apiUrl}/memories/share/validate/${token}`
    );
  }

  joinMemoryViaToken(token: string, placeholderId: string | null = null): Observable<MemoryJoinResponse> {
    return this.http.post<MemoryJoinResponse>(
      `${this.apiUrl}/memories/share/join`,
      { token, placeholderId }
    );
  }

  // Check if user is already a member
  isUserMemoryMember(memoryId: number, userId: string): Observable<{ isMember: boolean }> {
    return this.http.get<{ isMember: boolean }>(
      `${this.apiUrl}/memories/${memoryId}/member/${userId}`
    );
  }

  updateDetails(memoryId: number | string, request: UpdateMemoryRequest): Observable<UpdateMemoryResult> {
    return this.http
      .put<UpdateMemoryResult>(`${this.apiUrl}/memories/${memoryId}`, request)
      .pipe(this.invalidateOnSuccess());
  }

  getPlaceholders(memoryId: number | string): Observable<MemoryPlaceholder[]> {
    return this.http
      .get<{ placeholders: MemoryPlaceholder[] }>(`${this.apiUrl}/memories/${memoryId}/placeholders`)
      .pipe(map(response => response.placeholders ?? []));
  }

  /** Deletes DB rows + files (server side) and updates the storage of each uploader. */
  deletePhotos(memoryId: number | string, photoIds: string[]): Observable<DeletePhotosResult> {
    return this.http
      .post<DeletePhotosResult>(`${this.apiUrl}/memories/${memoryId}/photos/delete`, { photoIds })
      .pipe(this.invalidateOnSuccess());
  }

  setCover(memoryId: number | string, photoId: string): Observable<{ coverPhotoId: string }> {
    return this.http
      .put<{ coverPhotoId: string }>(`${this.apiUrl}/memories/${memoryId}/cover`, { photoId })
      .pipe(this.invalidateOnSuccess());
  }

  invalidateMemoryList(): void {
    this._listVersion.update((v) => v + 1);
  }

  private invalidateOnSuccess<T>() {
    return tap<T>({ next: () => this.invalidateMemoryList() });
  }
}
