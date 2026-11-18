// @services/live-memory.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment'; // same source as PlanItemService
import { LiveMemory, todayIso } from '@models/livePlan.model';

@Injectable({ providedIn: 'root' })
export class LiveMemoryService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /** Memories that are live today (browser date). */
  getLive(today = todayIso()): Observable<LiveMemory[]> {
    return this.http.get<LiveMemory[]>(`${this.apiUrl}/live`, { params: { today } });
  }
}
