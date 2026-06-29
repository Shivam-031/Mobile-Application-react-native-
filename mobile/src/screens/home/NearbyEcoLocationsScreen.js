import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Platform,
} from 'react-native';
import {
  MapView, Camera, MarkerView, ShapeSource, CircleLayer,
  OSM_STYLE_URL, deltaToZoom,
} from '../../components/common/MapLibreMap';
import OSMTileAttribution from '../../components/common/OSMTileAttribution';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

// Request location permission and get coords
const getLocation = () => new Promise((resolve, reject) => {
  if (Platform.OS === 'android') {
    const { PermissionsAndroid } = require('react-native');
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
      .then((granted) => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          require('@react-native-community/geolocation').getCurrentPosition(
            (pos) => resolve(pos.coords),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
          );
        } else reject(new Error('Permission denied'));
      });
  } else {
    require('@react-native-community/geolocation').getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }
});

// Mock eco locations near any user (relative offsets from user position)
const generateNearbyLocations = (lat, lng) => [
  { id: '1', name: 'Green Yatra Store', type: 'store', emoji: '🏪', lat: lat + 0.01, lng: lng + 0.008, distance: '1.2 km', rating: 4.8, address: 'Near City Center', open: true },
  { id: '2', name: 'Neem Plantation Zone', type: 'plant', emoji: '🌳', lat: lat - 0.008, lng: lng + 0.015, distance: '2.0 km', rating: null, address: 'Urban Forest Area', open: true },
  { id: '3', name: 'Recycling Centre', type: 'recycle', emoji: '♻️', lat: lat + 0.02, lng: lng - 0.01, distance: '2.4 km', rating: 4.2, address: 'Municipal Corporation', open: true },
  { id: '4', name: 'Solar Energy Hub', type: 'energy', emoji: '☀️', lat: lat - 0.015, lng: lng - 0.012, distance: '3.1 km', rating: 4.5, address: 'Industrial Area', open: false },
  { id: '5', name: 'Organic Farmers Market', type: 'market', emoji: '🥬', lat: lat + 0.025, lng: lng + 0.02, distance: '3.8 km', rating: 4.7, address: 'Weekend Market Square', open: true },
  { id: '6', name: 'Community Garden', type: 'plant', emoji: '🌻', lat: lat - 0.03, lng: lng + 0.025, distance: '4.2 km', rating: 4.6, address: 'Residents Park', open: true },
  { id: '7', name: 'EV Charging Station', type: 'energy', emoji: '⚡', lat: lat + 0.03, lng: lng - 0.022, distance: '4.5 km', rating: 4.0, address: 'Mall Parking', open: true },
  { id: '8', name: 'Vermicompost Centre', type: 'recycle', emoji: '🌱', lat: lat - 0.035, lng: lng - 0.018, distance: '5.0 km', rating: 4.3, address: 'Agricultural College', open: false },
];

const TYPE_FILTERS = [
  { id: 'all', label: 'All', emoji: '🌿' },
  { id: 'store', label: 'Stores', emoji: '🏪' },
  { id: 'plant', label: 'Green Zones', emoji: '🌳' },
  { id: 'recycle', label: 'Recycling', emoji: '♻️' },
  { id: 'energy', label: 'Energy', emoji: '☀️' },
  { id: 'market', label: 'Markets', emoji: '🥬' },
];

const TYPE_COLORS = { store: '#2F6B3F', plant: '#4CAF50', recycle: '#2196F3', energy: '#FF9800', market: '#9C27B0' };

// MapLibre note: react-native-maps <Circle radius={5000}> rendered a geodesic
// 5 km circle. MapLibre's <CircleLayer> uses screen-pixel radii — we
// approximate 5 km with a zoom-aware interpolate expression so the radius
// scales naturally with the map zoom level (≈ 60 px at zoom 10, ≈ 80 px at zoom 14).
const radiusCircleGeoJSON = (center) => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [center.longitude, center.latitude] },
    },
  ],
});

