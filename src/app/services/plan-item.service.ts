import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NewPlanItem, PlanBoard, PlanEvent, PlanItem, PlanItemPatch } from '@models/planItem.model';

export interface EventQuery { before?: number; after?: number; limit?: number; }

@Injectable({ providedIn: 'root' })
export class PlanItemService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private base(memoryId: string): string {
    return `${this.apiUrl}/memories/${memoryId}/plan/items`;
  }

  getEvents(memoryId: string, query: EventQuery = {}): Observable<PlanEvent[]> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value != null) params = params.set(key, value);
    }
    return this.http
      .get<{ events: PlanEvent[] }>(`${this.apiUrl}/memories/${memoryId}/plan/events`, { params })
      .pipe(map(r => r.events));
  }

  getBoard(memoryId: string): Observable<PlanBoard> {
    return this.http.get<PlanBoard>(this.base(memoryId));
  }

  createItem(memoryId: string, item: NewPlanItem): Observable<PlanItem> {
    return this.http.post<{ item: PlanItem }>(this.base(memoryId), item).pipe(map(r => r.item));
  }

  updateItem(memoryId: string, itemId: number, patch: PlanItemPatch): Observable<PlanItem> {
    return this.http
      .patch<{ item: PlanItem }>(`${this.base(memoryId)}/${itemId}`, patch)
      .pipe(map(r => r.item));
  }

  deleteItem(memoryId: string, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.base(memoryId)}/${itemId}`);
  }
}