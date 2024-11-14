import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Memory } from '../models/memoryInterface.model';

@Injectable({
  providedIn: 'root'
})
export class PinnedMemoryService {
  private apiUrl = 'http://localhost:3000/api/pinned';

  constructor(private http: HttpClient) {}

  getPinnedMemories(userId: string): Observable<any[]> {
    const url = `${this.apiUrl}/${userId}/favourite-memories`;
    return this.http.get<any[]>(url);
  }

  getPinnedMemoriesWithPlacholders(pin_memories: Memory[]){
    const displayedMemories = [...pin_memories];
    const emptyMemory: Memory = {
      memory_id: 0,
      user_id: 0,
      image_url: '',
      latitude: '',
      longitude: '',
      location_id: 0,
      memory_date: '',
      memory_end_date: '',
      picture_count: 0,
      text: '',
      title: '',
      title_pic: '',
      username: ''
    };

    // Add empty memory objects until there are exactly 4 items
    while (displayedMemories.length < 4) {
      displayedMemories.push(emptyMemory);
    }
    return displayedMemories;
  }

  updatePinnedMemory(userId: string, memoryIdToUpdate: number, updatedMemoryId: number): Observable<any> {
    const url = `${this.apiUrl}/${userId}/favourite-memories/${memoryIdToUpdate}`;
    const body = { memoryId: updatedMemoryId };
    return this.http.put(url, body);
  }

  createPinnedMemory(userId: string, memoryId: number): Observable<any> {
    const url = `${this.apiUrl}/${userId}/favourite-memories`;
    const body = { memoryId }; // Assuming 'memoryId' is the property name
  
    return this.http.post(url, body);
  }
  
  deletePinnedMemory(userId: string, memoryIdToDelete: number): Observable<any> {
    const url = `${this.apiUrl}/${userId}/favourite-memories/${memoryIdToDelete}`;
  
    return this.http.delete(url);
  }

  checkMemoryPin(memoryId: number): Observable<Memory[]> {
    const url = `${this.apiUrl}/favourite-memorie/${memoryId}`;
    return this.http.get<Memory[]>(url);
  }

  deleteMemoryFromAllPins(memoryId: number): Observable<Memory[]> {
    const url = `${this.apiUrl}/favourite-memorie/${memoryId}`;
    return this.http.delete<Memory[]>(url);
  }
  
}
