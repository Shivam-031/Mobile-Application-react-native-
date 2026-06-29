import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CarbonScoreRing from '../../../components/common/CarbonScoreRing';
import { COLORS, SPACING, RADIUS } from '../../../constants/theme';

const formatINR = (n) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(0)}K`;
  return `₹${n}`;
};

const StateHeader = ({ stateName, kpis, cityCount }) => {
  if (!kpis) return null;

  return (
    <LinearGradient
      colors={['#2F6B3F', '#1A4A2A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      <View style={styles.heroTop}>
        <View style={styles.heroTextBlock}>
          <Text style={styles.heroEyebrow}>State Dashboard</Text>
          <Text style={styles.heroName} numberOfLines={1}>📍 {stateName}</Text>
          <Text style={styles.heroSub} numberOfLines={1}>{cityCount} cities · live eco-analytics</Text>
        </View>
        <View style={styles.heroRing}>
          <CarbonScoreRing value={kpis.sustainabilityScore} max={100} size={72} label="score" />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kpiScroll}
      >
        <KpiTile emoji="💰" label="Revenue" value={formatINR(kpis.revenue)} accent="#FFD54F" />
        <KpiTile emoji="📦" label="Orders" value={kpis.orders.toLocaleString('en-IN')} accent="#80CBC4" />
        <KpiTile emoji="🌿" label="Eco Products" value={kpis.ecoProducts.toLocaleString('en-IN')} accent="#A5D6A7" />
        <KpiTile emoji="🌍" label="Carbon Saved" value={`${Math.round(kpis.carbonSaved)}t`} accent="#90CAF9" />
        <KpiTile emoji="🌳" label="Trees Planted" value={kpis.treesPlanted.toLocaleString('en-IN')} accent="#C5E1A5" />
        <KpiTile emoji="⭐" label="Sustainability" value={`${kpis.sustainabilityScore}/100`} accent="#FFAB91" />
      </ScrollView>
    </LinearGradient>
  );
};

const KpiTile = ({ emoji, label, value, accent }) => (
  <View style={styles.kpi}>
    <Text style={styles.kpiEmoji}>{emoji}</Text>
    <Text style={styles.kpiLabel}>{label}</Text>
    <Text style={[styles.kpiValue, { color: accent }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  hero: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  heroTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  heroRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEyebrow: {
    fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase', letterSpacing: 1,
  },
  heroName: {
    fontSize: 24, fontWeight: '900', color: '#fff', marginTop: 2,
  },
  heroSub: {
    fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2,
  },
  kpiScroll: { gap: SPACING.sm, paddingRight: SPACING.md, paddingBottom: 4 },
  kpi: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minWidth: 96,
    height: 76,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  kpiEmoji: { fontSize: 18, marginBottom: 4 },
  kpiLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiValue: { fontSize: 16, fontWeight: '900', marginTop: 2 },
});

export default StateHeader;