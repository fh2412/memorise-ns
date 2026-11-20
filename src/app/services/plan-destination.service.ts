// @services/plan-destination.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../environments/environment'; // same source as PlanItemService
import { PlanDestination, PlanLocation } from '@models/memoryInterface.model';

@Injectable({ providedIn: 'root' })
export class PlanDestinationService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private url(memoryId: string): string {
    return `${this.apiUrl}/memories/${memoryId}/plan/destination`;
  }

  /**
   * location: undefined = keep the current pin, null = name only, object = new pin.
   * Owner only.
   */
  set(memoryId: string, label: string, location?: PlanLocation | null): Observable<PlanDestination | null> {
    const body = location === undefined ? { label } : { label, location };
    return this.http
      .put<{ destination: PlanDestination | null }>(this.url(memoryId), body)
      .pipe(map(r => r.destination));
  }

  remove(memoryId: string): Observable<null> {
    return this.http
      .delete<{ destination: null }>(this.url(memoryId))
      .pipe(map(() => null));
  }
}
