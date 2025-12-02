import { computed, Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap, take, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { BookmarkedActivity, MemoriseUserActivity } from '../models/activityInterface.model';

@Injectable({
  providedIn: 'root'
})
export class BookmarkService {
  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/bookmarking`;

  private _bookmarkedActivities = signal<MemoriseUserActivity[]>([]);
  public readonly bookmarkedActivities = this._bookmarkedActivities.asReadonly();
  public readonly bookmarkedActivityIds = computed(() =>
    this._bookmarkedActivities().map(activity => activity.activityId)
  );

  private bookmarkedActivitiesSubject = new BehaviorSubject<MemoriseUserActivity[]>([]);
  bookmarkedActivities$ = this.bookmarkedActivitiesSubject.asObservable();

  setBookmarkedActivities(activities: MemoriseUserActivity[]) {
    this.bookmarkedActivitiesSubject.next(activities);
  }


  getBookmarkedActivities(userId: string) {
    return this.http.get<MemoriseUserActivity[]>(`${environment.apiUrl}/activity/bookmarkedActivities/${userId}`);
  }

  addBookmark(userId: string, activity: MemoriseUserActivity): Observable<BookmarkedActivity> {
    const currentBookmarks = this._bookmarkedActivities();
    const isAlreadyBookmarked = currentBookmarks.some(
      bookmark => bookmark.activityId === activity.activityId
    );

    if (!isAlreadyBookmarked) {
      this._bookmarkedActivities.set([...currentBookmarks, activity]);
    }

    const activityId = activity.activityId;

    return this.http.post<BookmarkedActivity>(`${this.apiUrl}/bookmarks`, { userId, activityId });
  }

  removeBookmark(userId: string, activityId: number): Observable<BookmarkedActivity> {
    const currentBookmarks = this._bookmarkedActivities();
    const filteredBookmarks = currentBookmarks.filter(
      bookmark => bookmark.activityId !== activityId
    );
    this._bookmarkedActivities.set(filteredBookmarks);

    return this.http.delete<BookmarkedActivity>(`${this.apiUrl}/bookmarks/${userId}/${activityId}`);
  }

  toggleBookmark(userId: string, activity: MemoriseUserActivity, isCurrentlyBookmarked: boolean): Observable<BookmarkedActivity> {
    if (isCurrentlyBookmarked) {
      return this.removeBookmark(userId, activity.activityId);
    } else {
      return this.bookmarkedActivities$.pipe(
        take(1),
        switchMap((bookmarks) => {
          if (bookmarks.length >= 10) {
            // Reject and return error observable
            return throwError(() => new Error('Bookmark limit reached'));
          } else {
            return this.addBookmark(userId, activity);
          }
        })
      );
    }
  }

  isBookmarked(activityId: number): boolean {
    return this.bookmarkedActivityIds().includes(activityId);
  }

  // Initialize bookmarks (call this when loading saved bookmarks)
  setBookmarks(activities: MemoriseUserActivity[]): void {
    this._bookmarkedActivities.set(activities);
  }
}