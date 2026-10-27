import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@environments/environment'; // ← use the same apiUrl source as MemoryService
import { NewPlanItem, PlanItem, PlanItemPatch } from '@models/planItem.model';

@Injectable({ providedIn: 'root' })
export class PlanItemService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private base(memoryId: string): string {
    return `${this.apiUrl}/memories/${memoryId}/plan-items`;
  }

  getItems(memoryId: string): Observable<PlanItem[]> {
    return this.http.get<{ items: PlanItem[] }>(this.base(memoryId)).pipe(map(r => r.items));
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