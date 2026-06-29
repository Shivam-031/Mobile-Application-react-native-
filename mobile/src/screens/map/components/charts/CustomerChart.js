import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../../../constants/theme';

const CHART_W = 320;
const CHART_H = 130;
const BAR_GAP = 6;

/**
 * CustomerChart — Customer insights:
 *  - 4 KPI tiles (New, Returning, Repeat rate, Growth)
 *  - Stacked-style bars (new vs returning) per month using plain <View>s.
 *    Pure-RN rendering — no chart library — so it can't crash at runtime.
 */
const CustomerChart = ({ analytics }) => {
  if (!analytics?.customerInsights) return null;
  const ci = analytics.customerInsights;
  const trend = ci.trend || [];

  const newRatio = ci.newCustomers / Math.max(ci.newCustomers + ci.returningCustomers, 1);
  const stacked = trend.map((p) => ({
    label: p.label,
    newVal: Math.max(1, Math.round(p.value * newRatio)),
    retVal: Math.max(1, Math.round(p.value * (1 - newRatio))),
    total: p.value,
  }));

  const maxTotal = Math.max(...stacked.map((s) => s.total), 1);
  const innerW = CHART_W - SPACING.md * 2;
  const barW = (innerW - BAR_GAP * (stacked.length - 1)) / stacked.length;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>👥 Customer Insights</Text>

      <View style={styles.tileRow}>
        <View style={styles.tile}>
          <Text style={styles.tileEmoji}>🆕</Text>
          <Text style={styles.tileValue}>{ci.newCustomers.toLocaleString('en-IN')}</Text>
          <Text style={styles.tileLabel}>New</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileEmoji}>🔁</Text>
          <Text style={styles.tileValue}>{ci.returningCustomers.toLocaleString('en-IN')}</Text>
          <Text style={styles.tileLabel}>Returning</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileEmoji}>📈</Text>
          <Text style={styles.tileValue}>{ci.repeatRate}%</Text>
          <Text style={styles.tileLabel}>Repeat rate</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileEmoji}>🚀</Text>
          <Text style={[styles.tileValue, { color: COLORS.success }]}>+{ci.growthPct}%</Text>
          <Text style={styles.tileLabel}>Growth</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>Customer mix over time</Text>

      <View style={[styles.chartWrap, { height: CHART_H }]}>
        <View style={styles.barsRow}>
          {stacked.map((s, i) => {
            const heightPct = Math.max(2, (s.total / maxTotal) * 100);
            const newPct = (s.newVal / s.total) * 100;
            const retPct = 100 - newPct;
            return (
              <View key={s.label + i} style={[styles.barCol, { width: barW, marginRight: i === stacked.length - 1 ? 0 : BAR_GAP }]}>
                <View style={[styles.barInner, { height: `${heightPct}%` }]}>
                  <View style={[styles.barSeg, { backgroundColor: COLORS.secondary, height: `${retPct}%` }]} />
                  <View style={[styles.barSeg, { backgroundColor: COLORS.primary, height: `${newPct}%` }]} />
                </View>
                <Text style={styles.barLabel} numberOfLines={1}>{s.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.secondary }]} />
          <Text style={styles.legendText}>Returning</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>New</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary },
  subtitle: { fontSize: 11, color: COLORS.text.secondary, fontWeight: '600', marginTop: SPACING.md, marginBottom: SPACING.xs },
  tileRow: { flexDirection: 'row', gap: SPACING.xs, marginTop: SPACING.sm },
  tile: {
    flex: 1, backgroundColor: `${COLORS.primary}08`,
    borderRadius: RADIUS.md, paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  tileEmoji: { fontSize: 16 },
  tileValue: { fontSize: 14, fontWeight: '800', color: COLORS.primary, marginTop: 2 },
  tileLabel: { fontSize: 9, color: COLORS.text.muted, marginTop: 1, fontWeight: '600' },
  chartWrap: {
    paddingHorizontal: 0,
    paddingTop: SPACING.xs,
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barCol: {
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barInner: {
    width: '80%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barSeg: {
    width: '100%',
  },
  barLabel: { fontSize: 9, color: COLORS.text.muted, marginTop: 4, fontWeight: '600' },
  legendRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: COLORS.text.secondary, fontWeight: '600' },
});

export default CustomerChart;