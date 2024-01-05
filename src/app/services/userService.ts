import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users'; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  getUser(): Observable<any> {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<any>(`${this.apiUrl}`); // Adjust the endpoint according to your API
  }

  getUserByEmail(email: string) {
    return this.http.get<any>(`${this.apiUrl}/email/${email}`);
  }
}
