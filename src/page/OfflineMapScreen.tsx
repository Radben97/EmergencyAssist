import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Map,
  Camera,
  VectorSource,
  Layer,
} from '@maplibre/maplibre-react-native';

export default function OfflineMapScreen() {
  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle={{
          version: 8,
          sources: {},
          layers: [],
        }}
      >
        {/* FIX: Changed defaultStop to defaultSettings */}
       <Camera
  initialViewState={{
    center: [80.2707, 13.0827], // [longitude, latitude]
    zoom: 10,
  }}
/>

        <VectorSource
          id="offline-source"
          url="mbtiles:///storage/emulated/0/Download/tamilnadu.mbtiles"
        >
          {/* FIX: Removed sourceID, changed "source-layer" to sourceLayer */}
          <Layer
            id="road-layer"
            source-layer="transportation" 
            type="line"
            style={{
              lineColor: '#2563EB',
              lineWidth: 2,
            }}
          />
        </VectorSource>
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});