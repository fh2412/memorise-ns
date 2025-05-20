import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BookmarkedActivity, MemoriseUserActivity } from '../models/activityInterface.model';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private apiUrl = `${environment.apiUrl}/bookmarking`;

  constructor(private http: HttpClient) { }

  private bookmarkedActivitiesSubject = new BehaviorSubject<MemoriseUserActivity[]>([]);
  bookmarkedActivities$ = this.bookmarkedActivitiesSubject.asObservable();

  setBookmarkedActivities(activities: MemoriseUserActivity[]) {
    this.bookmarkedActivitiesSubject.next(activities);
  }


  getBookmarkedActivities(userId: string) {
    return this.http.get<MemoriseUserActivity[]>(`${environment.apiUrl}/activity/bookmarkedActivities/${userId}`);
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