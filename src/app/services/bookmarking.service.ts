import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private apiUrl = `${environment.apiUrl}/bookmarking`;

  constructor(private http: HttpClient) { }


  getBookmarkedActivities(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bookmarks/${userId}`);
  }

  addBookmark(userId: string, activityId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bookmarks`, { userId, activityId });
  }

  removeBookmark(userId: string, activityId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/bookmarks/${userId}/${activityId}`);
  }

  toggleBookmark(userId: string, activityId: number, isCurrentlyBookmarked: boolean): Observable<any> {
    if (isCurrentlyBookmarked) {
      return this.removeBookmark(userId, activityId);
    } else {
      return this.addBookmark(userId, activityId);
    }
  }

  isActivityBookmarked(userId: string, activityId: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.getBookmarkedActivities(userId).subscribe(
        activities => {
          const isBookmarked = activities.some(activity => activity.id === activityId);
          observer.next(isBookmarked);
          observer.complete();
        },
        error => {
          observer.error(error);
        }
      );
    });
  }
}