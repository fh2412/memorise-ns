import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BetaUserService {
  private apiUrl = 'http://localhost:3000/api/betausers'; // Replace with your API endpoint

  constructor(private http: HttpClient) { }

  sendRegistrationRequest(email: string): Observable<any> {
    const url = `${this.apiUrl}/register`;
    const body = { email };
    return this.http.post(url, body);
  }
}
