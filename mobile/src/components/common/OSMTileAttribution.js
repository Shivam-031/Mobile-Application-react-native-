/**
 * OSM tile attribution overlay.
 *
 * Required when using the public OpenStreetMap raster tile servers per
 * https://operations.osmfoundation.org/policies/tiles/ — derived databases
 * must display "© OpenStreetMap contributors".
 *
 * Render this on any map that loads OSM_RASTER_STYLE and disable the default
 * MapLibre logo (`logoEnabled={false}` on <MapView />) for a cleaner look.
 */
import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/theme';

const OSMTileAttribution = () => (
  <View style={styles.container} pointerEvents="box-none">
    <TouchableOpacity
      style={styles.badge}
      onPress={() => Linking.openURL('https://www.openstreetmap.org/copyright')}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>© OpenStreetMap contributors</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  text: {
    fontSize: 10,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
});

export default OSMTileAttribution;