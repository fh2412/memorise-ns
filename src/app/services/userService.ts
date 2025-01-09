import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private loggedInUserId: string | null = null;
  private storageKey = 'loggedInUserId';
  private userIdSource = new BehaviorSubject<string | null>(null);
  userId$ = this.userIdSource.asObservable();

  setLoggedInUserId(userId: string): void {
    this.loggedInUserId = userId;
    this.userIdSource.next(userId);
    localStorage.setItem(this.storageKey, JSON.stringify(userId));
    console.log("loggedinUser set to:", this.loggedInUserId);
  }
  getLoggedInUserId(): string | null {
    const storedValue = localStorage.getItem(this.storageKey);
    return storedValue ? JSON.parse(storedValue) : null;
  }
  
  private apiUrl = 'http://localhost:3000/api/users'; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  getUser(id: string) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getUserByEmail(email: string) {
    return this.http.get<any>(`${this.apiUrl}/email/${email}`);
  }

  updateUser(userId: string, userData: any): Observable<any> {
    const url = `${this.apiUrl}/${userId}`;
    return this.http.put<any>(url, userData);
  }

  updateUserProfilePic(userId: string, profilePicUrl: any): Observable<any> {
    const url = `${this.apiUrl}/profilepic/${userId}`;
    const body = { profilepic: profilePicUrl };
    return this.http.put<any>(url, body);
  }

  searchUsers(searchTerm: string, userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/users/${userId}?term=${searchTerm}`);
  }

  createUser(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, {email});
  }
}