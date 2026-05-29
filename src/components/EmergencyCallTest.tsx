import React from 'react';
import { View, Button, PermissionsAndroid, Linking, Platform } from 'react-native';

import Tts from 'react-native-tts';
import InCallManager from 'react-native-incall-manager';
import BackgroundActions from 'react-native-background-actions';
import { VolumeManager } from 'react-native-volume-manager';

const PHONE_NUMBER = '8128694394';

export default function EmergencyCallTest() {

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      // Removed READ_PHONE_STATE — causes failures on Android 10+
    ]);

    return Object.values(granted).every(
      p => p === PermissionsAndroid.RESULTS.GRANTED
    );
  };

  const speakWhenConnected = async () => {
    // Wait for call to connect
    await new Promise(res => setTimeout(() => res, 8000));

    // Max volume so speaker is loud enough for mic to pick up
    await VolumeManager.setVolume(1.0);

    // Force audio to speaker even during active call
    InCallManager.start({ media: 'audio' });
    InCallManager.setSpeakerphoneOn(true);
    InCallManager.setForceSpeakerphoneOn(true);

    Tts.setDefaultLanguage('en-IN');
    Tts.setDefaultRate(0.5);
    Tts.speak(
      'This is an automated emergency alert. Possible accident detected. Testing emergency voice transmission.'
    );
  };

  const startEmergencyFlow = async () => {
    const ok = await requestPermissions();
    console.log('Permissions ok:', ok);

    if (!ok) {
      console.log('Permissions denied');
      return;
    }

    // Start foreground service BEFORE launching dialer
    // so TTS stays alive when app goes to background
    await BackgroundActions.start(speakWhenConnected, {
      taskName: 'EmergencyAlert',
      taskTitle: 'Emergency Alert Active',
      taskDesc: 'Sending emergency voice message...',
      taskIcon: { name: 'ic_launcher', type: 'mipmap' },
      color: '#ff0000',
    });

    // Open dialer — foreground service keeps TTS alive in background
    Linking.openURL(`tel:${PHONE_NUMBER}`);
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