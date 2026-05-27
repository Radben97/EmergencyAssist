import TcpSocket from 'react-native-tcp-socket';
import { getVectorTile, isDbReady } from './mbtiles';
import { Buffer } from 'buffer';

export const startTileServer = () => {
  const server = TcpSocket.createServer(socket => {
    let requestBuffer = '';

    socket.on('data', async (data) => {
      try {
        requestBuffer += data.toString();

        // Wait for full HTTP request headers
        if (!requestBuffer.includes('\r\n\r\n')) return;

        const requestLine = requestBuffer.split('\r\n')[0];
        const url = requestLine.split(' ')[1] ?? '';
        console.log('[TileServer] Request:', url);

        const sendResponse = (
          status: number,
          statusText: string,
          headers: Record<string, string>,
          body: Uint8Array | null
        ) => {
          const bodyBytes = body ?? new Uint8Array(0);
          const headerLines = [
            `HTTP/1.1 ${status} ${statusText}`,
            `Content-Length: ${bodyBytes.length}`,
            'Access-Control-Allow-Origin: *',
            'Connection: close',
            ...Object.entries(headers).map(([k, v]) => `${k}: ${v}`),
            '\r\n',
          ].join('\r\n');

          const headerBytes = Buffer.from(headerLines, 'utf8');
          const response = new Uint8Array(headerBytes.length + bodyBytes.length);
          response.set(headerBytes, 0);
          response.set(bodyBytes, headerBytes.length);

          socket.write(response as unknown as string);
          socket.destroy();
        };

        if (!isDbReady()) {
          console.warn('[TileServer] DB not ready');
          sendResponse(503, 'Service Unavailable', {}, null);
          return;
        }

        const path = url.split('?')[0];
        const parts = path.split('/').filter(Boolean);

        if (parts.length < 3) {
          sendResponse(400, 'Bad Request', {}, null);
          return;
        }

        const z = parseInt(parts[0], 10);
        const x = parseInt(parts[1], 10);
        const y = parseInt(parts[2].replace('.pbf', ''), 10);

        if ([z, x, y].some(isNaN)) {
          sendResponse(400, 'Bad Request', {}, null);
          return;
        }

        const tileData = getVectorTile(z, x, y);

        if (!tileData) {
          console.log(`[TileServer] No tile for ${z}/${x}/${y}`);
          // 200 with empty body — 204 causes MapLibre "unexpected end of stream"
          sendResponse(200, 'OK', { 'Content-Type': 'application/x-protobuf' }, null);
          return;
        }

        const isGzipped = tileData[0] === 0x1f && tileData[1] === 0x8b;
        console.log(`[TileServer] Serving ${z}/${x}/${y} size=${tileData.length} gzip=${isGzipped}`);

        const headers: Record<string, string> = {
          'Content-Type': 'application/x-protobuf',
        };
        if (isGzipped) {
          headers['Content-Encoding'] = 'gzip';
        }

        sendResponse(200, 'OK', headers, tileData);

      } catch (e) {
        console.error('[TileServer] Error:', e);
        socket.destroy();
      }
    });

    socket.on('error', (err) => {
      console.error('[TileServer] Socket error:', err);
      socket.destroy();
    });
  });

  server.listen({ port: 8181, host: '127.0.0.1' }, () => {
    console.log('[TileServer] Started on http://127.0.0.1:8181');
  });

  server.on('error', (err) => {
    console.error('[TileServer] Server error:', err);
  });
};