import React from 'react';
import { View, Button, Alert, Linking, Platform, PermissionsAndroid } from 'react-native';
import Tts from 'react-native-tts';
import InCallManager from 'react-native-incall-manager';
import BackgroundActions from 'react-native-background-actions';
import { VolumeManager } from 'react-native-volume-manager';

const PHONE_NUMBER = '8128694394';

export default function EmergencyCallTest() {

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CALL_PHONE
    );

    console.log('CALL_PHONE:', result);

    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        'Phone Permission Required',
        'Please enable Phone access in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }

    return result === PermissionsAndroid.RESULTS.GRANTED;
  };

  // ---- STEP 1: Test this first, does TTS work at all? ----
  const testTtsOnly = () => {
    console.log('Testing TTS...');
    Tts.setDefaultLanguage('en-IN');
    Tts.setDefaultRate(0.5);

    Tts.addEventListener('tts-start', () => console.log('TTS started'));
    Tts.addEventListener('tts-finish', () => console.log('TTS finished'));
    Tts.addEventListener('tts-error', (e) => console.log('TTS error:', e));

    Tts.speak('This is a test message. Can you hear me?');
  };

  // ---- STEP 2: Test TTS with speakerphone, no call ----
  const testTtsWithSpeaker = async () => {
    console.log('Testing TTS with speakerphone...');
    await VolumeManager.setVolume(1.0);

    InCallManager.start({ media: 'audio' });
    InCallManager.setSpeakerphoneOn(true);
    InCallManager.setForceSpeakerphoneOn(true);

    Tts.setDefaultLanguage('en-IN');
    Tts.setDefaultRate(0.5);
    Tts.addEventListener('tts-error', (e) => console.log('TTS error:', e));
    Tts.speak('Speakerphone test. Can you hear me?');
  };

  // ---- STEP 3: Full emergency flow ----
  const speakWhenConnected = async () => {
    console.log('Background task started, waiting 8s...');
    await new Promise(res => setTimeout(() => res(null), 8000));
    console.log('8s passed, speaking now...');

    await VolumeManager.setVolume(1.0);

    InCallManager.start({ media: 'audio' });
    InCallManager.setSpeakerphoneOn(true);
    InCallManager.setForceSpeakerphoneOn(true);

    Tts.setDefaultLanguage('en-IN');
    Tts.setDefaultRate(0.5);

    Tts.addEventListener('tts-start', () => console.log('TTS started in background'));
    Tts.addEventListener('tts-finish', () => console.log('TTS finished in background'));
    Tts.addEventListener('tts-error', (e) => console.log('TTS error in background:', e));

    Tts.speak(
      'This is an automated emergency alert. Possible accident detected. Testing emergency voice transmission.'
    );
  };

  const startEmergencyFlow = async () => {
    const ok = await requestPermissions();
    if (!ok) return;

    await BackgroundActions.start(speakWhenConnected, {
      taskName: 'EmergencyAlert',
      taskTitle: 'Emergency Alert Active',
      taskDesc: 'Sending emergency voice message...',
      taskIcon: { name: 'ic_launcher', type: 'mipmap' },
      color: '#ff0000',
    });

    Linking.openURL(`tel:${PHONE_NUMBER}`);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 }}>
      <Button title="1. TEST TTS ONLY" onPress={testTtsOnly} />
      <Button title="2. TEST TTS + SPEAKER" onPress={testTtsWithSpeaker} />
      <Button title="3. FULL EMERGENCY CALL" onPress={startEmergencyFlow} />
    </View>
  );
}