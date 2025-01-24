export interface MemoriseLocation {
  country: string;
  latitude: number;
  locality: string | null;
  location_id: number;
  longitude: number;
}

export interface CreateLocationResponse {
  message: string;
  locationId: number;
}
