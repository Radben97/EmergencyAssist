import React, {
  useEffect,
} from 'react';

import {
  Map,
  Camera,
  VectorSource,
  Layer,
} from '@maplibre/maplibre-react-native';
import { openMBTiles } from '../services/mbtiles';
import { startTileServer } from '../services/tileServer';


const OfflineMap =
  () => {

    useEffect(() => {

      const init =
        async () => {

          await openMBTiles();

          startTileServer();
        };

      init();

    }, []);

    return (

      <Map
        style={{
          flex: 1,
        }}
        mapStyle={{
          version: 8,
          sources: {
            offlineSource: {
              type: 'vector',
              tiles: [
                'http://127.0.0.1:8181/{z}/{x}/{y}.pbf',
              ],
            },
          },
          layers: [
            {
              id: 'roads',
              type: 'line',
              source: 'offlineSource',
              'source-layer':
                'transportation',
              paint: {
                'line-color':
                  '#ffffff',
                'line-width': 2,
              },
            },
          ],
        }}
      >

        <Camera
          zoom={10}
          center={[
            80.2707,
            13.0827,
          ]}
        />

      </Map>
    );
};

export default OfflineMap;