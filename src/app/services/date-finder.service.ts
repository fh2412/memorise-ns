import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '@environments/environment'; // same source as PlanItemService
import {
  DateFinderData, DateFinderSettings, DateFinderSettingsInput, MemberAvailability,
} from '@models/dateFinder.model';

@Injectable({ providedIn: 'root' })
export class DateFinderService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private base(memoryId: string): string {
    return `${this.apiUrl}/memories/${memoryId}/plan/availability`;
  }

  get(memoryId: string): Observable<DateFinderData> {
    return this.http.get<DateFinderData>(this.base(memoryId));
  }

  saveMine(memoryId: string, body: { yes: string[]; maybe: string[] }): Observable<MemberAvailability> {
    return this.http
      .put<{ availability: MemberAvailability }>(`${this.base(memoryId)}/me`, body)
      .pipe(map(r => r.availability));
  }

  saveSettings(memoryId: string, input: DateFinderSettingsInput): Observable<DateFinderSettings> {
    return this.http
      .put<{ settings: DateFinderSettings }>(`${this.base(memoryId)}/settings`, input)
      .pipe(map(r => r.settings));
  }
}