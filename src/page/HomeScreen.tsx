import React, { useState, useRef, useEffect, ElementRef } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { styles } from '../styles/styles';
import ChatbotPanel from '../components/ChatbotPanel';
import EmergencyContactsPanel from '../components/EmergencyContactsPanel';
import SOSButton from '../components/SOSButton';
import EmergencyServicesGrid from '../components/EmergencyServicesGrid';
import UtilityServicesSection from '../components/UtilityServicesSection';

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF2FF" hidden={true} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* AI Chatbot — primary interface */}
        <ChatbotPanel />

        {/* Location + Contacts row */}
        <View style={styles.topRow}>
          <EmergencyContactsPanel />
        </View>

        {/* SOS */}
        <SOSButton />

        {/* Emergency Services */}
        <EmergencyServicesGrid />

        {/* Utility Services */}
        <UtilityServicesSection/>
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Bottom Navigation */}
    </KeyboardAvoidingView>
  );
}