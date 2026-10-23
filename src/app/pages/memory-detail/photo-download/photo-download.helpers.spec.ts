import {
  buildUploaders, downloadTarget, filterByUploaders, intersectSelection, photoDateLabel, sumBytes,
} from './photo-download.helpers';
import { MemoryPhoto } from '@models/memory-photo.model';

const photo = (id: string, uploadedBy: string, sizeBytes = 10, takenAt: string | null = null): MemoryPhoto => ({
  photoId: id, clientId: id, downloadUrl: '', thumbUrl: '', width: 1, height: 1, sizeBytes,
  mimeType: 'image/jpeg', takenAt, lat: null, lng: null, uploadedBy, createdAt: '2026-06-10T12:00:00.000Z', isCover: false,
});

const photos = [photo('a', 'anna', 10), photo('b', 'ben', 20), photo('c', 'anna', 30)];

describe('filterByUploaders', () => {
  it('returns everything without filter and filters otherwise', () => {
    expect(filterByUploaders(photos, new Set()).length).toBe(3);
    expect(filterByUploaders(photos, new Set(['anna'])).map(p => p.photoId)).toEqual(['a', 'c']);
    expect(sumBytes(photos)).toBe(60);
  });
});

describe('buildUploaders', () => {
  it('counts photos, sorts and falls back to Unknown', () => {
    const users = new Map([['anna', { name: 'Anna', profilepic: null }]]);
    expect(buildUploaders(photos, users).map(u => `${u.name}:${u.photoCount}`)).toEqual(['Anna:2', 'Unknown:1']);
  });
});

describe('downloadTarget', () => {
  const visible = [photos[0], photos[2]];
  it('prefers the selection, then all, then the filtered photos', () => {
    expect(downloadTarget(new Set(['b']), visible, true)).toEqual(['b']);
    expect(downloadTarget(new Set(), photos, false)).toBeNull();
    expect(downloadTarget(new Set(), visible, true)).toEqual(['a', 'c']);
  });

  it('drops selections that are no longer visible', () => {
    expect([...intersectSelection(new Set(['a', 'b']), visible)]).toEqual(['a']);
  });
});

describe('photoDateLabel', () => {
  it('uses the capture day without time zone shift, else the upload day', () => {
    expect(photoDateLabel(photo('x', 'u', 1, '2026-06-03T23:30:00'))).toBe('Jun 3, 2026');
    expect(photoDateLabel(photo('x', 'u'))).toBe('Uploaded Jun 10, 2026');
  });
});
