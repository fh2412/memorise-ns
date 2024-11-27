import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private apiUrl = 'http://localhost:3000/api/activity';

  constructor(private http: HttpClient) {}

  createQuickActivity(title: string){
    const url = `${this.apiUrl}/add-activity`;
    const body = { title };
    return this.http.post<any>(url, body);
  }
}