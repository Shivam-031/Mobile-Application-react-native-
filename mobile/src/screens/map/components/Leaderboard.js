import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../../constants/theme';

const TABS = [
  { id: 'byRevenue', label: 'Revenue', emoji: '💰', accessor: (c) => c.revenue, suffix: '' },
  { id: 'byOrders', label: 'Orders', emoji: '📦', accessor: (c) => c.orders, suffix: '' },
  { id: 'byCarbon', label: 'Carbon', emoji: '🌍', accessor: (c) => c.carbonSaved, suffix: 't', decimals: 1 },
  { id: 'byTrees', label: 'Trees', emoji: '🌳', accessor: (c) => c.treesPlanted, suffix: '' },
  { id: 'byGrowth', label: 'Growth', emoji: '📈', accessor: (c) => c.growthPct, suffix: '%' },
  { id: 'bySustainability', label: 'Eco Score', emoji: '⭐', accessor: (c) => c.sustainabilityScore, suffix: '' },
];

const fmt = (n, decimals = 0) => {
  if (n === null || n === undefined) return '—';
  if (decimals) return n.toFixed(decimals);
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)}L`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString('en-IN');
};

/**
 * Leaderboard — Top-5 city ranking across 6 dimensions. Uses a chip-row
 * tab switcher (no extra deps) and renders medal-styled rows for ranks 1-3.
 */
const Leaderboard = ({ leaderboard }) => {
  const [tab, setTab] = useState('byRevenue');
  if (!leaderboard) return null;

  const current = TABS.find((t) => t.id === tab);
  const rows = leaderboard[tab] || [];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>🏅 City Leaderboard</Text>
        <Text style={styles.subtitle}>Top 5 by {current.label}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tab, tab === t.id && styles.tabActive]}
            onPress={() => setTab(t.id)}
          >
            <Text style={styles.tabEmoji}>{t.emoji}</Text>
            <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {rows.length === 0 && (
        <Text style={styles.empty}>No data available</Text>
      )}

      {rows.map((c, i) => {
        const rank = i + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
        const value = current.accessor(c);
        return (
          <View key={c.id} style={styles.row}>
            <Text style={styles.rank}>{medal}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cityName}>{c.name}</Text>
              <Text style={styles.cityDistrict}>{c.district}</Text>
            </View>
            <View style={styles.valueWrap}>
              <Text style={styles.value}>{fmt(value, current.decimals)}{current.suffix}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headerRow: { marginBottom: SPACING.sm },
  title: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary },
  subtitle: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
  tabs: { gap: 6, paddingBottom: SPACING.sm },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full, backgroundColor: `${COLORS.primary}10`,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabEmoji: { fontSize: 11 },
  tabLabel: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  tabLabelActive: { color: '#fff' },
  empty: { textAlign: 'center', color: COLORS.text.muted, paddingVertical: SPACING.md, fontSize: 12 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    gap: SPACING.sm,
  },
  rank: { fontSize: 18, width: 36, textAlign: 'center' },
  cityName: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  cityDistrict: { fontSize: 10, color: COLORS.text.muted, marginTop: 1 },
  valueWrap: {
    backgroundColor: `${COLORS.primary}10`,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  value: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
});

export default Leaderboard;
