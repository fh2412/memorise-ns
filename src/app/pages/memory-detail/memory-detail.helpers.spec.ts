import { HttpErrorResponse } from '@angular/common/http';
import { memoryDates, pageStateForError, peopleLabel, previewTiles, toImageWithMetadata, uploadProgressFor } from './memory-detail.helpers';
import { parseMemoryDate } from '../../utils/memory-dates';
import { MemoryPhoto } from '@models/memory-photo.model';
import { UploadJob } from '@models/photo-upload.model';

describe('previewTiles', () => {
  it('always returns 5 tiles', () => {
    expect(previewTiles([1, 2])).toEqual([1, 2, null, null, null]);
    expect(previewTiles([1, 2, 3, 4, 5, 6, 7])).toEqual([1, 2, 3, 4, 5]);
    expect(previewTiles([])).toEqual([null, null, null, null, null]);
  });
});

describe('peopleLabel', () => {
  it('counts the creator', () => {
    expect(peopleLabel(0)).toBe('Solo memory');
    expect(peopleLabel(3)).toBe('4 people');
  });
});

describe('parseMemoryDate', () => {
  it('parses plain dates as local days', () => {
    expect(parseMemoryDate('2026-06-03')).toEqual(new Date(2026, 5, 3));
  });

  it('handles empty and invalid values', () => {
    expect(parseMemoryDate(null)).toBeNull();
    expect(parseMemoryDate('')).toBeNull();
    expect(parseMemoryDate('nope')).toBeNull();
  });
});

describe('memoryDates', () => {
  it('builds a range and a label', () => {
    const d = memoryDates('2026-06-06', '2026-06-07')!;
    expect(d.start).toEqual(new Date(2026, 5, 6));
    expect(d.end).toEqual(new Date(2026, 5, 7));
    expect(d.label.replace(/\s/g, ' ')).toBe('Jun 6 – 7, 2026');
  });

  it('falls back to the start date for missing or invalid end dates', () => {
    expect(memoryDates('2026-06-06', null)!.end).toEqual(new Date(2026, 5, 6));
    expect(memoryDates('2026-06-06', '2026-06-01')!.end).toEqual(new Date(2026, 5, 6));
  });

  it('returns null for planned memories without date', () => {
    expect(memoryDates(null, null)).toBeNull();
  });
});

describe('toImageWithMetadata', () => {
  it('maps to the gallery shape', () => {
    const photo: MemoryPhoto = {
      photoId: 'p', clientId: 'c', downloadUrl: 'full', thumbUrl: 'thumb', width: 10, height: 20,
      sizeBytes: 99, mimeType: 'image/jpeg', takenAt: null, lat: null, lng: null,
      uploadedBy: 'u', createdAt: '2026-01-01T00:00:00.000Z', isCover: true,
    };
    expect(toImageWithMetadata(photo)).toEqual({
      url: 'full', thumbUrl: 'thumb', photoId: 'p', width: 10, height: 20,
      created: '2026-01-01T00:00:00.000Z', size: 99, userId: 'u',
    });
  });
});

describe('pageStateForError', () => {
  it('maps HTTP status codes', () => {
    expect(pageStateForError(new HttpErrorResponse({ status: 404 }))).toBe('not-found');
    expect(pageStateForError(new HttpErrorResponse({ status: 403 }))).toBe('forbidden');
    expect(pageStateForError(new HttpErrorResponse({ status: 500 }))).toBe('error');
    expect(pageStateForError(new Error('x'))).toBe('error');
  });
});

describe('uploadProgressFor', () => {
  const job = (memoryId: string, status: UploadJob['status'], sent: number): UploadJob =>
    ({ memoryId, status, bytesTransferred: sent, totalBytes: 100 } as UploadJob);

  it('summarises jobs of one memory', () => {
    const p = uploadProgressFor([job('1', 'done', 100), job('1', 'uploading', 50), job('2', 'uploading', 0)], '1')!;
    expect(p.total).toBe(2);
    expect(p.done).toBe(1);
    expect(p.busy).toBe(true);
    expect(p.percent).toBe(75);
  });

  it('returns null without jobs', () => {
    expect(uploadProgressFor([job('2', 'done', 100)], '1')).toBeNull();
  });
});
