import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlanLocation } from '@models/memoryInterface.model';
import {
  DecidePollBody, NewPoll, NewPollOption, PlanItem, PollOptionPatch, PollSettingsPatch,
} from '@models/planItem.model';

const toItem = map((r: { item: PlanItem }) => r.item);

@Injectable({ providedIn: 'root' })
export class PlanPollService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private url(memoryId: string, path = ''): string {
    return `${this.apiUrl}/memories/${memoryId}/plan/polls${path}`;
  }

  create(memoryId: string, body: NewPoll): Observable<PlanItem> {
    return this.http.post<{ item: PlanItem }>(this.url(memoryId), body).pipe(toItem);
  }

  updateSettings(memoryId: string, itemId: number, patch: PollSettingsPatch): Observable<PlanItem> {
    return this.http.patch<{ item: PlanItem }>(this.url(memoryId, `/${itemId}`), patch).pipe(toItem);
  }

  vote(memoryId: string, itemId: number, optionIds: number[]): Observable<PlanItem> {
    return this.http.put<{ item: PlanItem }>(this.url(memoryId, `/${itemId}/votes/me`), { optionIds }).pipe(toItem);
  }

  addOption(memoryId: string, itemId: number, option: NewPollOption): Observable<PlanItem> {
    return this.http.post<{ item: PlanItem }>(this.url(memoryId, `/${itemId}/options`), option).pipe(toItem);
  }

  updateOption(memoryId: string, itemId: number, optionId: number, patch: PollOptionPatch): Observable<PlanItem> {
    return this.http
      .patch<{ item: PlanItem }>(this.url(memoryId, `/${itemId}/options/${optionId}`), patch).pipe(toItem);
  }

  deleteOption(memoryId: string, itemId: number, optionId: number): Observable<PlanItem> {
    return this.http.delete<{ item: PlanItem }>(this.url(memoryId, `/${itemId}/options/${optionId}`)).pipe(toItem);
  }

  decide(memoryId: string, itemId: number, body: DecidePollBody) {
    return this.http.post<{ item: PlanItem; needsLocation: boolean }>(this.url(memoryId, `/${itemId}/decide`), body);
  }

  setDestination(memoryId: string, itemId: number, location: PlanLocation): Observable<PlanItem> {
    return this.http.put<{ item: PlanItem }>(this.url(memoryId, `/${itemId}/destination`), { location }).pipe(toItem);
  }

  reopen(memoryId: string, itemId: number): Observable<PlanItem> {
    return this.http.post<{ item: PlanItem }>(this.url(memoryId, `/${itemId}/reopen`), {}).pipe(toItem);
  }
}
