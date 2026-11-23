// @services/plan-booking.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlanItem } from '@models/planItem.model';
import { BookingInput, NewBooking } from '@models/planBooking.model';

@Injectable({ providedIn: 'root' })
export class PlanBookingService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private url(memoryId: string, path = ''): string {
    return `${this.apiUrl}/memories/${memoryId}/plan/bookings${path}`;
  }

  create(memoryId: string, body: NewBooking): Observable<PlanItem> {
    return this.http.post<{ item: PlanItem }>(this.url(memoryId), body).pipe(map(r => r.item));
  }

  update(memoryId: string, itemId: number, patch: BookingInput): Observable<PlanItem> {
    return this.http.patch<{ item: PlanItem }>(this.url(memoryId, `/${itemId}`), patch).pipe(map(r => r.item));
  }
}
