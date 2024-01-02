import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://your-api-url.com'; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  getUser(): Observable<any> {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<any>(`${this.apiUrl}/user`); // Adjust the endpoint according to your API
  }

  updateUser(userData: any): Observable<any> {
    // Implement the logic to update user data in your backend API
    return this.http.put<any>(`${this.apiUrl}/user`, userData); // Adjust the endpoint and request payload
  }
}
