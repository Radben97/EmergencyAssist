import React, { useState, useRef, useEffect, ElementRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Animated,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
    FlatList,
    ActivityIndicator,
    Modal,
    Alert,
  SafeAreaView
} from 'react-native';
import MapplsGL from 'mappls-map-react-native';
import Geolocation from "react-native-geolocation-service"
import { Camera } from 'mappls-map-react-native';
import { PermissionsAndroid } from 'react-native';

// Mappls React Native SDK
// ─── Types ───────────────────────────────────────────────────────────────────
interface Contact {
  id: string;
  name: string;
  role: string;
  phone: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

interface LatLng { lat: number; lng: number }

interface RouteInfo {
  distanceKm: string;
  durationMin: string;
  coordinates: [number, number][]; // [lng, lat] pairs for GeoJSON
}
// constants
const CHENNAI_CENTER: LatLng = { lat: 13.0827, lng: 80.2707 };

// Mappls Directions REST endpoint (online mode)
// SDK handles auth via bundled conf — just hit the endpoint
const DIRECTIONS_URL = (oLng: number, oLat: number, dLng: number, dLat: number) =>
  `https://apis.mappls.com/advancedmaps/v1/route_adv/driving/` +
  `${oLng},${oLat};${dLng},${dLat}?geometries=geojson&overview=full`;

// ─── Static Data ─────────────────────────────────────────────────────────────
const EMERGENCY_CONTACTS: Contact[] = [
  { id: '1', name: 'Arun mama', role: 'Primary', phone: '+91 93425 57214' },
  { id: '2', name: 'Balaji', role: 'Secondary', phone: '+91 73050 86446' },
  { id: '3', name: 'Emergency 911', role: 'Emergency', phone: '911' },
];

const EMERGENCY_SERVICES = [
  { id: 'ambulance', label: 'Ambulance', icon: '🚑', color: '#D32F2F', number: '108' },
  { id: 'police', label: 'Police', icon: '🛡️', color: '#1565C0', number: '100' },
  { id: 'firefighter', label: 'Firefighter', icon: '🚒', color: '#E65100', number: '101' },
];

const UTILITY_SERVICES = [
  { id: 'towing', label: 'Towing', icon: '🔧', color: '#7B1FA2' },
  { id: 'puncture', label: 'Puncture', icon: '⊙', color: '#3949AB' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
// GPS Status Bar
const StatusTopBar = () => (
  <View style={styles.statusBar}>
    <View style={styles.statusLeft}>
      <Text style={styles.statusIcon}>📶</Text>
      <Text style={styles.statusText}>Strong</Text>
      <Text style={styles.statusIcon}>  🧭</Text>
      <Text style={styles.statusText}>High Accuracy</Text>
    </View>
        <Text style={styles.statusTime}>{}</Text>
  </View>
);

// AI Chatbot Panel
const ChatbotPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', text: 'Hi! I\'m your AI assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'You are a helpful emergency assistant app AI. Keep responses short and helpful.',
          messages: newMessages.map(m => ({ role: m.role, content: m.text })),
        }),
      });
      const data = await response.json();
      const reply = data?.content?.[0]?.text || 'Sorry, I could not respond.';
      setMessages(prev => [...prev, { id: Date.now().toString() + 'a', role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString() + 'e', role: 'assistant', text: 'Network error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.chatPanel}>
      <View style={styles.chatHeader}>
        <Text style={styles.chatHeaderIcon}>💬</Text>
        <Text style={styles.chatHeaderTitle}>AI Assistant</Text>
        <View style={styles.onlineDot} />
      </View>

      <ScrollView
        ref={flatRef as any}
        style={styles.chatMessages}
        contentContainerStyle={{ paddingVertical: 8 }}
        onContentSizeChange={() => (flatRef.current as any)?.scrollToEnd({ animated: true })}
      >
        {messages.map((item) => (
          <View key={item.id} style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
            <Text style={[styles.bubbleText, item.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAI]}>
              {item.text}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={styles.bubbleAI}>
            <Text style={styles.bubbleTextAI}>Typing…</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.chatInputRow}>
        <TextInput
          style={styles.chatInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ask me anything…"
          placeholderTextColor="#9CA3AF"
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} activeOpacity={0.8}>
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// GPS Location Panel
const dummyfunc = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.locationPanel}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <View style={styles.locationIconWrap}>
          <Text style={styles.locationIcon}>➤</Text>
        </View>
        <Text style={styles.locationTitle}>Your Current Location</Text>
        <Text style={styles.locationSub}>Tap to open map</Text>
      </TouchableOpacity>

      <MapModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

// ─── MapModal ─────────────────────────────────────────────────────────────────
interface MapModalProps {
  visible: boolean;
  onClose: () => void;
  /**
   * DEV → leave undefined; chatbot will call this in production.
   * Pass a { lat, lng } to pre-set the destination from outside.
   */
  externalDestination?: LatLng;
}

export const MapModal = ({ visible, onClose, externalDestination }: MapModalProps) => {
  const cameraRef = useRef<ElementRef<typeof MapplsGL.Camera>>(null);
const mapRef = useRef<ElementRef<typeof MapplsGL.MapView>>(null);

  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState<LatLng>(
    CHENNAI_CENTER
  );

  // Debug input state (shown only when externalDestination is not set)
  const [debugInput, setDebugInput] = useState(
    `${CHENNAI_CENTER.lat}, ${CHENNAI_CENTER.lng}`
  );

  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [locationPermitted, setLocationPermitted] = useState(false);

  // ── Get user's GPS location ──────────────────────────────────────────────
  useEffect(() => {
  if (!visible) return;

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
      },
      err => Alert.alert('GPS Error', err.message),
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 5000 }
    );
  };

  if (Platform.OS === 'android') {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs your location to show the map and route.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      }
    ).then(result => {
      if (result === PermissionsAndroid.RESULTS.GRANTED) {
        setLocationPermitted(true);
  getLocation();
      } else {
        Alert.alert('Permission Denied', 'Location access is required for the map.');
      }
    });
  } else {
    getLocation(); // iOS handles permissions via Info.plist
  }
}, [visible]);

  // ── Sync external destination (from chatbot) ─────────────────────────────
  useEffect(() => {
    if (externalDestination) {
      setDestination(externalDestination);
      setDebugInput(`${externalDestination.lat}, ${externalDestination.lng}`);
    }
  }, [externalDestination]);

  // ── Fetch route when both points are ready ───────────────────────────────
  useEffect(() => {
  if (
    userLocation &&
    destination &&
    locationPermitted &&
    mapReady
  ) {
    fetchRoute();
  }
}, [
  userLocation,
  destination,
  locationPermitted,
  mapReady,
  ]);

  const decodePolyline = (
  str: string,
  precision = 5
): [number, number][] => {
  let index = 0;
  let lat = 0;
  let lng = 0;

  const coordinates: [number, number][] = [];
  const factor = Math.pow(10, precision);

  while (index < str.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat =
      result & 1 ? ~(result >> 1) : result >> 1;

    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = str.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng =
      result & 1 ? ~(result >> 1) : result >> 1;

    lng += dlng;

    coordinates.push([
      lng / factor,
      lat / factor,
    ]);
  }

  return coordinates;
};
// end of decodePolyline
const fetchRoute = async () => {
  if (!userLocation) return;

  setLoadingRoute(true);
  setRouteInfo(null);

  try {
    const response = await MapplsGL.RestApi.direction({
      origin: `${userLocation.lng},${userLocation.lat}`,

      destination: `${destination.lng},${destination.lat}`,

      profile:
        MapplsGL.RestApi.DirectionsCriteria.PROFILE_DRIVING,

      resource:
        MapplsGL.RestApi.DirectionsCriteria.RESOURCE_ROUTE,

      overview:
        MapplsGL.RestApi.DirectionsCriteria.OVERVIEW_FULL,

      geometries:
        MapplsGL.RestApi.DirectionsCriteria.GEOMETRY_POLYLINE,

      steps: false,
    });

    console.log(
      "FULL DIRECTION RESPONSE:",
      JSON.stringify(response, null, 2)
    );

    // SDK response structure fix
    const route =
      response?.routes?.[0] ||
      response?.routes?.[0];

    if (!route) {
      throw new Error("No route returned");
    }

    // decode polyline
    const coords = decodePolyline(
      route.geometry,
      5
    );

    setRouteInfo({
      distanceKm: (
        route.distance / 1000
      ).toFixed(1),

      durationMin: Math.round(
        route.duration / 60
      ).toString(),

      coordinates: coords,
    });

    // fit map to route
    const lngs = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);

    cameraRef.current?.fitBounds(
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
      [80, 80, 80, 80],
      1000
    );

  } catch (err: any) {
    console.log("ROUTE ERROR:", err);

    Alert.alert(
      "Route Error",
      err?.message || "Failed to fetch route"
    );
  } finally {
    setLoadingRoute(false);
  }
};

  // ── Parse debug input and set destination ────────────────────────────────
  const applyDebugDestination = () => {
    const parts = debugInput.split(',').map(s => parseFloat(s.trim()));
    if (parts.length !== 2 || parts.some(isNaN)) {
      Alert.alert('Invalid input', 'Enter as: lat, lng   e.g. 13.0827, 80.2707');
      return;
    }
    setDestination({ lat: parts[0], lng: parts[1] });
  };

  // ── Re-center on user ────────────────────────────────────────────────────
  const recenter = () => {
    if (!userLocation) return;
    cameraRef.current?.setCamera({
      centerCoordinate: [userLocation.lng, userLocation.lat],
      zoomLevel: 14,
      animationDuration: 600,
    });
  };

  // ── GeoJSON route layer ──────────────────────────────────────────────────
  const routeGeoJSON: GeoJSON.Feature | null = routeInfo
    ? {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: routeInfo.coordinates },
        properties: {},
      }
    : null;
  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <SafeAreaView style={mapStyles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#1F2937" />

        {/* ── Header ── */}
        <View style={mapStyles.header}>
          <TouchableOpacity onPress={onClose} style={mapStyles.closeBtn} activeOpacity={0.8}>
            <Text style={mapStyles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={mapStyles.headerTitle}>Navigation</Text>
          <TouchableOpacity onPress={recenter} style={mapStyles.recenterBtn} activeOpacity={0.8}>
            <Text style={mapStyles.recenterIcon}>⊕</Text>
          </TouchableOpacity>
        </View>

        {/* ── DEV: Debug destination input ── */}
        {/* REMOVE this block in production; chatbot sets externalDestination instead */}
        {!externalDestination && (
          <View style={mapStyles.debugBar}>
            <Text style={mapStyles.debugLabel}>🛠 Dest (lat, lng):</Text>
            <TextInput
              style={mapStyles.debugInput}
              value={debugInput}
              onChangeText={setDebugInput}
              placeholder="13.0827, 80.2707"
              placeholderTextColor="#9CA3AF"
              keyboardType="numbers-and-punctuation"
              returnKeyType="go"
              onSubmitEditing={applyDebugDestination}
            />
            <TouchableOpacity style={mapStyles.goBtn} onPress={applyDebugDestination} activeOpacity={0.8}>
              <Text style={mapStyles.goBtnText}>Go</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* ── Map ── */}
        <View style={{ flex: 1 }}>
  {locationPermitted ? (
    <MapplsGL.MapView
      ref={mapRef}
      style={{ flex: 1 }}
              onDidFinishLoadingMap={() => {
                setMapReady(true)
                console.log('MapplsGL methods:', Object.keys(MapplsGL));
               }}
    >
      <MapplsGL.Camera
  ref={cameraRef}
  defaultSettings={{
    centerCoordinate: [
      CHENNAI_CENTER.lng,
      CHENNAI_CENTER.lat,
    ],
    zoomLevel: 10,
  }}
/>

{/* USER LOCATION */}
<MapplsGL.PointAnnotation
  id="start"
  coordinate={
    userLocation
      ? [
          userLocation.lng,
          userLocation.lat,
        ]
      : [
          CHENNAI_CENTER.lng,
          CHENNAI_CENTER.lat,
        ]
  }
>
  <View
    collapsable={false}
    style={{
      backgroundColor: userLocation
        ? '#2563EB'
        : '#9CA3AF',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
    }}
  >
    <Text
      style={{
        color: 'white',
        fontWeight: '700',
        fontSize: 11,
      }}
    >
      {userLocation
        ? 'START'
        : 'LOCATING...'}
    </Text>
  </View>
</MapplsGL.PointAnnotation>

{/* DESTINATION */}
<MapplsGL.PointAnnotation
  id="destination"
  coordinate={[
    destination.lng,
    destination.lat,
  ]}
>
  <View
    style={{
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#DC2626',
      borderWidth: 3,
      borderColor: '#FFFFFF',
    }}
  />
</MapplsGL.PointAnnotation>

{/* ROUTE LINE */}
{routeInfo && routeGeoJSON && (
  <MapplsGL.ShapeSource
    id="routeSource"
    shape={routeGeoJSON as any}
  >
    <MapplsGL.LineLayer
      id="routeLine"
      style={{
        lineColor: '#2563EB',
        lineWidth: 6,
        lineOpacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }}
    />
  </MapplsGL.ShapeSource>
)}
    </MapplsGL.MapView>
  ) : (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color="#4F46E5" />
      <Text style={{ color: '#6B7280', marginTop: 12 }}>Requesting location…</Text>
    </View>
  )}
</View>

        {/* ── Route Info Strip ── */}
        {routeInfo && (
          <View style={mapStyles.infoStrip}>
            <View style={mapStyles.infoCard}>
              <Text style={mapStyles.infoValue}>{routeInfo.distanceKm} km</Text>
              <Text style={mapStyles.infoLabel}>Distance</Text>
            </View>
            <View style={mapStyles.infoDivider} />
            <View style={mapStyles.infoCard}>
              <Text style={mapStyles.infoValue}>{routeInfo.durationMin} min</Text>
              <Text style={mapStyles.infoLabel}>ETA</Text>
            </View>
            <TouchableOpacity style={mapStyles.directionsBtn} onPress={fetchRoute} activeOpacity={0.85}>
              <Text style={mapStyles.directionsBtnText}>↺  Refresh</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* No-location state */}
        {!userLocation && !loadingRoute && (
          <View style={mapStyles.infoStrip}>
            <Text style={mapStyles.noLocText}>📡 Acquiring GPS location…</Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};
// GPS Location Panel ends

// Emergency Contacts Panel
const EmergencyContactsPanel = () => {
  const call = (phone: string) => Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  return (
    <View style={styles.contactsPanel}>
      <View style={styles.contactsHeader}>
        <Text style={styles.contactsHeaderIcon}>📞</Text>
        <Text style={styles.contactsHeaderTitle}>Emergency Contacts</Text>
      </View>
      {EMERGENCY_CONTACTS.map(c => (
        <View key={c.id} style={styles.contactRow}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{c.name}</Text>
            <Text style={styles.contactRole}>{c.role}</Text>
            <Text style={styles.contactPhone}>{c.phone}</Text>
          </View>
          <TouchableOpacity style={styles.callBtn} onPress={() => call(c.phone)} activeOpacity={0.85}>
            <Text style={styles.callBtnText}>Call</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

// SOS Button
const SOSButton = () => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    Linking.openURL('tel:112');
  };

  return (
    <View style={styles.sosSection}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity style={styles.sosBtn} onPress={onPress} activeOpacity={0.85}>
          <Text style={styles.sosBtnIcon}>📞</Text>
          <Text style={styles.sosBtnText}>SOS</Text>
        </TouchableOpacity>
      </Animated.View>
      <Text style={styles.sosSubText}>Press for immediate emergency assistance</Text>
    </View>
  );
};

// Emergency Services Grid
const EmergencyServicesGrid = () => {
  const call = (number: string) => Linking.openURL(`tel:${number}`);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Emergency Services</Text>
      <View style={styles.grid2}>
        {EMERGENCY_SERVICES.map(s => (
          <TouchableOpacity
            key={s.id}
            style={[styles.serviceBtn, { backgroundColor: s.color }]}
            onPress={() => call(s.number)}
            activeOpacity={0.85}
          >
            <Text style={styles.serviceBtnIcon}>{s.icon}</Text>
            <Text style={styles.serviceBtnLabel}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Utility Services
const UtilityServicesSection = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Utility Services</Text>
    <View style={styles.grid2}>
      {UTILITY_SERVICES.map(s => (
        <TouchableOpacity key={s.id} style={[styles.utilityBtn, { backgroundColor: s.color }]} activeOpacity={0.85}>
          <Text style={styles.utilityBtnIcon}>{s.icon}</Text>
          <Text style={styles.utilityBtnLabel}>{s.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// Bottom Nav Bar
const BottomNavBar = ({ active, onSelect }: { active: string; onSelect: (tab: string) => void }) => {
  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: '💬', color: '#16A34A' },
    { id: 'voice', label: 'Voice', icon: '🎙️', color: '#9333EA' },
    { id: 'profile', label: 'Profile', icon: '👤', color: '#4F46E5' },
  ];
  return (
    <View style={styles.navBar}>
      {tabs.map(t => (
        <TouchableOpacity
          key={t.id}
          style={[styles.navTab, { backgroundColor: t.color }, active === t.id && styles.navTabActive]}
          onPress={() => onSelect(t.id)}
          activeOpacity={0.85}
        >
          <Text style={styles.navTabIcon}>{t.icon}</Text>
          <Text style={styles.navTabLabel}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

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
        <UtilityServicesSection />

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Bottom Navigation */}
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  // Status bar
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center' },
  statusIcon: { fontSize: 13 },
  statusText: { fontSize: 12, color: '#374151', marginLeft: 3, fontWeight: '500' },
  statusTime: { fontSize: 11, color: '#6B7280' },

  scroll: { flex: 1 },
  scrollContent: { padding: 12, gap: 12 },

  // ── Chatbot ──
  chatPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    height: 320,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chatHeaderIcon: { fontSize: 16, marginRight: 6 },
  chatHeaderTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', flex: 1 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
  chatMessages: { flex: 1, paddingHorizontal: 10 },
  bubble: {
    maxWidth: '78%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 3,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 13, lineHeight: 18 },
  bubbleTextUser: { color: '#FFFFFF' },
  bubbleTextAI: { color: '#1F2937' },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#4F46E5',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: { color: '#FFFFFF', fontSize: 14 },

  // ── Top row (Location + Contacts) ──
  topRow: {
    flexDirection: 'row',
    gap: 10,
  },

  // Location
  locationPanel: {
    flex: 1,
    backgroundColor: '#DBEAFE',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 10,
  },
  locationIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  locationIcon: { fontSize: 22, color: '#FFFFFF' },
  locationTitle: { fontSize: 12, fontWeight: '700', color: '#1E3A5F', textAlign: 'center' },
  locationSub: { fontSize: 10, color: '#3B82F6', marginTop: 2, textAlign: 'center' },

  // Contacts
  contactsPanel: {
    flex: 1.3,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  contactsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  contactsHeaderIcon: { fontSize: 14, marginRight: 5 },
  contactsHeaderTitle: { fontSize: 12, fontWeight: '700', color: '#1F2937' },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 11, fontWeight: '700', color: '#111827' },
  contactRole: { fontSize: 10, color: '#6B7280' },
  contactPhone: { fontSize: 10, color: '#374151' },
  callBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 6,
  },
  callBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  // ── SOS ──
  sosSection: { alignItems: 'center', paddingVertical: 8 },
  sosBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  sosBtnIcon: { fontSize: 28 },
  sosBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2, marginTop: 2 },
  sosSubText: { marginTop: 8, fontSize: 12, color: '#6B7280', textAlign: 'center' },

  // ── Sections ──
  section: { 
    marginVertical: 4, 
  },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#111827',
    marginBottom: 8,
  },
  grid2: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    rowGap: 10,
  },

  // Emergency service buttons
  serviceBtn: {
    width: '48%', // Guarantees exactly 2 items per row with space in-between
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  serviceBtnIcon: { fontSize: 26, marginBottom: 6 },
  serviceBtnLabel: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  // Utility buttons
  utilityBtn: {
    width: '48%', // Guarantees exactly 2 items per row with space in-between
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  utilityBtnIcon: { fontSize: 24, marginBottom: 6 },
  utilityBtnLabel: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  // ── Bottom Nav ──
  navBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navTab: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTabActive: { opacity: 0.85 },
  navTabIcon: { fontSize: 18, marginBottom: 2 },
  navTabLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});

const mapStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1F2937',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#374151',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  headerTitle: {
    flex: 1, textAlign: 'center',
    color: '#FFFFFF', fontSize: 16, fontWeight: '700',
  },
  recenterBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    alignItems: 'center', justifyContent: 'center',
  },
  recenterIcon: { color: '#FFFFFF', fontSize: 20, lineHeight: 22 },

  // Debug bar
  debugBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    gap: 6,
  },
  debugLabel: { color: '#9CA3AF', fontSize: 11, fontWeight: '600' },
  debugInput: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#F9FAFB',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  goBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  goBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  // Markers
  destMarker: { alignItems: 'center', justifyContent: 'center' },
  destMarkerIcon: { fontSize: 30 },

  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: { color: '#4F46E5', fontWeight: '700', fontSize: 14 },

  // Route info strip
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  infoCard: { alignItems: 'center', flex: 1 },
  infoValue: { fontSize: 18, fontWeight: '800', color: '#111827' },
  infoLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  infoDivider: { width: 1, height: 36, backgroundColor: '#E5E7EB' },
  directionsBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  directionsBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  noLocText: { color: '#6B7280', fontSize: 13, flex: 1, textAlign: 'center' },
});