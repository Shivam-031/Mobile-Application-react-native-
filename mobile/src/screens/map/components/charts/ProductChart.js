import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, SPACING, RADIUS } from '../../../../constants/theme';

const formatINR = (n) => (n >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : n >= 1e3 ? `₹${(n / 1e3).toFixed(1)}K` : `₹${n}`);

const CATEGORY_COLORS = {
  pots: COLORS.primary,
  plants: '#4CAF50',
  decor: '#FF9800',
  accessories: '#795548',
};

const CATEGORY_ICONS = { pots: '🏺', plants: '🌱', decor: '🎨', accessories: '🧺' };

/** SVG arc path from start angle to end angle (radians) around (cx,cy) radius r. */
function arcPath(cx, cy, r, start, end) {
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const largeArc = end - start > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

/**
 * ProductChart — Top-selling products horizontal bar + category share donut.
 * Pure react-native-svg (no chart library) — reliable on RN 0.73.
 */
const ProductChart = ({ analytics }) => {
  if (!analytics) return null;

  const products = analytics.topProducts || [];
  const categories = analytics.categorySales || [];
  const maxSold = Math.max(...products.map((p) => p.sold), 1);

  // Donut slices — start at 12 o'clock (-π/2)
  let cumulative = -Math.PI / 2;
  const slices = categories.map((c) => {
    const portion = c.share / 100;
    const start = cumulative;
    const end = cumulative + portion * Math.PI * 2;
    cumulative = end;
    return { ...c, start, end };
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🏆 Top Selling Products</Text>

      <View style={{ marginTop: SPACING.sm }}>
        {products.map((p) => (
          <View key={p.name} style={styles.productRow}>
            <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.max(2, (p.sold / maxSold) * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.productSold}>{p.sold}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <Text style={styles.title}>📊 Category Split</Text>
      <View style={styles.donutRow}>
        <View style={styles.donutWrap}>
          <Svg width={110} height={110} viewBox="0 0 110 110">
            <>
              {slices.map((s) => (
                <Path
                  key={s.category}
                  d={arcPath(55, 55, 48, s.start, s.end)}
                  fill={CATEGORY_COLORS[s.category] || COLORS.primaryLight}
                />
              ))}
              <Path d={arcPath(55, 55, 26, 0, Math.PI * 2)} fill={COLORS.surface} />
            </>
          </Svg>
        </View>
        <View style={styles.catList}>
          {categories.map((c) => (
            <View key={c.category} style={styles.catItem}>
              <View style={[styles.catDot, { backgroundColor: CATEGORY_COLORS[c.category] || COLORS.primary }]} />
              <Text style={styles.catName}>{CATEGORY_ICONS[c.category] || '•'} {c.category}</Text>
              <Text style={styles.catPct}>{c.share}%</Text>
            </View>
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
  productRow: {
    flexDirection: 'row', alignItems: 'center', marginVertical: 5, gap: 8,
  },
  productName: { width: 110, fontSize: 11, fontWeight: '600', color: COLORS.text.secondary },
  barTrack: {
    flex: 1, height: 8, borderRadius: 4, backgroundColor: `${COLORS.primary}12`, overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
  productSold: { fontSize: 11, fontWeight: '700', color: COLORS.primary, width: 38, textAlign: 'right' },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  donutRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: SPACING.md },
  donutWrap: { width: 110, height: 110 },
  catList: { flex: 1, gap: 6 },
  catItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { flex: 1, fontSize: 12, color: COLORS.text.primary, fontWeight: '600', textTransform: 'capitalize' },
  catPct: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
});

export default ProductChart;