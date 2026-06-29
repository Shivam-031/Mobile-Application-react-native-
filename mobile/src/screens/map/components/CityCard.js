import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../../constants/theme';

const formatINR = (n) => {
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${n}`;
};

const tier = (score) => {
  if (score >= 85) return { label: 'Platinum', color: '#7E57C2' };
  if (score >= 70) return { label: 'Gold', color: '#FFB300' };
  if (score >= 55) return { label: 'Silver', color: '#90A4AE' };
  return { label: 'Bronze', color: '#A1887F' };
};

/**
 * CityCard — Rich, premium city row. Tap → opens detail modal.
 */
const CityCard = ({ city, rank, onPress }) => {
  if (!city) return null;
  const t = tier(city.sustainabilityScore);
  const positive = city.growthPct >= 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress?.(city)}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{rank ? `${rank}. ` : ''}{city.name}</Text>
          <Text style={styles.district}>📍 {city.district}</Text>
        </View>
        <View style={[styles.tierPill, { backgroundColor: `${t.color}22`, borderColor: `${t.color}55` }]}>
          <Text style={[styles.tierText, { color: t.color }]}>⭐ {t.label}</Text>
        </View>
      </View>

      <View style={styles.statGrid}>
        <Stat label="Revenue" value={formatINR(city.revenue)} emoji="💰" />
        <Stat label="Orders" value={city.orders.toLocaleString('en-IN')} emoji="📦" />
        <Stat label="Eco" value={city.ecoProducts.toLocaleString('en-IN')} emoji="🌿" />
        <Stat label="CO₂" value={`${city.carbonSaved.toFixed(1)}t`} emoji="🌍" />
        <Stat label="Trees" value={city.treesPlanted.toLocaleString('en-IN')} emoji="🌳" />
        <Stat label="Customers" value={city.activeCustomers.toLocaleString('en-IN')} emoji="👥" />
      </View>

      <View style={styles.footerRow}>
        <View style={styles.meta}>
          <Text style={styles.metaEmoji}>🏬</Text>
          <Text style={styles.metaText}>
            {city.branches} branch{city.branches === 1 ? '' : 'es'}
          </Text>
        </View>
        <View style={[styles.growthPill, { backgroundColor: positive ? `${COLORS.success}15` : `${COLORS.error}15` }]}>
          <Text style={[styles.growthText, { color: positive ? COLORS.success : COLORS.error }]}>
            {positive ? '▲' : '▼'} {Math.abs(city.growthPct)}%
          </Text>
        </View>
        <Text style={styles.updated}>Updated {city.lastUpdated}</Text>
      </View>
    </TouchableOpacity>
  );
};

const Stat = ({ label, value, emoji }) => (
  <View style={styles.stat}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  name: { fontSize: 16, fontWeight: '800', color: COLORS.text.primary },
  district: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
  tierPill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1,
  },
  tierText: { fontSize: 10, fontWeight: '800' },
  statGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
  },
  stat: {
    width: '31.5%',
    backgroundColor: `${COLORS.primary}08`,
    borderRadius: RADIUS.sm,
    paddingVertical: 8, paddingHorizontal: 8,
    alignItems: 'flex-start',
  },
  statEmoji: { fontSize: 12 },
  statValue: { fontSize: 13, fontWeight: '800', color: COLORS.text.primary, marginTop: 2 },
  statLabel: { fontSize: 9, color: COLORS.text.muted, marginTop: 1, fontWeight: '600' },
  footerRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm,
    gap: SPACING.sm, flexWrap: 'wrap',
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaEmoji: { fontSize: 12 },
  metaText: { fontSize: 11, color: COLORS.text.secondary, fontWeight: '600' },
  growthPill: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full,
  },
  growthText: { fontSize: 11, fontWeight: '800' },
  updated: { fontSize: 9, color: COLORS.text.muted, marginLeft: 'auto' },
});

export default CityCard;