const NearbyEcoLocationsScreen = ({ navigation }) => {
  const [location, setLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    setLoading(true);
    try {
      const coords = await getLocation();
      setLocation(coords);
      setLocations(generateNearbyLocations(coords.latitude, coords.longitude));
    } catch (err) {
      // Default to Delhi if permission denied
      const defaultCoords = { latitude: 28.6139, longitude: 77.2090 };
      setLocation(defaultCoords);
      setLocations(generateNearbyLocations(defaultCoords.latitude, defaultCoords.longitude));
      Alert.alert('Location', 'Using default location. Enable GPS for accurate results.');
    } finally { setLoading(false); }
  };

  const filtered = locations.filter((l) => filter === 'all' || l.type === filter);

  // react-native-maps used {latitude, longitude} objects with animateToRegion;
  // MapLibre uses [longitude, latitude] arrays with setCamera.
  const focusLocation = (loc) => {
    setSelected(loc);
    cameraRef.current?.setCamera({
      centerCoordinate: [loc.lng, loc.lat],
      zoomLevel: deltaToZoom(0.01),
      animationDuration: 600,
      animationMode: 'flyTo',
    });
  };

  // Build the 5 km radius circle GeoJSON only when we have a user location.
  const userCircleGeoJSON = useMemo(
    () => (location ? radiusCircleGeoJSON(location) : null),
    [location],
  );

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Finding eco locations near you... 📍</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📍 Nearby Eco Locations</Text>
        <TouchableOpacity onPress={loadLocation} style={styles.refreshBtn}>
          <Text style={{ fontSize: 18 }}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {TYPE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={[styles.filterChipText, filter === f.id && { color: '#fff' }]}>
              {f.emoji} {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map */}
      {location && (
        <MapView
          style={styles.map}
          styleURL={OSM_STYLE_URL}
          logoEnabled={false}
          attributionEnabled={false}
        >
          <Camera
            ref={cameraRef}
            zoomLevel={deltaToZoom(0.08)}
            centerCoordinate={[location.longitude, location.latitude]}
          />

          {/* 5 km radius circle around user */}
          {userCircleGeoJSON && (
            <ShapeSource id="user-radius" shape={userCircleGeoJSON}>
              <CircleLayer
                id="user-radius-fill"
                style={{
                  circleRadius: [
                    'interpolate', ['exponential', 2], ['zoom'],
                    10, 60,
                    14, 80,
                  ],
                  circleColor: `${COLORS.primary}14`,
                  circleStrokeColor: `${COLORS.primary}4D`,
                  circleStrokeWidth: 1.5,
                }}
              />
            </ShapeSource>
          )}

          {/* User location pin */}
          <MarkerView coordinate={[location.longitude, location.latitude]}>
            <View style={styles.userMarker}><Text style={{ fontSize: 20 }}>📍</Text></View>
          </MarkerView>

          {/* Eco locations */}
          {filtered.map((loc) => (
            <MarkerView
              key={loc.id}
              coordinate={[loc.lng, loc.lat]}
              onPress={() => focusLocation(loc)}
            >
              <View style={[styles.ecoMarker, { backgroundColor: TYPE_COLORS[loc.type] || COLORS.primary }]}>
                <Text style={{ fontSize: 16 }}>{loc.emoji}</Text>
              </View>
            </MarkerView>
          ))}
        </MapView>
      )}

      <OSMTileAttribution />

      {/* Location List */}
      <View style={styles.listPanel}>
        <Text style={styles.listTitle}>{filtered.length} eco locations within 5 km</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: SPACING.sm, paddingRight: SPACING.md }}>
          {filtered.map((loc) => (
            <TouchableOpacity
              key={loc.id}
              style={[styles.locationCard, selected?.id === loc.id && styles.locationCardActive]}
              onPress={() => focusLocation(loc)}
            >
              <View style={[styles.locationIconBg, { backgroundColor: `${TYPE_COLORS[loc.type]}15` }]}>
                <Text style={{ fontSize: 24 }}>{loc.emoji}</Text>
              </View>
              <Text style={styles.locationName} numberOfLines={1}>{loc.name}</Text>
              <Text style={styles.locationDist}>{loc.distance} away</Text>
              {loc.rating && <Text style={styles.locationRating}>⭐ {loc.rating}</Text>}
              <View style={[styles.openBadge, { backgroundColor: loc.open ? '#E8F5E9' : '#FFEBEE' }]}>
                <Text style={[styles.openText, { color: loc.open ? '#4CAF50' : '#F44336' }]}>
                  {loc.open ? 'Open' : 'Closed'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { color: COLORS.text.secondary, fontSize: 14 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 24, color: COLORS.primary, fontWeight: '700' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary },
  refreshBtn: { padding: 8 },
  filterRow: { paddingHorizontal: SPACING.md, gap: 8, paddingBottom: SPACING.sm },
  filterChip: { backgroundColor: COLORS.surface, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 8, ...SHADOWS.card },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text.secondary },
  map: { flex: 1 },
  userMarker: {
    backgroundColor: '#fff', borderRadius: 20, padding: 6,
    borderWidth: 2, borderColor: COLORS.primary, ...SHADOWS.card,
  },
  ecoMarker: {
    borderRadius: 20, padding: 6, borderWidth: 2, borderColor: '#fff', ...SHADOWS.card,
  },
  listPanel: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.md, paddingBottom: 30, ...SHADOWS.card,
  },
  listTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text.secondary, marginBottom: SPACING.sm },
  locationCard: {
    width: 140, backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md,
    padding: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.border,
  },
  locationCardActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}08` },
  locationIconBg: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm },
  locationName: { fontSize: 12, fontWeight: '700', color: COLORS.text.primary },
  locationDist: { fontSize: 11, color: COLORS.primary, marginTop: 2, fontWeight: '600' },
  locationRating: { fontSize: 11, color: COLORS.text.secondary, marginTop: 2 },
  openBadge: { borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 2, marginTop: SPACING.sm, alignSelf: 'flex-start' },
  openText: { fontSize: 10, fontWeight: '700' },
});

export default NearbyEcoLocationsScreen;