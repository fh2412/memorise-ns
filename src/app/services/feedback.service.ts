// feedback.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface FeedbackData {
  type: string;
  title: string;
  path: string;
  description: string;
  email?: string;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  issueUrl?: string;
  issueNumber?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = `${environment.apiUrl}/feedback`;

  constructor(private http: HttpClient) { }

  submitFeedback(feedback: FeedbackData): Observable<FeedbackResponse> {
    return this.http.post<FeedbackResponse>(this.apiUrl, feedback);
  }
}