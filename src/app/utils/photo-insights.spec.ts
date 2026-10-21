import { choosePlaceName, clusterLocations, computeDateRange, suggestTitle, summarizePhotos } from './photo-insights';
import { DateRangeSuggestion } from '@models/photo-metadata.model';

const NOW = new Date(2026, 9, 20); // Oct 20, 2026

function range(start: [number, number, number], days: number): DateRangeSuggestion {
  const s = new Date(start[0], start[1] - 1, start[2]);
  const e = new Date(start[0], start[1] - 1, start[2] + days - 1);
  return { start: s, end: e, days, photoCount: 10, excludedCount: 0 };
}

describe('computeDateRange', () => {
  it('returns first and last calendar day as local midnight', () => {
    const r = computeDateRange(['2026-06-05T09:00:00', '2026-06-03T23:30:00', '2026-06-04T12:00:00'], NOW)!;
    expect(r.start).toEqual(new Date(2026, 5, 3));
    expect(r.end).toEqual(new Date(2026, 5, 5));
    expect(r.days).toBe(3);
  });

  it('ignores impossible dates', () => {
    const r = computeDateRange(['1970-01-01T00:00:00', '2030-01-01T00:00:00', '2026-06-03T10:00:00'], NOW)!;
    expect(r.days).toBe(1);
    expect(r.excludedCount).toBe(2);
  });

  it('drops a single outlier with a wrong camera clock', () => {
    const dates = ['2026-06-03', '2026-06-03', '2026-06-04', '2026-06-04', '2026-06-05', '2024-01-01']
      .map(d => `${d}T10:00:00`);
    const r = computeDateRange(dates, NOW)!;
    expect(r.start).toEqual(new Date(2026, 5, 3));
    expect(r.excludedCount).toBe(1);
  });

  it('keeps genuinely long ranges', () => {
    const r = computeDateRange(['2026-01-01T10:00:00', '2026-02-01T10:00:00', '2026-05-01T10:00:00', '2026-09-01T10:00:00', '2026-10-01T10:00:00'], NOW)!;
    expect(r.start).toEqual(new Date(2026, 0, 1));
    expect(r.end).toEqual(new Date(2026, 9, 1));
  });

  it('returns null without dates', () => {
    expect(computeDateRange([], NOW)).toBeNull();
  });
});

describe('clusterLocations', () => {
  it('groups nearby photos and sorts by size', () => {
    const clusters = clusterLocations([
      { id: 'a', lat: 47.80, lng: 13.04 }, // Salzburg
      { id: 'b', lat: 47.81, lng: 13.05 },
      { id: 'c', lat: 47.79, lng: 13.03 },
      { id: 'd', lat: 48.21, lng: 16.37 }, // Vienna
    ]);
    expect(clusters.length).toBe(2);
    expect(clusters[0].photoIds).toEqual(['a', 'b', 'c']);
    expect(clusters[0].share).toBe(0.75);
  });

  it('uses a real photo position as representative', () => {
    const [main] = clusterLocations([{ id: 'a', lat: 47.8, lng: 13.0 }, { id: 'b', lat: 47.82, lng: 13.06 }]);
    expect([{ lat: 47.8, lng: 13.0 }, { lat: 47.82, lng: 13.06 }]).toContain(main.representative);
  });
});

describe('suggestTitle', () => {
  it('builds titles with a place', () => {
    expect(suggestTitle(range([2026, 6, 3], 1), 'Salzburg')).toBe('A day in Salzburg');
    expect(suggestTitle(range([2026, 6, 6], 2), 'Salzburg')).toBe('Weekend in Salzburg'); // Sat–Sun
    expect(suggestTitle(range([2026, 6, 2], 3), 'Salzburg')).toBe('3 days in Salzburg');  // Tue–Thu
    expect(suggestTitle(range([2026, 7, 1], 10), 'Croatia')).toBe('10 days in Croatia');
  });

  it('builds titles without a place', () => {
    expect(suggestTitle(range([2026, 6, 3], 1), null)).toBe('June 3, 2026');
    expect(suggestTitle(range([2026, 6, 2], 4), null)).toBe('4 days · June 2026');
    expect(suggestTitle(range([2026, 6, 28], 5), null)).toBe('5 days · June – July 2026');
  });

  it('handles missing dates', () => {
    expect(suggestTitle(null, 'Vienna')).toBe('Memories from Vienna');
    expect(suggestTitle(null, null)).toBeNull();
  });
});

describe('choosePlaceName', () => {
  const loc = { city: 'Split', country: 'Croatia', countryCode: 'HR' };
  it('uses the city when most photos are there', () => expect(choosePlaceName(loc, 0.9)).toBe('Split'));
  it('falls back to the country for spread-out trips', () => expect(choosePlaceName(loc, 0.4)).toBe('Croatia'));
  it('handles missing data', () => expect(choosePlaceName(null, 1)).toBeNull());
});

describe('summarizePhotos', () => {
  it('counts photos with date and GPS', () => {
    const s = summarizePhotos([
      { id: 'a', takenAt: '2026-06-03T10:00:00', lat: 47.8, lng: 13.04 },
      { id: 'b', takenAt: '2026-06-04T10:00:00', lat: null, lng: null },
      { id: 'c', takenAt: null, lat: null, lng: null },
    ], NOW);
    expect(s.photosWithDate).toBe(2);
    expect(s.photosWithGps).toBe(1);
    expect(s.mainCluster?.photoIds).toEqual(['a']);
  });
});
