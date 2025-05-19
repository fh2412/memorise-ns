import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BookmarkedActivity } from '../models/activityInterface.model';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private apiUrl = `${environment.apiUrl}/bookmarking`;

  constructor(private http: HttpClient) { }


  getBookmarkedActivities(userId: string): Observable<BookmarkedActivity[]> {
    return this.http.get<BookmarkedActivity[]>(`${this.apiUrl}/bookmarks/${userId}`);
  }

  addBookmark(userId: string, activityId: number): Observable<BookmarkedActivity> {
    return this.http.post<BookmarkedActivity>(`${this.apiUrl}/bookmarks`, { userId, activityId });
  }

  removeBookmark(userId: string, activityId: number): Observable<BookmarkedActivity> {
    return this.http.delete<BookmarkedActivity>(`${this.apiUrl}/bookmarks/${userId}/${activityId}`);
  }

  toggleBookmark(userId: string, activityId: number, isCurrentlyBookmarked: boolean): Observable<BookmarkedActivity> {
    if (isCurrentlyBookmarked) {
      return this.removeBookmark(userId, activityId);
    } else {
      return this.addBookmark(userId, activityId);
    }
  }
}