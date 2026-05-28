export interface CachedRoute {
  id: string;

  destinationName: string;
  destinationType: string;

  startLat: number;
  startLng: number;

  endLat: number;
  endLng: number;

  encodedPolyline: string;

  distanceMeters: number;
  durationSeconds: number;

  updatedAt: number;
}