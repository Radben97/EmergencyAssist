import { open } from 'react-native-quick-sqlite';

export const db = open({
  name: 'offline_nav.db',
});

export const initDB = () => {
  db.execute(`
    CREATE TABLE IF NOT EXISTS cached_routes (
      id TEXT PRIMARY KEY,
      destinationName TEXT,

      startLat REAL,
      startLng REAL,

      endLat REAL,
      endLng REAL,

      encodedPolyline TEXT,

      distanceMeters REAL,
      durationSeconds REAL,

      updatedAt INTEGER
    );
  `);

  console.log('DB initialized');
};