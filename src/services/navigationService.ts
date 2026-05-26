import { Linking } from 'react-native';

export const openNavigation =
  (lat: number, lng: number) => {
    Linking.openURL(
      `google.navigation:q=${lat},${lng}`,
    );
  };