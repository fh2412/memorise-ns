export interface MemoriseLocation {
  country: string;
  latitude: number;
  longitude: number;
  locality: string | null;
  location_id: number;
}

export interface CreateLocationResponse {
  message: string;
  locationId: number;
}
