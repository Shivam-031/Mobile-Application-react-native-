import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/apiService';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const STATUS_CONFIG = {
  placed:      { label: 'Order Placed',   color: '#2196F3', emoji: '📋' },
  confirmed:   { label: 'Confirmed',      color: '#9C27B0', emoji: '✅' },
  processing:  { label: 'Processing',     color: '#FF9800', emoji: '⚙️' },
  shipped:     { label: 'Shipped',        color: '#00BCD4', emoji: '🚚' },
  delivered:   { label: 'Delivered',      color: '#4CAF50', emoji: '🏠' },
  cancelled:   { label: 'Cancelled',      color: '#F44336', emoji: '❌' },
};

const FILTER_TABS = ['All', 'Active', 'Delivered', 'Cancelled'];

const OrderCard = ({ order, onPress }) => {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <TouchableOpacity style={styles.orderCard} onPress={() => onPress(order)} activeOpacity={0.85}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.orderDate}>{date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${config.color}18` }]}>
          <Text style={styles.statusEmoji}>{config.emoji}</Text>
          <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {(order.items || []).slice(0, 2).map((item, i) => (
          <Text key={i} style={styles.orderItemText} numberOfLines={1}>
            🏺 {item.name} × {item.qty}
          </Text>
        ))}
        {(order.items?.length || 0) > 2 && (
          <Text style={styles.moreItems}>+{order.items.length - 2} more items</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.orderTotal}>₹{order.totalAmount}</Text>
          <Text style={styles.orderCarbon}>🌍 Saved {order.totalCarbonSaved?.toFixed(1)} kg CO₂</Text>
        </View>
        <Text style={styles.viewDetails}>View Details →</Text>
      </View>

      {/* Progress bar for active orders */}
      {!['delivered', 'cancelled'].includes(order.status) && (
        <View style={styles.progressContainer}>
          {['placed', 'confirmed', 'processing', 'shipped', 'delivered'].map((s, i) => {
            const steps = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];
            const current = steps.indexOf(order.status);
            const isDone = i <= current;
            return (
              <React.Fragment key={s}>
                <View style={[styles.progressDot, isDone && styles.progressDotActive]} />
                {i < 4 && <View style={[styles.progressLine, isDone && i < current && styles.progressLineActive]} />}
              </React.Fragment>
            );
          })}
        </View>
      )}
    </TouchableOpacity>
  );
};

const MyOrdersScreen = ({ navigation }) => {
  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const res = await api.get('/orders/my');
      return res.data.data || [];
    },
  });

  const orders = data || [];

  const filtered = orders.filter((o) => {
    if (filter === 'All') return true;
    if (filter === 'Active') return !['delivered', 'cancelled'].includes(o.status);
    if (filter === 'Delivered') return o.status === 'delivered';
    if (filter === 'Cancelled') return o.status === 'cancelled';
    return true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const totalCarbonSaved = orders.reduce((acc, o) => acc + (o.totalCarbonSaved || 0), 0);

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📦 My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Carbon Impact Banner */}
      <View style={styles.carbonBanner}>
        <Text style={styles.carbonBannerEmoji}>🌍</Text>
        <View>
          <Text style={styles.carbonBannerLabel}>Total CO₂ Saved via Orders</Text>
          <Text style={styles.carbonBannerValue}>{totalCarbonSaved.toFixed(1)} kg</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterTabText, filter === tab && { color: '#fff' }]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(o) => o._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={(o) => navigation.navigate('OrderDetail', { order: o })} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 60 }}>📦</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>
              {isError ? (error?.message || 'Could not load orders') : 'Start shopping eco-friendly products!'}
            </Text>
            <TouchableOpacity style={styles.shopNowBtn} onPress={() => navigation.navigate('Marketplace')}>
              <Text style={styles.shopNowBtnText}>🛒 Shop Now</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.sm,
  },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 24, color: COLORS.primary, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },
  carbonBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.primary, margin: SPACING.md, borderRadius: RADIUS.md, padding: SPACING.md,
  },
  carbonBannerEmoji: { fontSize: 36 },
  carbonBannerLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  carbonBannerValue: { fontSize: 22, fontWeight: '900', color: '#fff' },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.sm,
  },
  filterTab: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.full,
    paddingVertical: 8, alignItems: 'center', ...SHADOWS.card,
  },
  filterTabActive: { backgroundColor: COLORS.primary },
  filterTabText: { fontSize: 12, fontWeight: '600', color: COLORS.text.secondary },
  list: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: 80 },
  orderCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, ...SHADOWS.card },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  orderId: { fontSize: 14, fontWeight: '800', color: COLORS.text.primary, letterSpacing: 1 },
  orderDate: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
  statusEmoji: { fontSize: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  orderItems: { marginBottom: SPACING.sm },
  orderItemText: { fontSize: 13, color: COLORS.text.secondary, paddingVertical: 2 },
  moreItems: { fontSize: 11, color: COLORS.text.muted, fontStyle: 'italic' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  orderTotal: { fontSize: 16, fontWeight: '800', color: COLORS.accent },
  orderCarbon: { fontSize: 11, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  viewDetails: { fontSize: 13, color: COLORS.primary, fontWeight: '700' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border },
  progressDotActive: { backgroundColor: COLORS.primary },
  progressLine: { flex: 1, height: 2, backgroundColor: COLORS.border },
  progressLineActive: { backgroundColor: COLORS.primary },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: SPACING.sm },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text.primary },
  emptySub: { fontSize: 13, color: COLORS.text.muted },
  shopNowBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 32, paddingVertical: 14, marginTop: SPACING.md },
  shopNowBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default MyOrdersScreen;