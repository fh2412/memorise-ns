import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DownloadTicket {
  ticket: string;
  fileCount: number;
  totalBytes: number;
  expiresInSeconds: number;
}

const FRAME_NAME = 'memorise-download-frame';

/**
 * Downloads photos as ZIP, streamed by the browser straight to disk
 * (no Blob in memory → works for memories of any size, native download progress).
 *
 * 1. POST /download-ticket with the normal auth header (validates access + selection)
 * 2. Hidden form POST with the ticket into a hidden iframe → browser handles the file
 */
@Injectable({ providedIn: 'root' })
export class MemoryDownloadService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly apiUrl = environment.apiUrl;

  /** @param photoIds null = all photos of the memory */
  async download(memoryId: number | string, photoIds: string[] | null): Promise<DownloadTicket> {
    if (!this.isBrowser) throw new Error('Downloads are only available in the browser');

    const ticket = await firstValueFrom(
      this.http.post<DownloadTicket>(`${this.apiUrl}/memories/${memoryId}/download-ticket`, {
        photoIds: photoIds?.length ? photoIds : undefined,
      }),
    );

    const fields: Record<string, string> = { ticket: ticket.ticket };
    if (photoIds?.length) fields['photoIds'] = photoIds.join(',');
    this.submitHiddenForm(`${this.apiUrl}/memories/${memoryId}/download`, fields);

    return ticket;
  }

  private submitHiddenForm(action: string, fields: Record<string, string>): void {
    const doc = this.document;
    const form = doc.createElement('form');
    form.method = 'POST';
    form.action = action;
    form.target = this.ensureFrame().name;
    form.style.display = 'none';

    for (const [name, value] of Object.entries(fields)) {
      const input = doc.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }

    doc.body.appendChild(form);
    form.submit();
    form.remove();
  }

  private ensureFrame(): HTMLIFrameElement {
    const existing = this.document.querySelector<HTMLIFrameElement>(`iframe[name="${FRAME_NAME}"]`);
    if (existing) return existing;

    const frame = this.document.createElement('iframe');
    frame.name = FRAME_NAME;
    frame.title = 'Download';
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.style.display = 'none';
    this.document.body.appendChild(frame);
    return frame;
  }
}
