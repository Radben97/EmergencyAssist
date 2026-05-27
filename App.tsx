/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapplsGL from 'mappls-map-react-native';
import HomeScreen from './src/page/HomeScreen';
import { OfflineMap } from './src/maps/OfflineMap';


const App = () => {
  return <OfflineMap />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default App;