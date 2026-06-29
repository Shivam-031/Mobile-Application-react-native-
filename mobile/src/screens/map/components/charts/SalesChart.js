import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS, SPACING, RADIUS } from '../../../../constants/theme';

const TABS = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'daily', label: 'Daily' },
];

const formatINR = (n) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${n}`;
};

const CHART_W = 320;
const CHART_H = 160;
const PADDING = { top: 16, right: 12, bottom: 24, left: 12 };

/**
 * SalesChart — Custom SVG line chart. Avoids react-native-svg-charts (which
 * has d3 v1/v3 compatibility quirks on RN 0.73) — we draw the line ourselves
 * from a list of {label, value} points.
 */
const SalesChart = ({ analytics }) => {
  const [tab, setTab] = useState('monthly');

  if (!analytics) return null;
  const data = analytics[tab] || [];
  const total = data.reduce((s, p) => s + p.value, 0);

  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const innerW = CHART_W - PADDING.left - PADDING.right;
  const innerH = CHART_H - PADDING.top - PADDING.bottom;

  const points = data.map((d, i) => {
    const x = PADDING.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = PADDING.top + innerH - ((d.value - min) / range) * innerH;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath = linePath
    ? `${linePath} L ${points[points.length - 1].x} ${PADDING.top + innerH} L ${points[0].x} ${PADDING.top + innerH} Z`
    : '';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>💹 Sales Overview</Text>
        <Text style={styles.subtitle}>{formatINR(total)} this period</Text>
      </View>

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setTab(t.id)}
            style={[styles.tab, tab === t.id && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartWrap}>
        <Svg width={CHART_W} height={CHART_H}>
          {areaPath ? (
            <Path d={areaPath} fill={`${COLORS.primary}18`} />
          ) : null}
          {points.length > 0 ? (
            <Path
              d={linePath}
              stroke={COLORS.primary}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
          {points.map((p, i) => (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3}
              fill="#fff"
              stroke={COLORS.primary}
              strokeWidth={2}
            />
          ))}
        </Svg>
        <View style={styles.xAxis}>
          {data.map((d, i) => (
            <Text
              key={d.label + i}
              style={styles.xAxisLabel}
              numberOfLines={1}
            >
              {d.label}
            </Text>
          ))}
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
  header: { marginBottom: SPACING.sm },
  title: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary },
  subtitle: { fontSize: 12, color: COLORS.text.secondary, marginTop: 2 },
  tabs: { flexDirection: 'row', gap: 6, marginVertical: SPACING.sm },
  tab: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: RADIUS.full,
    backgroundColor: `${COLORS.primary}10`,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 11, fontWeight: '700', color: COLORS.text.secondary },
  tabTextActive: { color: '#fff' },
  chartWrap: { marginTop: SPACING.xs, alignItems: 'center' },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: CHART_W,
    marginTop: 2,
    paddingHorizontal: PADDING.left,
  },
  xAxisLabel: { fontSize: 9, color: COLORS.text.muted, fontWeight: '600', maxWidth: 30 },
});

export default SalesChart;
