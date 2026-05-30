import React from 'react';
import {SafeAreaView} from 'react-native';
import WebView from 'react-native-webview';

export default function OfflineMap() {
  const html = `
<!DOCTYPE html>
<html>

<head>

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<link
  rel="stylesheet"
  href="https://unpkg.com/maplibre-gl@5.6.2/dist/maplibre-gl.css"
/>

<script
  src="https://unpkg.com/maplibre-gl@5.6.2/dist/maplibre-gl.js">
</script>

<style>

html,
body,
#map {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

</style>

</head>

<body>

<div id="map"></div>

<script>

function send(msg) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(msg);
  }
}

send('SCRIPT STARTED');

const map = new maplibregl.Map({

  container: 'map',

  center: [80.2707, 13.0827],

  zoom: 11,

  style: {

    version: 8,

    glyphs:
      'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',

    sources: {

      chennai: {

        type: 'vector',

        tiles: [
          'http://localhost:8080/{z}/{x}/{y}.pbf'
        ],

        minzoom: 0,
        maxzoom: 14
      }
    },

    layers: [

      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': '#f8f4f0'
        }
      },

      {
        id: 'water',
        type: 'fill',
        source: 'chennai',
        'source-layer': 'water',
        paint: {
          'fill-color': '#a0c8f0'
        }
      },
      {
  id: 'water-labels',
  type: 'symbol',
  source: 'chennai',
  'source-layer': 'water_name',

  layout: {
    'text-field': [
      'coalesce',
      ['get', 'name:en'],
      ['get', 'name']
    ],
    'text-size': 13
  },

  paint: {
    'text-color': '#1e88e5',
    'text-halo-color': '#ffffff',
    'text-halo-width': 1
  }
},

      {
        id: 'waterways',
        type: 'line',
        source: 'chennai',
        'source-layer': 'waterway',
        paint: {
          'line-color': '#7bb6e6',
          'line-width': 1.2
        }
      },

      {
        id: 'landuse',
        type: 'fill',
        source: 'chennai',
        'source-layer': 'landuse',
        paint: {
          'fill-color': '#e8f5e9'
        }
      },

      {
        id: 'roads-casing',
        type: 'line',
        source: 'chennai',
        'source-layer': 'transportation',
        paint: {
          'line-color': '#cccccc',
          'line-width': 3
        }
      },

      {
        id: 'roads',
        type: 'line',
        source: 'chennai',
        'source-layer': 'transportation',
        paint: {
          'line-color': '#ffffff',
          'line-width': 1.5
        }
      },

      {
        id: 'road-labels',
        type: 'symbol',
        source: 'chennai',
        'source-layer': 'transportation_name',
        layout: {
          'text-field': ['coalesce',
            ['get', 'name:en'],
            ['get', 'name']
          ],
          'text-size': 12,
          'symbol-placement': 'line'
        },
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5
        }
      },

      {
        id: 'place-labels',
        type: 'symbol',
        source: 'chennai',
        'source-layer': 'place',
        layout: {
          'text-field': ['coalesce',
            ['get', 'name:en'],
            ['get', 'name']
          ],
          'text-size': 16
        },
        paint: {
          'text-color': '#222222',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5
        }
      },

      {
        id: 'park-labels',
        type: 'symbol',
        source: 'chennai',
        'source-layer': 'park',
        layout: {
          'text-field': ['coalesce',
            ['get', 'name:en'],
            ['get', 'name']
          ],
          'text-size': 13
        },
        paint: {
          'text-color': '#2e7d32',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1
        }
      },

      {
        id: 'poi-labels',
        type: 'symbol',
        source: 'chennai',
        'source-layer': 'poi',
        minzoom: 12,
        layout: {
          'text-field': ['coalesce',
            ['get', 'name:en'],
            ['get', 'name']
          ],
          'text-size': 12
        },
        paint: {
          'text-color': '#333333',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1
        }
      },

      {
        id: 'airport-labels',
        type: 'symbol',
        source: 'chennai',
        'source-layer': 'aerodrome_label',
        layout: {
          'text-field': ['coalesce',
            ['get', 'name:en'],
            ['get', 'name']
          ],
          'text-size': 14
        },
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1
        }
      }
    ]
  }
});

map.on('load', () => {
  send('MAP LOADED');
});

map.on('error', e => {
  send(
    'MAP ERROR: ' +
    JSON.stringify(e.error || e)
  );
});

</script>

</body>
</html>
`;
return (
  <WebView
  source={{html}}
  javaScriptEnabled
  allowFileAccess
  allowUniversalAccessFromFileURLs
  allowFileAccessFromFileURLs
  mixedContentMode="always"
  onMessage={(e) => {
    console.log("WEBVIEW:", e.nativeEvent.data);
  }}
/>
);
}