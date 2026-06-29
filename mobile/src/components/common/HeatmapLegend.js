import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

/**
 * Color scale: light to dark green, 5 stops.
 * Light green (low value) -> dark green (high value).
 */
export const GREEN_SCALE = [
  '#E8F5E9',
  '#C8E6C9',
  '#81C784',
  '#4CAF50',
  '#1B5E20',
];

/**
 * Map a normalized 0..1 value to a color from the GREEN_SCALE.
 * Interpolates between adjacent stops for smooth gradients.
 */
export function colorForValue(t, scale = GREEN_SCALE) {
  const clamped = Math.max(0, Math.min(1, t));
  if (clamped <= 0) return scale[0];
  if (clamped >= 1) return scale[scale.length - 1];
  const seg = clamped * (scale.length - 1);
  const i = Math.floor(seg);
  const f = seg - i;
  return mixHex(scale[i], scale[i + 1], f);
}

function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ra = (pa >> 16) & 0xff, ga = (pa >> 8) & 0xff, ba = pa & 0xff;
  const rb = (pb >> 16) & 0xff, gb = (pb >> 8) & 0xff, bb = pb & 0xff;
  const r = Math.round(ra + (rb - ra) * t);
  const g = Math.round(ga + (gb - ga) * t);
  const bl = Math.round(ba + (bb - ba) * t);
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}`;
}

/**
 * Compact legend: a horizontal gradient bar with min/max labels and a title.
 */
const HeatmapLegend = ({ title = 'Carbon Saved (kg)', min, max, compact = false }) => (
  <View style={[styles.wrap, compact && styles.wrapCompact]}>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.row}>
      <Text style={styles.val}>{min.toLocaleString()}</Text>
      <Svg width={140} height={10} style={styles.bar}>
        <Defs>
          <LinearGradient id="greenRamp" x1="0" y1="0" x2="1" y2="0">
            {GREEN_SCALE.map((c, i) => (
              <Stop key={c} offset={`${(i / (GREEN_SCALE.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="140" height="10" rx="5" ry="5" fill="url(#greenRamp)" />
      </Svg>
      <Text style={styles.val}>{max.toLocaleString()}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  wrapCompact: { paddingVertical: 6, paddingHorizontal: 10 },
  title: { fontSize: 11, fontWeight: '700', color: COLORS.text.secondary, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bar: { borderRadius: 5 },
  val: { fontSize: 10, fontWeight: '700', color: COLORS.text.muted, minWidth: 36, textAlign: 'center' },
});

export default HeatmapLegend;