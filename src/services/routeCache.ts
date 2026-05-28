import { db } from '../database/sqlite';
import { CachedRoute } from '../types/route';

export const saveRoute = (route: CachedRoute) => {
  db.execute(
    `
    INSERT OR REPLACE INTO cached_routes (
      id,

      destinationName,
      destinationType,

      startLat,
      startLng,

      endLat,
      endLng,

      encodedPolyline,

      distanceMeters,
      durationSeconds,

      updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      route.id,

      route.destinationName,
      route.destinationType,

      route.startLat,
      route.startLng,

      route.endLat,
      route.endLng,

      route.encodedPolyline,

      route.distanceMeters,
      route.durationSeconds,

      route.updatedAt,
    ]
  );
};

export const getRoutes = (): CachedRoute[] => {
  const result = db.execute(
    `SELECT * FROM cached_routes`
  );

  return result.rows?._array ?? [];
};

export const getRoutesByType = (
  type: string
): CachedRoute[] => {
  const result = db.execute(
    `
    SELECT *
    FROM cached_routes
    WHERE destinationType = ?
    `,
    [type]
  );

  return result.rows?._array ?? [];
};

export const deleteOldRoutes = (
  maxAgeMs: number
) => {
  const cutoff = Date.now() - maxAgeMs;

  db.execute(
    `
    DELETE FROM cached_routes
    WHERE updatedAt < ?
    `,
    [cutoff]
  );
};