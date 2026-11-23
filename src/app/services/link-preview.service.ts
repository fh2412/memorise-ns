// @services/link-preview.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LinkPreviewResponse } from '@models/planBooking.model';

@Injectable({ providedIn: 'root' })
export class LinkPreviewService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /** refresh = true bypasses the 7-day server cache. */
  get(memoryId: string, url: string, refresh = false): Observable<LinkPreviewResponse> {
    return this.http.post<LinkPreviewResponse>(
      `${this.apiUrl}/memories/${memoryId}/plan/link-preview`,
      refresh ? { url, refresh: true } : { url },
    );
  }
}
