import { ParsedLocation } from '@models/geocoder-response.model';

/** Metadata read from a photo's EXIF block. */
export interface PhotoMeta {
  /**
   * Capture time as LOCAL wall-clock time where the photo was taken,
   * format "YYYY-MM-DDTHH:mm:ss" (no time zone – intentionally).
   * Lexicographically sortable.
   */
  takenAt: string | null;
  /** WGS84, rounded to 6 decimals. */
  lat: number | null;
  lng: number | null;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DateRangeSuggestion {
  /** Local midnight – ready for MatDatepicker. */
  start: Date;
  end: Date;
  /** Calendar days incl. start and end. */
  days: number;
  photoCount: number;
  /** Photos ignored as outliers (e.g. wrong camera clock). */
  excludedCount: number;
}

export interface LocationSuggestion {
  /** Same shape as the map dialog result → handled identically in the form. */
  parsedLocation: ParsedLocation | null;
  markerPosition: LatLng;
  photoCount: number;
  /** Share of all GPS photos inside the main cluster (0..1). */
  share: number;
}

export interface PhotoInsights {
  photoCount: number;
  photosWithDate: number;
  photosWithGps: number;
  dateRange: DateRangeSuggestion | null;
  location: LocationSuggestion | null;
  titleSuggestion: string | null;
}
