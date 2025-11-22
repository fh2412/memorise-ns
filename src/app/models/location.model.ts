export interface MemoriseLocation {
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  city: string | null;
  location_id: number;
}

export interface CreateLocationResponse {
  message: string;
  locationId: number;
}
