import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private loggedInUserId: string | null = null;

  setLoggedInUserId(userId: string): void {
    this.loggedInUserId = userId;
    console.log("loggedinUser set to:", this.loggedInUserId);
  }
  getLoggedInUserId(): string | null {
    return this.loggedInUserId;
  }
  
  private apiUrl = 'http://localhost:3000/api/users'; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  getUser(): Observable<any> {
    // Implement the logic to fetch user data from your backend API
    return this.http.get<any>(`${this.apiUrl}`); // Adjust the endpoint according to your API
  }

  getUserByEmail(email: string) {
    return this.http.get<any>(`${this.apiUrl}/email/${email}`);
  }

  updateUser(userId: string, userData: any): Observable<any> {
    const url = `${this.apiUrl}/${userId}`;
    return this.http.put<any>(url, userData);
  }

  updateUserProfilePic(userId: string, profilePicUrl: string) {
    const url = `${this.apiUrl}/profilepic/${userId}`;
    const body = { profilepic: profilePicUrl };

    return this.http.put(url, body);
  }
}
