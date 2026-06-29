import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import CarbonScoreRing from '../../../../components/common/CarbonScoreRing';
import { COLORS, SPACING, RADIUS } from '../../../../constants/theme';

const CHART_W = 320;
const CHART_H = 80;
const PADDING = { top: 10, right: 8, bottom: 18, left: 8 };

/** Build a polyline path string for a series of {x, y} points. */
function toLinePath(points) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
}

/** Build a smooth-ish line via catmull-rom-to-bezier approximation (avg method). */
function toSmoothPath(points) {
  if (points.length < 2) return toLinePath(points);
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * CarbonChart — Sustainability impact:
 *  - Hero score ring (overall sustainabilityScore)
 *  - Two stat tiles (total carbon, total trees)
 *  - Dual-line trend (carbon saved + trees planted, normalized to chart bounds)
 */
const CarbonChart = ({ kpis, analytics }) => {
  if (!kpis || !analytics) return null;
  const trend = analytics.carbonTrend || [];

  const maxCarbon = Math.max(...trend.map((t) => t.carbon), 1);
  const maxTrees = Math.max(...trend.map((t) => t.trees), 1);
  const innerW = CHART_W - PADDING.left - PADDING.right;
  const innerH = CHART_H - PADDING.top - PADDING.bottom;

  const carbonPoints = trend.map((t, i) => ({
    x: PADDING.left + (trend.length === 1 ? innerW / 2 : (i / (trend.length - 1)) * innerW),
    y: PADDING.top + innerH - (t.carbon / maxCarbon) * innerH,
  }));
  const treesPoints = trend.map((t, i) => ({
    x: PADDING.left + (trend.length === 1 ? innerW / 2 : (i / (trend.length - 1)) * innerW),
    y: PADDING.top + innerH - (t.trees / maxTrees) * innerH,
  }));

  const carbonPath = toSmoothPath(carbonPoints);
  const treesPath = toSmoothPath(treesPoints);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🌍 Environmental Impact</Text>

      <View style={styles.heroRow}>
        <View style={styles.scoreWrap}>
          <CarbonScoreRing value={kpis.sustainabilityScore} max={100} size={88} label="score" />
          <Text style={styles.scoreLabel}>Sustainability</Text>
        </View>
        <View style={styles.statTiles}>
          <View style={styles.tile}>
            <Text style={styles.tileEmoji}>🌿</Text>
            <Text style={styles.tileValue}>{Math.round(kpis.carbonSaved)}</Text>
            <Text style={styles.tileLabel}>tons CO₂ saved</Text>
          </View>
          <View style={styles.tile}>
            <Text style={styles.tileEmoji}>🌳</Text>
            <Text style={styles.tileValue}>{kpis.treesPlanted}</Text>
            <Text style={styles.tileLabel}>trees planted</Text>
          </View>
        </View>
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Carbon (tons)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Trees planted</Text>
        </View>
      </View>

      <View style={styles.chartWrap}>
        <Svg width={CHART_W} height={CHART_H}>
          {carbonPoints.map((p, i) => (
            <Circle key={`c${i}`} cx={p.x} cy={p.y} r={2.5} fill={COLORS.primary} />
          ))}
          <Path d={carbonPath} stroke={COLORS.primary} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {treesPoints.map((p, i) => (
            <Circle key={`t${i}`} cx={p.x} cy={p.y} r={2.5} fill="#4CAF50" />
          ))}
          <Path d={treesPath} stroke="#4CAF50" strokeWidth={2.5} strokeDasharray="4 4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <View style={styles.xAxis}>
          {trend.map((t, i) => (
            <Text key={t.label + i} style={styles.xLabel} numberOfLines={1}>{t.label}</Text>
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
  title: { fontSize: 15, fontWeight: '800', color: COLORS.text.primary },
  heroRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md, gap: SPACING.md },
  scoreWrap: { alignItems: 'center' },
  scoreLabel: { fontSize: 10, color: COLORS.text.muted, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  statTiles: { flex: 1, gap: SPACING.sm },
  tile: {
    backgroundColor: `${COLORS.primary}10`, borderRadius: RADIUS.md,
    padding: SPACING.sm, paddingHorizontal: SPACING.md,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  tileEmoji: { fontSize: 18 },
  tileValue: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  tileLabel: { fontSize: 11, color: COLORS.text.secondary, flex: 1, marginLeft: 4 },
  legendRow: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md, marginBottom: SPACING.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: COLORS.text.secondary, fontWeight: '600' },
  chartWrap: { marginTop: SPACING.xs, alignItems: 'center' },
  xAxis: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: CHART_W, marginTop: 2, paddingHorizontal: PADDING.left,
  },
  xLabel: { fontSize: 8, color: COLORS.text.muted, fontWeight: '600', maxWidth: 24 },
});

export default CarbonChart;