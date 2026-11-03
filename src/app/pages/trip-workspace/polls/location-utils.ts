import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { ParsedLocation } from '@models/geocoder-response.model';
import { PlanLocation } from '@models/memoryInterface.model';
import { ChooseLocationComponent } from '@components/_dialogs/choose-location/choose-location.component';

const DEFAULT_CENTER = { lat: 48.3, lng: 14.3 };
const round6 = (n: number) => Math.round(n * 1e6) / 1e6; // DECIMAL(9,6)

/** Opens your existing map dialog. null = cancelled or no marker set. */
export async function pickLocation(
  dialog: MatDialog,
  center?: { lat: number; lng: number } | null,
): Promise<PlanLocation | null> {
  const c = center ?? DEFAULT_CENTER;
  const ref = dialog.open(ChooseLocationComponent, {
    width: '800px',
    maxWidth: '95vw',
    data: { lat: c.lat, long: c.lng },
  });
  const result = (await firstValueFrom(ref.afterClosed())) as
    | { parsedLocation?: ParsedLocation; markerPosition?: google.maps.LatLngLiteral }
    | undefined;

  const pos = result?.markerPosition;
  if (!pos) return null;
  const p = result?.parsedLocation;
  return {
    lat: round6(pos.lat),
    lng: round6(pos.lng),
    city: p?.city ?? '',
    country: p?.country ?? '',
    countryCode: p?.countryCode ?? '',
  };
}

export function formatLocation(l: PlanLocation | null | undefined): string {
  if (!l) return '';
  return [l.city, l.country].filter(Boolean).join(', ') || `${l.lat.toFixed(3)}, ${l.lng.toFixed(3)}`;
}