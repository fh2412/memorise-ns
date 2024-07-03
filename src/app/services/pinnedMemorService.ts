import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class pinnedMemoryService {
  private apiUrl = 'http://localhost:3000/api/pinned';

  constructor(private http: HttpClient) {}

  getPinnedMemories(userId: string): Observable<any[]> {
    const url = `${this.apiUrl}/${userId}/favourite-memories`;
    return this.http.get<any[]>(url);
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
  
}
