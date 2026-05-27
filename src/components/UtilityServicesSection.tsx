import { Alert, Linking, PermissionsAndroid, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/styles";
import MapplsGL from "mappls-map-react-native";
import Geolocation from "react-native-geolocation-service"

const UtilityServicesSection = () => {

  const searchNearbyPlace = async (
    keyword: string,
  ) => {
    try {
      const granted =
  await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

if (
  granted !==
  PermissionsAndroid.RESULTS.GRANTED
) {
  Alert.alert(
    'Permission denied',
    'Location permission required',
  );
  return;
}
      Geolocation.getCurrentPosition(
  async (pos) => {
    try {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // FIX 1: Mappls Nearby API expects "longitude,latitude" 
      const locationString = `${lat},${lng}`; 
      console.log(locationString)
      console.log("here")
      const response = await MapplsGL.RestApi.nearby({
        keyword: "POLSTN",
        radius: 5000,
        location: locationString,
      });

      console.log('NEARBY RESPONSE:', JSON.stringify(response, null, 2));

      const place = response?.suggestedLocations?.[0];

      if (!place) {
        Alert.alert('No Results', `No nearby ${keyword} found within 5km.`);
        return;
      }

      // Read fallback properties if standard ones are missing depending on SDK version
      const targetLat = place.latitude ?? place.entryLatitude;
      const targetLng = place.longitude ?? place.entryLongitude;

      const placeLat = Number(targetLat);
      const placeLng = Number(targetLng);

      if (isNaN(placeLat) || isNaN(placeLng) || placeLat === 0) {
        Alert.alert('Invalid Location', 'The selected place does not contain valid coordinates.');
        return;
      }

      // FIX 2: Correct Deep Link Intent + execution via Linking
      const url = `google.navigation:q=${placeLat},${placeLng}`;
      const webFallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${placeLat},${placeLng}`;

      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        console.log("here")
        await Linking.openURL(url);
      } else {
        // Fallback to browser if Google Maps app isn't available
        await Linking.openURL(webFallbackUrl);
      }

    } catch (error) {
      console.error('Mappls API Fetch Error:', error);
      Alert.alert('Error', 'Failed to fetch nearby coordinates.');
    }
  },
  (error) => {
    console.error('Geolocation Error:', error);
    Alert.alert('Location Error', 'Failed to grab your current GPS coordinates.');
  },
  { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
);

    } catch (err) {

      console.log(
        'SEARCH ERROR:',
        err,
      );

      Alert.alert(
        'Error',
        'Failed to search nearby places',
      );
    }
  };

  return (
    <View style={styles.section}>

      <Text style={styles.sectionTitle}>
        Utility Services
      </Text>

      <View style={styles.grid2}>

        <TouchableOpacity
          style={[
            styles.utilityBtn,
            {
              backgroundColor:
                '#3949AB',
            },
          ]}
          activeOpacity={0.85}
          onPress={() =>
            searchNearbyPlace(
              'hospital',
            )
          }
        >
          <Text
            style={
              styles.utilityBtnIcon
            }
          >
            ⊙
          </Text>

          <Text
            style={
              styles.utilityBtnLabel
            }
          >
            Puncture
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.utilityBtn,
            {
              backgroundColor:
                '#7B1FA2',
            },
          ]}
          activeOpacity={0.85}
          onPress={() =>
            searchNearbyPlace(
              'towing',
            )
          }
        >
          <Text
            style={
              styles.utilityBtnIcon
            }
          >
            🔧
          </Text>

          <Text
            style={
              styles.utilityBtnLabel
            }
          >
            Towing
          </Text>

        </TouchableOpacity>

      </View>
    </View>
  );
};

export default UtilityServicesSection