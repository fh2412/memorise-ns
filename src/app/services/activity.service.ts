import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateActivityResponse, MemoriseActivity } from '../models/activityInterface.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private apiUrl = 'http://localhost:3000/api/activity';

  constructor(private http: HttpClient) {}

  createQuickActivity(title: string){
    const url = `${this.apiUrl}/add-activity`;
    const body = { title };
    return this.http.post<CreateActivityResponse>(url, body);
  }

  getActivity(activityId: number){
    return this.http.get<MemoriseActivity>(`${this.apiUrl}/${activityId}`);
  }
}