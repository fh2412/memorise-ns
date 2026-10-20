import { Injectable, inject } from '@angular/core';
import { GeocodingService } from '@services/geocoding.service';
import { ParsedLocation } from '@models/geocoder-response.model';
import { LatLng, PhotoInsights, PhotoMeta } from '@models/photo-metadata.model';
import { PickedPhoto } from '@models/photo-upload.model';
import { readPhotoMeta } from '../utils/exif-reader';
import { PhotoPoint, PhotoSummary, choosePlaceName, suggestTitle, summarizePhotos } from '../utils/photo-insights';

@Injectable({ providedIn: 'root' })
export class PhotoMetadataService {
  private readonly geocoding = inject(GeocodingService);

  /** Rounded position (~1 km) → result. Avoids repeated API calls while photos are added. */
  private readonly geocodeCache = new Map<string, Promise<ParsedLocation | null>>();

  /** EXIF of a single file. Never throws. */
  read(file: File): Promise<PhotoMeta | null> {
    return readPhotoMeta(file);
  }

  /** Synchronous summary (dates, clusters) – no network. Good for instant UI feedback. */
  summarize(photos: PickedPhoto[]): PhotoSummary {
    return summarizePhotos(toPoints(photos));
  }

  /**
   * Full insights incl. reverse geocoding of the main location (1 API call, cached).
   * Only suggestions – the caller decides what to apply.
   */
  async analyze(photos: PickedPhoto[]): Promise<PhotoInsights> {
    const summary = this.summarize(photos);
    const cluster = summary.mainCluster;

    const parsedLocation = cluster ? await this.reverseGeocode(cluster.representative) : null;
    const place = cluster ? choosePlaceName(parsedLocation, cluster.share) : null;

    return {
      photoCount: summary.photoCount,
      photosWithDate: summary.photosWithDate,
      photosWithGps: summary.photosWithGps,
      dateRange: summary.dateRange,
      location: cluster
        ? {
            parsedLocation,
            markerPosition: cluster.representative,
            photoCount: cluster.photoIds.length,
            share: cluster.share,
          }
        : null,
      titleSuggestion: suggestTitle(summary.dateRange, place),
    };
  }

  private reverseGeocode(position: LatLng): Promise<ParsedLocation | null> {
    const key = `${position.lat.toFixed(2)},${position.lng.toFixed(2)}`;
    const cached = this.geocodeCache.get(key);
    if (cached) return cached;

    const request = this.geocoding.reverseGeocode(position).then(
      result => {
        if (!result) this.geocodeCache.delete(key); // don't cache failures → retry later
        return result;
      },
      () => {
        this.geocodeCache.delete(key);
        return null;
      },
    );
    this.geocodeCache.set(key, request);
    return request;
  }
}

function toPoints(photos: PickedPhoto[]): PhotoPoint[] {
  return photos
    .filter(p => p.status === 'ready')
    .map(p => ({
      id: p.id,
      takenAt: p.meta?.takenAt ?? null,
      lat: p.meta?.lat ?? null,
      lng: p.meta?.lng ?? null,
    }));
}
