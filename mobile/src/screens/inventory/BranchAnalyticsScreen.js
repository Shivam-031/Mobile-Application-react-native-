import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const MONTHLY_SALES = [
  { month: 'Jul', sales: 28 }, { month: 'Aug', sales: 35 },
  { month: 'Sep', sales: 42 }, { month: 'Oct', sales: 38 },
  { month: 'Nov', sales: 55 }, { month: 'Dec', sales: 61 },
];

const DEMAND_BY_LOCATION = [
  { district: 'Mumbai', demand: 145, topProduct: 'Medium Clay Pot', growth: 18 },
  { district: 'Pune', demand: 88, topProduct: 'Small Terracotta Pot', growth: 12 },
  { district: 'Nashik', demand: 64, topProduct: 'Large Garden Pot', growth: 22 },
  { district: 'Nagpur', demand: 47, topProduct: 'Decorative Jali Pot', growth: 8 },
  { district: 'Aurangabad', demand: 35, topProduct: 'Hanging Pot Set', growth: 31 },
];

const CUSTOMER_FEEDBACK = [
  { id: 'f1', customer: 'Priya S.', rating: 5, product: 'Medium Clay Pot', comment: 'Beautiful quality pot! The earthen texture is amazing and my plant is thriving.', date: '2 days ago', avatar: '👩' },
  { id: 'f2', customer: 'Amit K.', rating: 4, product: 'Small Terracotta Pot', comment: 'Good quality, fast delivery. Slight chip on rim but overall happy.', date: '5 days ago', avatar: '👨' },
  { id: 'f3', customer: 'Sunita R.', rating: 5, product: 'Decorative Jali Pot', comment: 'Absolutely love the jali work! Everyone who visits asks where I got it.', date: '1 week ago', avatar: '👩' },
  { id: 'f4', customer: 'Raju M.', rating: 3, product: 'Large Garden Pot', comment: 'Pot is good but delivery took longer than expected. Need to improve logistics.', date: '1 week ago', avatar: '👨' },
  { id: 'f5', customer: 'Kavita N.', rating: 5, product: 'Hanging Pot Set', comment: 'Perfect for my balcony garden! Very well packaged too.', date: '2 weeks ago', avatar: '👩' },
];

const maxDemand = Math.max(...DEMAND_BY_LOCATION.map((d) => d.demand));
const maxSales = Math.max(...MONTHLY_SALES.map((d) => d.sales));
const BAR_HEIGHT = 120;

const BranchAnalyticsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('sales');

  const avgRating = (CUSTOMER_FEEDBACK.reduce((a, f) => a + f.rating, 0) / CUSTOMER_FEEDBACK.length).toFixed(1);
  const fiveStars = CUSTOMER_FEEDBACK.filter((f) => f.rating === 5).length;

  const renderStars = (rating) => '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📊 Branch Analytics</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {[
          { id: 'sales', label: '📈 Sales' },
          { id: 'demand', label: '📍 By Location' },
          { id: 'feedback', label: '💬 Feedback' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && { color: '#fff' }]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>

        {/* SALES TAB */}
        {activeTab === 'sales' && (
          <View>
            <View style={styles.kpiRow}>
              {[
                { label: 'This Month', value: '61', emoji: '📦', color: COLORS.primary },
                { label: 'Revenue', value: '₹18.4k', emoji: '💰', color: '#795548' },
                { label: 'Avg/Day', value: '2.0', emoji: '📅', color: '#2196F3' },
                { label: 'Growth', value: '+11%', emoji: '📈', color: '#4CAF50' },
              ].map((k) => (
                <View key={k.label} style={[styles.kpiCard, { borderTopColor: k.color }]}>
                  <Text style={{ fontSize: 20 }}>{k.emoji}</Text>
                  <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
                  <Text style={styles.kpiLabel}>{k.label}</Text>
                </View>
              ))}
            </View>

            {/* Bar Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Monthly Sales — Last 6 Months</Text>
              <View style={styles.barChart}>
                {MONTHLY_SALES.map((d) => {
                  const barH = Math.max(4, (d.sales / maxSales) * BAR_HEIGHT);
                  return (
                    <View key={d.month} style={styles.barWrapper}>
                      <Text style={styles.barValue}>{d.sales}</Text>
                      <View style={[styles.bar, { height: barH }]} />
                      <Text style={styles.barLabel}>{d.month}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Top Products */}
            <Text style={styles.sectionTitle}>🏆 Top Selling Products</Text>
            {[
              { name: 'Small Terracotta Pot', sold: 145, revenue: 21605, pct: 40 },
              { name: 'Medium Clay Pot', sold: 88, revenue: 21912, pct: 24 },
              { name: 'Decorative Jali Pot', sold: 60, revenue: 23940, pct: 17 },
              { name: 'Hanging Pot Set', sold: 54, revenue: 16146, pct: 15 },
            ].map((p, i) => (
              <View key={i} style={styles.topProductRow}>
                <View style={[styles.rankBadge, i === 0 && { backgroundColor: '#FFD700' }, i === 1 && { backgroundColor: '#C0C0C0' }, i === 2 && { backgroundColor: '#CD7F32' }]}>
                  <Text style={styles.rankText}>#{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.topProductName} numberOfLines={1}>{p.name}</Text>
                  <View style={styles.productBarBg}>
                    <View style={[styles.productBarFill, { width: `${p.pct}%` }]} />
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.topProductSold}>{p.sold} sold</Text>
                  <Text style={styles.topProductRevenue}>₹{p.revenue.toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* DEMAND BY LOCATION TAB */}
        {activeTab === 'demand' && (
          <View>
            <Text style={styles.sectionTitle}>📍 Demand by District — Maharashtra</Text>
            <Text style={styles.sectionSub}>Where your customers are ordering from most</Text>

            {DEMAND_BY_LOCATION.map((d, i) => (
              <View key={d.district} style={styles.demandCard}>
                <View style={styles.demandHeader}>
                  <View style={styles.demandRank}>
                    <Text style={styles.demandRankText}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.districtName}>{d.district}</Text>
                    <Text style={styles.topProductLabel}>Top: {d.topProduct}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.demandValue}>{d.demand} orders</Text>
                    <Text style={styles.growthText}>+{d.growth}% growth</Text>
                  </View>
                </View>
                <View style={styles.demandBarBg}>
                  <View style={[styles.demandBarFill, { width: `${(d.demand / maxDemand) * 100}%` }]} />
                </View>
              </View>
            ))}

            <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>💡 Demand Insight</Text>
              <Text style={styles.insightText}>
                Mumbai and Pune account for 67% of your total orders. Consider adding a local pick-up point in Nashik — it showed the highest growth this month (+22%).
              </Text>
            </View>
          </View>
        )}

        {/* CUSTOMER FEEDBACK TAB */}
        {activeTab === 'feedback' && (
          <View>
            {/* Rating summary */}
            <View style={styles.ratingCard}>
              <View style={styles.ratingLeft}>
                <Text style={styles.bigRating}>{avgRating}</Text>
                <Text style={styles.ratingStars}>⭐⭐⭐⭐⭐</Text>
                <Text style={styles.ratingCount}>{CUSTOMER_FEEDBACK.length} reviews</Text>
              </View>
              <View style={styles.ratingRight}>
                {[5,4,3,2,1].map((star) => {
                  const count = CUSTOMER_FEEDBACK.filter((f) => f.rating === star).length;
                  return (
                    <View key={star} style={styles.ratingBarRow}>
                      <Text style={styles.starLabel}>{star}⭐</Text>
                      <View style={styles.ratingBarBg}>
                        <View style={[styles.ratingBarFill, { width: `${(count / CUSTOMER_FEEDBACK.length) * 100}%` }]} />
                      </View>
                      <Text style={styles.ratingBarCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            {CUSTOMER_FEEDBACK.map((feedback) => (
              <View key={feedback.id} style={styles.feedbackCard}>
                <View style={styles.feedbackHeader}>
                  <View style={styles.feedbackAvatar}>
                    <Text style={{ fontSize: 22 }}>{feedback.avatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.feedbackCustomer}>{feedback.customer}</Text>
                    <Text style={styles.feedbackProduct}>{feedback.product}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.feedbackStars}>{renderStars(feedback.rating)}</Text>
                    <Text style={styles.feedbackDate}>{feedback.date}</Text>
                  </View>
                </View>
                <Text style={styles.feedbackComment}>"{feedback.comment}"</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.sm,
  },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 24, color: COLORS.primary, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },
  tabRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.sm },
  tab: { flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingVertical: 10, alignItems: 'center', ...SHADOWS.card },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 12, fontWeight: '700', color: COLORS.text.secondary },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  kpiCard: {
    flex: 1, minWidth: '45%', backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', borderTopWidth: 3, ...SHADOWS.card,
  },
  kpiValue: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  kpiLabel: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.card },
  chartTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.md },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: BAR_HEIGHT + 50, justifyContent: 'space-around' },
  barWrapper: { alignItems: 'center', flex: 1 },
  bar: { width: '60%', backgroundColor: COLORS.primary, borderRadius: 4 },
  barValue: { fontSize: 10, color: COLORS.text.secondary, marginBottom: 4 },
  barLabel: { fontSize: 10, color: COLORS.text.muted, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: COLORS.text.muted, marginBottom: SPACING.sm },
  topProductRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.sm, ...SHADOWS.card,
  },
  rankBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: `${COLORS.primary}20`, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 11, fontWeight: '800', color: COLORS.text.primary },
  topProductName: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary, marginBottom: 6 },
  productBarBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  productBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  topProductSold: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  topProductRevenue: { fontSize: 11, color: COLORS.text.muted },
  demandCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.card },
  demandHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  demandRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center' },
  demandRankText: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  districtName: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  topProductLabel: { fontSize: 11, color: COLORS.text.muted },
  demandValue: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  growthText: { fontSize: 11, color: '#4CAF50', fontWeight: '700' },
  demandBarBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  demandBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  insightCard: {
    backgroundColor: `${COLORS.primary}12`, borderRadius: RADIUS.md, padding: SPACING.md,
    borderLeftWidth: 3, borderLeftColor: COLORS.primary, marginTop: SPACING.sm,
  },
  insightTitle: { fontWeight: '700', color: COLORS.primary, marginBottom: 6 },
  insightText: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 20 },
  ratingCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md,
    flexDirection: 'row', gap: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.card,
  },
  ratingLeft: { alignItems: 'center', justifyContent: 'center', minWidth: 80 },
  bigRating: { fontSize: 40, fontWeight: '900', color: COLORS.primary },
  ratingStars: { fontSize: 14 },
  ratingCount: { fontSize: 11, color: COLORS.text.muted, marginTop: 4 },
  ratingRight: { flex: 1, justifyContent: 'center', gap: 6 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  starLabel: { width: 30, fontSize: 11, color: COLORS.text.secondary },
  ratingBarBg: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  ratingBarFill: { height: '100%', backgroundColor: '#FFD700', borderRadius: 3 },
  ratingBarCount: { width: 16, fontSize: 11, color: COLORS.text.muted, textAlign: 'right' },
  feedbackCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.card },
  feedbackHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  feedbackAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${COLORS.primary}15`, alignItems: 'center', justifyContent: 'center' },
  feedbackCustomer: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary },
  feedbackProduct: { fontSize: 11, color: COLORS.text.muted },
  feedbackStars: { fontSize: 11 },
  feedbackDate: { fontSize: 10, color: COLORS.text.muted, marginTop: 2 },
  feedbackComment: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 20, fontStyle: 'italic' },
});

export default BranchAnalyticsScreen;
