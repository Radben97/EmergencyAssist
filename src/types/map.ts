export interface LatLng { lat: number; lng: number }

export interface RouteInfo {
  distanceKm: string;
  durationMin: string;
  coordinates: [number, number][]; // [lng, lat] pairs for GeoJSON
}