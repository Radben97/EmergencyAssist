import RNFS from 'react-native-fs';
import { open } from 'react-native-quick-sqlite';

let db: any = null;

const DB_NAME = 'chennai.mbtiles';

export const openMBTiles = async () => {
  try {
    const DB_DIR = `/data/user/0/com.emergencyassist/databases`;
    const DB_PATH = `${DB_DIR}/${DB_NAME}`;

    const dirExists = await RNFS.exists(DB_DIR);
    if (!dirExists) await RNFS.mkdir(DB_DIR);

    const exists = await RNFS.exists(DB_PATH);
    if (!exists) {
      console.log('Copying MBTiles...');
      await RNFS.copyFileAssets(`tiles/${DB_NAME}`, DB_PATH);
      console.log('MBTiles copied');
    }

    const stat = await RNFS.stat(DB_PATH);
    console.log('DB SIZE:', stat.size);

    db = open({ name: DB_NAME });
    console.log('DB OPENED');

    // Verify schema — log what tables exist
    const tables = db.execute(`SELECT name FROM sqlite_master WHERE type='table'`);
    console.log('TABLES:', JSON.stringify(tables.rows?._array ?? tables.rows, null, 2));

  } catch (error) {
    console.error('OPEN ERROR:', error);
  }
};

// Detect gzip magic bytes: 0x1f 0x8b
const isGzipped = (data: Uint8Array): boolean =>
  data.length >= 2 && data[0] === 0x1f && data[1] === 0x8b;

export const getVectorTile = (z: number, x: number, y: number) => {
  try {
    if (!db) return null;

    const tmsY = (1 << z) - 1 - y;

    const result = db.execute(
      `SELECT d.tile_data
       FROM tiles_shallow s
       JOIN tiles_data d ON s.tile_data_id = d.tile_data_id
       WHERE s.zoom_level = ? AND s.tile_column = ? AND s.tile_row = ?
       LIMIT 1`,
      [z, x, tmsY],
    );

    if (result.rows && result.rows.length > 0) {
      const row = result.rows.item(0);
      const raw = row.tile_data;

      // Log exact type once to confirm
      console.log('[tile_data] constructor:', raw?.constructor?.name);
      console.log('[tile_data] byteLength:', raw?.byteLength);
      console.log('[tile_data] ArrayBuffer.isView:', ArrayBuffer.isView(raw));

      let bytes: Uint8Array;

      if (raw instanceof Uint8Array) {
        bytes = raw;
      } else if (ArrayBuffer.isView(raw)) {
        // Handles Int8Array, etc. — works across JSI realm boundaries
        bytes = new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
      } else if (typeof raw?.byteLength === 'number') {
        // Cross-realm ArrayBuffer from JSI — instanceof fails but this works
        bytes = new Uint8Array(raw);
      } else if (raw?.bytes instanceof Uint8Array) {
        bytes = raw.bytes;
      } else if (Array.isArray(raw)) {
        bytes = new Uint8Array(raw);
      } else {
        console.error('[tile_data] Unhandled format:', typeof raw, Object.keys(raw ?? {}));
        return null;
      }

      console.log(`Tile ${z}/${x}/${y} size=${bytes.length}`);
      return bytes;
    }

    return null;
  } catch (error) {
    console.error('Tile fetch failed:', error);
    return null;
  }
};