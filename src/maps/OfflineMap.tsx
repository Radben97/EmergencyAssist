import React, { useEffect, useState } from 'react';
import {
  Map,
  Camera,
  VectorSource,
  GeoJSONSource,
  Layer,
} from '@maplibre/maplibre-react-native';

import { prepareMBTiles } from '../services/mbtiles';

import {
  initializeOfflineRouting,
  getOfflineRoute,
} from '../services/offlineRouting';

export const OfflineMap = () => {

  const [mbtilesPath, setMbtilesPath] =
    useState<string | null>(null);

  const [route, setRoute] =
    useState<any>(null);

  useEffect(() => {
    prepareMBTiles().then(setMbtilesPath);
  }, []);

  useEffect(() => {
    prepareMBTiles().then(path => {
      console.log('MBTILES PATH:', path);
      console.log('MBTILES URL:', `mbtiles://${path}`);
      setMbtilesPath(path);
    });
  }, []);

  useEffect(() => {

    async function setupRouting() {

      try {

        console.log(
          'Initializing GraphHopper...'
        );

        await initializeOfflineRouting();

        console.log(
          'Graph loaded successfully'
        );

        const result =
          await getOfflineRoute(
            13.0827,
            80.2707,
            13.0674,
            80.2376
          );

        console.log(
          'ROUTE RESULT:',
          result
        );

        setRoute(result);

      } catch (e) {

        console.error(
          'ROUTING ERROR:',
          e
        );
      }
    }

    setupRouting();

  }, []);

  if (!mbtilesPath) return null;

  return (
    <Map
      style={{ flex: 1 }}
      mapStyle={{
        version: 8,

        glyphs:
          'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',

        sources: {},

        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#f8f4f0',
            },
          },
        ],
      }}
    >

      <Camera
        zoom={12}
        center={[80.2707, 13.0827]}
      />

      <VectorSource
        id="chennai"
        url={`mbtiles://${mbtilesPath}`}
      >

        <Layer
          id="water"
          type="fill"
          source-layer="water"
          paint={{ 'fill-color': '#a0c8f0' }}
        />

        <Layer
          id="waterways"
          type="line"
          source-layer="waterway"
          paint={{
            'line-color': '#7bb6e6',
            'line-width': 1.2,
          }}
        />

        <Layer
          id="landuse"
          type="fill"
          source-layer="landuse"
          paint={{ 'fill-color': '#e8f5e9' }}
        />

        <Layer
          id="buildings"
          type="fill"
          source-layer="building"
          paint={{
            'fill-color': '#e8e0d8',
            'fill-outline-color': '#ccc',
          }}
        />

        <Layer
          id="roads-casing"
          type="line"
          source-layer="transportation"
          paint={{
            'line-color': '#ccc',
            'line-width': 3,
          }}
        />

        <Layer
          id="roads"
          type="line"
          source-layer="transportation"
          paint={{
            'line-color': '#ffffff',
            'line-width': 1.5,
          }}
        />

        <Layer
          id="road-labels"
          type="symbol"
          source-layer="transportation_name"
          layout={{
            'text-field': ['get', 'name'],
            'text-size': 14,
          }}
          paint={{
            'text-color': '#000000',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.5,
          }}
        />

        <Layer
          id="place-labels"
          type="symbol"
          source-layer="place"
          layout={{
            'text-field': ['get', 'name'],
            'text-size': 16,
          }}
          paint={{
            'text-color': '#222',
            'text-halo-color': '#fff',
            'text-halo-width': 1.5,
          }}
        />

        <Layer
          id="park-labels"
          type="symbol"
          source-layer="park"
          layout={{
            'text-field': ['get', 'name'],
            'text-size': 13,
          }}
          paint={{
            'text-color': '#2e7d32',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1,
          }}
        />

        <Layer
          id="poi-labels"
          type="symbol"
          source-layer="poi"
          minzoom={12}
          layout={{
            'text-field': ['get', 'name'],
            'text-size': 12,
          }}
          paint={{
            'text-color': '#333',
            'text-halo-color': '#fff',
            'text-halo-width': 1,
          }}
        />

        <Layer
          id="airport-labels"
          type="symbol"
          source-layer="aerodrome_label"
          layout={{
            'text-field': ['get', 'name'],
            'text-size': 14,
          }}
          paint={{
            'text-color': '#000',
            'text-halo-color': '#fff',
            'text-halo-width': 1,
          }}
        />

      </VectorSource>

      {
        route && (
          <GeoJSONSource
            id="route-source"
            data={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: route.coordinates,
              },
              properties: {},
            }}
          >

            <Layer
              id="route-layer"
              type="line"

              layout={{
                'line-cap': 'round',
                'line-join': 'round',
              }}

              paint={{
                'line-color': '#007AFF',
                'line-width': 5,
              }}
            />

          </GeoJSONSource>
        )
      }

    </Map>
  );
};