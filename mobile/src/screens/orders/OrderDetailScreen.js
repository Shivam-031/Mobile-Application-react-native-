import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator,
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

const STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];

const OrderDetailScreen = ({ route, navigation }) => {
  const routeOrder = route.params?.order;
  const orderId = routeOrder?._id;

  // Always refetch from the server for the latest status — the row in
  // MyOrdersScreen may be stale (status changes are pushed by the
  // employee/admin who is shipping the package).
  const { data: freshOrder, isLoading, isError, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`);
      return res.data.data;
    },
    enabled: Boolean(orderId),
    initialData: routeOrder,
  });

  const order = freshOrder || routeOrder;

  if (!order) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ fontSize: 48 }}>📦</Text>
        <Text style={styles.missingText}>Order not found.</Text>
        <TouchableOpacity style={styles.backMissingBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backMissingBtnText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
  const placedDate = new Date(order.createdAt);
  const dateText = placedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeText = placedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading && !routeOrder ? (
        <View style={styles.centered}><ActivityIndicator color={COLORS.primary} size="large" /></View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          {isError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>
                ⚠️ Couldn't refresh status — showing last known info.
              </Text>
            </View>
          )}

          {/* Status Card */}
          <View style={[styles.statusCard, { borderLeftColor: config.color }]}>
            <View style={styles.statusHeader}>
              <Text style={{ fontSize: 36 }}>{config.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
                <Text style={styles.statusDate}>Placed on {dateText} at {timeText}</Text>
              </View>
            </View>
            {/* Step indicator */}
            {order.status !== 'cancelled' && (
              <View style={styles.stepsRow}>
                {STEPS.map((s, i) => {
                  const current = STEPS.indexOf(order.status);
                  const isDone = i <= current;
                  return (
                    <React.Fragment key={s}>
                      <View style={[styles.stepDot, isDone && { backgroundColor: config.color }]}>
                        <Text style={styles.stepDotText}>{isDone ? '✓' : i + 1}</Text>
                      </View>
                      {i < STEPS.length - 1 && (
                        <View style={[styles.stepLine, isDone && i < current && { backgroundColor: config.color }]} />
                      )}
                    </React.Fragment>
                  );
                })}
              </View>
            )}
          </View>

          {/* Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Items in this order</Text>
            {(order.items || []).map((item, i) => (
              <View key={i} style={styles.itemRow}>
                <View style={styles.itemEmoji}><Text style={{ fontSize: 24 }}>🏺</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.itemMeta}>Qty {item.qty} · ₹{item.price} each · saves {item.carbonSaved} kg CO₂</Text>
                </View>
                <Text style={styles.itemTotal}>₹{item.qty * item.price}</Text>
              </View>
            ))}
          </View>

          {/* Address */}
          {order.address && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
              <View style={styles.addressCard}>
                {[
                  order.address.line1,
                  order.address.line2,
                  order.address.city,
                  order.address.state,
                  order.address.pincode,
                ].filter(Boolean).map((line, i) => (
                  <Text key={i} style={styles.addressLine}>{line}</Text>
                ))}
                {order.address.phone && (
                  <Text style={styles.addressPhone}>📞 {order.address.phone}</Text>
                )}
              </View>
            </View>
          )}

          {/* Payment */}
          {order.paymentMethod && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💳 Payment</Text>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Method</Text>
                <Text style={styles.paymentValue}>{order.paymentMethod.toUpperCase()}</Text>
              </View>
            </View>
          )}

          {/* Summary */}
          <View style={[styles.section, styles.summary]}>
            <Text style={styles.sectionTitle}>🧾 Bill Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{order.totalAmount}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Paid</Text>
              <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
            </View>
            <View style={styles.carbonRow}>
              <Text style={styles.carbonEmoji}>🌍</Text>
              <View>
                <Text style={styles.carbonLabel}>CO₂ Saved by this order</Text>
                <Text style={styles.carbonValue}>{order.totalCarbonSaved?.toFixed(1)} kg</Text>
              </View>
            </View>
          </View>

          {/* Order ID + meta */}
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Order ID</Text>
            <Text style={styles.metaValue}>#{order._id}</Text>
          </View>
        </ScrollView>
      )}
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
  statusCard: {
    margin: SPACING.md, padding: SPACING.md, backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, borderLeftWidth: 4, ...SHADOWS.card,
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  statusLabel: { fontSize: 18, fontWeight: '800' },
  statusDate: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  stepsRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm },
  stepDot: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  stepLine: { flex: 1, height: 3, backgroundColor: COLORS.border, marginHorizontal: 2 },
  section: { marginHorizontal: SPACING.md, marginBottom: SPACING.md },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.sm },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.sm, marginBottom: SPACING.sm, ...SHADOWS.card,
  },
  itemEmoji: {
    width: 48, height: 48, backgroundColor: `${COLORS.primary}10`,
    borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center',
  },
  itemName: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary },
  itemMeta: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
  itemTotal: { fontSize: 14, fontWeight: '800', color: COLORS.accent },
  addressCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, ...SHADOWS.card,
  },
  addressLine: { fontSize: 13, color: COLORS.text.primary, lineHeight: 20 },
  addressPhone: { fontSize: 13, color: COLORS.primary, marginTop: SPACING.sm, fontWeight: '600' },
  paymentRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, ...SHADOWS.card,
  },
  paymentLabel: { fontSize: 13, color: COLORS.text.muted },
  paymentValue: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  summary: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, ...SHADOWS.card,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  summaryLabel: { fontSize: 13, color: COLORS.text.secondary },
  summaryValue: { fontSize: 13, fontWeight: '600', color: COLORS.text.primary },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: SPACING.sm, paddingTop: SPACING.sm },
  totalLabel: { fontSize: 14, fontWeight: '800', color: COLORS.text.primary },
  totalValue: { fontSize: 16, fontWeight: '900', color: COLORS.accent },
  carbonRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginTop: SPACING.sm, paddingTop: SPACING.sm,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  carbonEmoji: { fontSize: 32 },
  carbonLabel: { fontSize: 11, color: COLORS.text.muted },
  carbonValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  metaBox: {
    marginHorizontal: SPACING.md, padding: SPACING.md,
    backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md,
  },
  metaLabel: { fontSize: 11, color: COLORS.text.muted },
  metaValue: { fontSize: 12, fontWeight: '700', color: COLORS.text.primary, marginTop: 2 },
  errorBanner: {
    margin: SPACING.md, padding: SPACING.md, backgroundColor: '#FFEBEE',
    borderRadius: RADIUS.md, borderLeftWidth: 4, borderLeftColor: '#F44336',
  },
  errorBannerText: { color: '#B71C1C', fontSize: 13 },
  missingText: { color: COLORS.text.muted, marginTop: SPACING.md, fontSize: 16 },
  backMissingBtn: {
    marginTop: SPACING.lg, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md, backgroundColor: COLORS.primary,
  },
  backMissingBtnText: { color: '#fff', fontWeight: '700' },
});

export default OrderDetailScreen;