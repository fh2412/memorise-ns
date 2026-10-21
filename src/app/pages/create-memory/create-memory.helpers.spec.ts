import {
  FormSnapshot, SelectedLocation, applicableSuggestions, buildCreateRequest, formatDateRange, placeLabel,
} from './create-memory.helpers';
import { PhotoInsights } from '@models/photo-metadata.model';

const TODAY = new Date(2026, 9, 20);

const emptyForm: FormSnapshot = { title: '', titlePristine: true, start: null, end: null, datesPristine: true };

const insights: PhotoInsights = {
  photoCount: 10,
  photosWithDate: 10,
  photosWithGps: 8,
  dateRange: { start: new Date(2026, 5, 6), end: new Date(2026, 5, 7), days: 2, photoCount: 10, excludedCount: 0 },
  location: {
    parsedLocation: { city: 'Salzburg', country: 'Austria', countryCode: 'AT' },
    markerPosition: { lat: 47.8, lng: 13.04 },
    photoCount: 8,
    share: 1,
  },
  titleSuggestion: 'Weekend in Salzburg',
};

const mapLocation: SelectedLocation = {
  lat: 48.2, lng: 16.37, city: 'Vienna', country: 'Austria', countryCode: 'AT', source: 'map',
};

describe('applicableSuggestions', () => {
  it('suggests everything for an untouched form', () => {
    const s = applicableSuggestions(insights, emptyForm, null, TODAY);
    expect(s.title).toBe('Weekend in Salzburg');
    expect(s.dateRange?.start).toEqual(new Date(2026, 5, 6));
    expect(s.location?.city).toBe('Salzburg');
    expect(s.location?.source).toBe('photos');
  });

  it('never overwrites edited fields or a map location', () => {
    const edited: FormSnapshot = {
      title: 'My trip', titlePristine: false, start: new Date(2026, 5, 1), end: null, datesPristine: false,
    };
    const s = applicableSuggestions(insights, edited, mapLocation, TODAY);
    expect(s).toEqual({ title: null, dateRange: null, location: null });
  });

  it('drops suggestions that are already applied', () => {
    const applied: FormSnapshot = {
      title: 'Weekend in Salzburg', titlePristine: true,
      start: new Date(2026, 5, 6), end: new Date(2026, 5, 7), datesPristine: true,
    };
    const location: SelectedLocation = { ...mapLocation, lat: 47.8, lng: 13.04, source: 'photos' };
    expect(applicableSuggestions(insights, applied, location, TODAY)).toEqual({ title: null, dateRange: null, location: null });
  });

  it('clamps dates after today', () => {
    const future: PhotoInsights = {
      ...insights,
      dateRange: { start: new Date(2026, 9, 20), end: new Date(2026, 9, 21), days: 2, photoCount: 1, excludedCount: 0 },
    };
    expect(applicableSuggestions(future, emptyForm, null, TODAY).dateRange?.end).toEqual(TODAY);
  });
});

describe('buildCreateRequest', () => {
  const base = {
    requestId: 'req', title: '  Trip ', description: ' ', start: new Date(2026, 5, 6), end: null,
    location: null, activityId: null, crew: [], currentUserId: 'me', upload: null,
  };

  it('defaults the end date to the start date and trims text', () => {
    const r = buildCreateRequest(base);
    expect(r.title).toBe('Trip');
    expect(r.description).toBeNull();
    expect(r.startDate).toBe('2026-06-06');
    expect(r.endDate).toBe('2026-06-06');
    expect(r.upload).toBeNull();
  });

  it('sends a new location, or the activity locationId', () => {
    expect(buildCreateRequest({ ...base, location: mapLocation }).location?.city).toBe('Vienna');
    const activity = buildCreateRequest({ ...base, location: { ...mapLocation, source: 'activity', locationId: 9 } });
    expect(activity.locationId).toBe(9);
    expect(activity.location).toBeUndefined();
  });

  it('adds the upload reservation', () => {
    const r = buildCreateRequest({ ...base, upload: { fileCount: 3, bytes: 1000 } });
    expect(r.upload).toEqual({ expectedFileCount: 3, expectedBytes: 1000 });
  });
});

describe('formatting', () => {
  it('formats places and ranges', () => {
    expect(placeLabel(mapLocation)).toBe('Vienna, Austria');
    expect(placeLabel({ city: '', country: '', lat: 47.8, lng: 13.04 })).toBe('47.8000, 13.0400');
    expect(formatDateRange(new Date(2026, 5, 6), null)).toBe('Jun 6, 2026');
    // Intl uses thin spaces around the dash → normalise whitespace
    expect(formatDateRange(new Date(2026, 5, 6), new Date(2026, 5, 7)).replace(/\s/g, ' ')).toBe('Jun 6 – 7, 2026');
  });
});
