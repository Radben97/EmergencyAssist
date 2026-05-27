import HttpServer from 'react-native-http-bridge-refurbished';
import { getVectorTile } from './mbtiles';
import { Buffer } from 'buffer';

export const startTileServer = () => {
  HttpServer.start(
    8181,
    '127.0.0.1',
    async request => {
      try {
        console.log('>>> TILE REQUEST:', request.url);

        const path = request.url.split('?')[0];
        const parts = path.split('/').filter(Boolean);

        if (parts.length < 3) {
          return { status: 400, type: 'text/plain', body: 'Bad tile URL' };
        }

        const z = parseInt(parts[0], 10);
        const x = parseInt(parts[1], 10);
        const y = parseInt(parts[2].replace('.pbf', ''), 10);

        if ([z, x, y].some(isNaN)) {
          return { status: 400, type: 'text/plain', body: 'Invalid coords' };
        }

        const tileData = getVectorTile(z, x, y);

        if (!tileData) {
          console.log(`No tile for ${z}/${x}/${y}`);
          return { status: 204, type: 'application/x-protobuf', body: '' };
        }

        const isGzipped = tileData[0] === 0x1f && tileData[1] === 0x8b;
        console.log(`Serving tile ${z}/${x}/${y} size=${tileData.length} gzip=${isGzipped}`);

        const headers: Record<string, string> = {
          'Content-Type': 'application/x-protobuf',
          'Access-Control-Allow-Origin': '*',
          'Connection': 'close',
        };

        if (isGzipped) {
          headers['Content-Encoding'] = 'gzip';
        }

        return {
          status: 200,
          type: 'application/x-protobuf',
          headers,
          body: Buffer.from(tileData).toString('base64'),
          encoding: 'base64',
        };

      } catch (e) {
        console.error('[TileServer] Error:', e);
        return { status: 500, type: 'text/plain', body: 'Server error' };
      }
    }
  );

  console.log('[TileServer] Started on http://127.0.0.1:8181');
};