import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  private apiUrl = 'https://your-api-url.com'; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  getMemory(): Observable<any> {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<any>(`${this.apiUrl}/memory`); // Adjust the endpoint according to your API
  }

  updateMemory(memoryData: any): Observable<any> {
    // Implement the logic to update user data in your backend API
    return this.http.put<any>(`${this.apiUrl}/memory`, memoryData); // Adjust the endpoint and request payload
  }
}
