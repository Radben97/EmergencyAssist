import React from 'react';
import { View, Button, PermissionsAndroid, Linking, Platform } from 'react-native';

import Tts from 'react-native-tts';
import InCallManager from 'react-native-incall-manager';

const PHONE_NUMBER = '1234567890'; // replace with your number

export default function EmergencyCallTest() {

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    ]);

    return Object.values(granted).every(
      p => p === PermissionsAndroid.RESULTS.GRANTED
    );
  };

  const startEmergencyFlow = async () => {

    const ok = await requestPermissions();

    if (!ok) {
      console.log('Permissions denied');
      return;
    }

    // Force speakerphone
    InCallManager.start();
    InCallManager.setSpeakerphoneOn(true);

    // Start call
    Linking.openURL(`tel:${PHONE_NUMBER}`);

    // Wait for call connection
    setTimeout(() => {

      Tts.setDefaultLanguage('en-IN');

      Tts.speak(`
        This is an automated emergency alert.
        Possible accident detected.
        Testing emergency voice transmission.
      `);

    }, 5000);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Button
        title="TEST EMERGENCY CALL"
        onPress={startEmergencyFlow}
      />
    </View>
  );
}