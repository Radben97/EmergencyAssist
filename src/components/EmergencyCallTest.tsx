import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Tts from 'react-native-tts';
import InCallManager from 'react-native-incall-manager';
import { VolumeManager } from 'react-native-volume-manager';

const PHONE_NUMBER = '8128694394';
const MESSAGE = 'This is an automated emergency alert. Possible accident detected. Please respond immediately.';

export default function EmergencyCallTest() {
  const [calling, setCalling] = useState(false);
  const [status, setStatus] = useState('');

  const requestPermissions = async () => {
    if (Platform.OS !== 'android') return true;
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CALL_PHONE
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  };

  const speak = () => {
    setStatus('Speaking message...');
    Tts.addEventListener('tts-finish', () => {
      setStatus('Message sent. Ending call...');
      setTimeout(() => {
        InCallManager.stop();
        setCalling(false);
        setStatus('');
      }, 2000);
    });
    Tts.speak(MESSAGE);
  };

  const startCall = async () => {
    const ok = await requestPermissions();
    if (!ok) {
      Alert.alert('Permission Required', 'Phone permission is needed.');
      return;
    }

    setCalling(true);
    setStatus('Connecting...');

    // Setup audio BEFORE opening dialer
    await VolumeManager.setVolume(1.0);
    InCallManager.start({ media: 'audio' });
    InCallManager.setSpeakerphoneOn(true);
    InCallManager.setForceSpeakerphoneOn(true);

    Tts.setDefaultLanguage('en-IN');
    Tts.setDefaultRate(0.45);

    // Open dialer
    Linking.openURL(`tel:${PHONE_NUMBER}`);

    // Speak immediately — audio session is already active
    // so even if app backgrounds briefly, audio keeps playing
    setStatus('Waiting for pickup...');
    setTimeout(() => {
      speak();
    }, 8000);
  };

  const cancelCall = () => {
    Tts.stop();
    InCallManager.stop();
    setCalling(false);
    setStatus('');
  };

  if (calling) {
    return (
      <View style={styles.callScreen}>
        <Text style={styles.callNumber}>{PHONE_NUMBER}</Text>
        <Text style={styles.callStatus}>{status}</Text>
        <TouchableOpacity style={styles.endButton} onPress={cancelCall}>
          <Text style={styles.endButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.sosButton} onPress={startCall}>
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  sosButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#e00',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },
  sosText: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
  },
  callScreen: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  callNumber: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  callStatus: {
    color: '#aaa',
    fontSize: 18,
  },
  endButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e00',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  endButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
});