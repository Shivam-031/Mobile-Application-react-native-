import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CarbonScoreRing from '../../../components/common/CarbonScoreRing';
import { COLORS, SPACING, RADIUS } from '../../../constants/theme';

const formatINR = (n) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${n}`;
};

const Tier = ({ score }) => {
  const cfg = score >= 85 ? { l: 'Platinum', c: '#7E57C2' }
    : score >= 70 ? { l: 'Gold', c: '#FFB300' }
    : score >= 55 ? { l: 'Silver', c: '#90A4AE' }
    : { l: 'Bronze', c: '#A1887F' };
  return (
    <View style={[styles.tierPill, { backgroundColor: `${cfg.c}22`, borderColor: `${cfg.c}55` }]}>
      <Text style={[styles.tierText, { color: cfg.c }]}>⭐ {cfg.l} · {score}/100</Text>
    </View>
  );
};

/**
 * CityDetailModal — Bottom-sheet modal showing full city stats + a small
 * synthetic sales bar chart so each city feels data-rich without a real API.
 */
const CityDetailModal = ({ city, visible, onClose, onShop }) => {
  if (!city) return null;

  // Synthetic 7-day sales distribution seeded by revenue — keeps the chart
  // stable for the same city and proportional to its size.
  const seed = city.revenue % 7;
  const salesByDay = Array.from({ length: 7 }, (_, i) => {
    const v = (city.revenue / 7) * (0.7 + ((i + seed) % 5) * 0.08);
    return Math.round(v);
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTap} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
          <LinearGradient
            colors={['#2F6B3F', '#1A4A2A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.heroEyebrow}>City Analytics</Text>
              <Text style={styles.heroName} numberOfLines={1}>🏙️ {city.name}</Text>
              <Text style={styles.heroSub} numberOfLines={1}>{city.district} · Updated {city.lastUpdated}</Text>
            </View>
            <CarbonScoreRing value={city.sustainabilityScore} max={100} size={64} label="score" />
          </LinearGradient>

          <View style={styles.tierRow}>
            <Tier score={city.sustainabilityScore} />
            <View style={[styles.growthPill, {
              backgroundColor: city.growthPct >= 0 ? `${COLORS.success}18` : `${COLORS.error}18`,
            }]}>
              <Text style={[styles.growthText, {
                color: city.growthPct >= 0 ? COLORS.success : COLORS.error,
              }]}>
                {city.growthPct >= 0 ? '▲' : '▼'} {Math.abs(city.growthPct)}% growth
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatBox label="Revenue" value={formatINR(city.revenue)} emoji="💰" />
            <StatBox label="Orders" value={city.orders.toLocaleString('en-IN')} emoji="📦" />
            <StatBox label="Eco Products" value={city.ecoProducts.toLocaleString('en-IN')} emoji="🌿" />
            <StatBox label="Carbon Saved" value={`${city.carbonSaved.toFixed(1)} t`} emoji="🌍" />
            <StatBox label="Trees Planted" value={city.treesPlanted.toLocaleString('en-IN')} emoji="🌳" />
            <StatBox label="Active Customers" value={city.activeCustomers.toLocaleString('en-IN')} emoji="👥" />
            <StatBox label="Branches" value={city.branches.toString()} emoji="🏬" />
            <StatBox label="Score" value={`${city.sustainabilityScore}/100`} emoji="⭐" />
          </View>

          <Text style={styles.sectionTitle}>📊 7-day sales distribution</Text>
          <MiniBars data={salesByDay} />
        </ScrollView>

        {/* Sticky footer — always visible above the home indicator */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.actionBtn, styles.shopBtn]} onPress={() => onShop?.(city)}>
            <Text style={styles.shopBtnTxt}>🛒 Shop from {city.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.closeBtn]} onPress={onClose}>
            <Text style={styles.closeBtnTxt}>Close</Text>
          </TouchableOpacity>
        </View>
        </View>
      </View>
    </Modal>
  );
};

const StatBox = ({ label, value, emoji }) => (
  <View style={styles.statBox}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/**
 * MiniBars — Tiny bar chart built with plain <View>s. Stable across RN
 * versions; doesn't depend on any chart library.
 */
const MiniBars = ({ data }) => {
  const max = Math.max(...data, 1);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <View style={miniStyles.wrap}>
      <View style={miniStyles.row}>
        {data.map((v, i) => {
          const heightPct = Math.max(4, (v / max) * 100);
          return (
            <View key={i} style={miniStyles.col}>
              <View style={[miniStyles.bar, { height: `${heightPct}%` }]} />
              <Text style={miniStyles.label}>{days[i] || ''}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const miniStyles = StyleSheet.create({
  wrap: {
    height: 140, marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  col: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  label: { fontSize: 9, color: COLORS.text.muted, marginTop: 4, fontWeight: '700' },
});

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  backdropTap: { flex: 1 },
  sheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '90%',
  },
  scroll: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  handle: {
    alignSelf: 'center', width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border, marginTop: SPACING.sm, marginBottom: SPACING.sm,
  },
  hero: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: RADIUS.lg, padding: SPACING.md,
    marginVertical: SPACING.md,
    gap: SPACING.sm,
  },
  heroEyebrow: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 },
  heroName: { fontSize: 22, fontWeight: '900', color: '#fff', marginTop: 2 },
  heroSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  tierRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md, flexWrap: 'wrap' },
  tierPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full, borderWidth: 1 },
  tierText: { fontSize: 11, fontWeight: '800' },
  growthPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full },
  growthText: { fontSize: 11, fontWeight: '800' },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md,
  },
  statBox: {
    width: '47.5%', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  statEmoji: { fontSize: 18 },
  statValue: { fontSize: 16, fontWeight: '900', color: COLORS.text.primary, marginTop: 4 },
  statLabel: { fontSize: 10, color: COLORS.text.muted, marginTop: 2, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text.secondary, marginTop: SPACING.sm },
  footer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: { flex: 1, paddingVertical: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center' },
  shopBtn: { backgroundColor: COLORS.primary },
  shopBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  closeBtn: { backgroundColor: `${COLORS.primary}15` },
  closeBtnTxt: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },
});

export default CityDetailModal;