import HttpServer from 'react-native-http-bridge-refurbished';

import {
  getVectorTile,
} from './mbtiles';

export const startTileServer =
  () => {

    HttpServer.start(
      8181,
      'localhost',
      async request => {

        try {

          const parts =
            request.url
              .split('/');

          const z =
            parseInt(parts[1]);

          const x =
            parseInt(parts[2]);

          const y =
            parseInt(
              parts[3]
                .replace('.pbf', '')
            );

          const tile =
            getVectorTile(
              z,
              x,
              y,
            );

          if (!tile) {

            return {
              status: 404,
              type: 'text/plain',
              body: 'Tile not found',
            };
          }

          return {
            status: 200,
            type: 'application/x-protobuf',
            headers: {
              'Content-Encoding':
                'gzip',
            },
            body: tile,
          };

        } catch (e) {

          return {
            status: 500,
            type: 'text/plain',
            body: 'Server error',
          };
        }
      }
    );

    console.log(
      'Tile server started'
    );
  };