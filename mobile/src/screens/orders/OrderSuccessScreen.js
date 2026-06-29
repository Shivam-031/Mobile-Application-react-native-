import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ScrollView } from 'react-native';
import { useDispatch } from 'react-redux';
import { clearCart } from '../../store/slices/cartSlice';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const OrderSuccessScreen = ({ route, navigation }) => {
  const { order, totalCarbon } = route.params || {};
  const dispatch = useDispatch();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Order placed successfully (CheckoutScreen only navigates here on 2xx
    // from POST /orders). Wipe the persisted cart so the marketplace badge
    // resets and a stale reload doesn't re-show the same items.
    dispatch(clearCart());

    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 5, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.successEmoji}>✅</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <Text style={styles.successTitle}>Order Placed! 🎉</Text>
          <Text style={styles.successSub}>Thank you for shopping eco-friendly</Text>

          {order && (
            <View style={styles.orderIdCard}>
              <Text style={styles.orderIdLabel}>Order ID</Text>
              <Text style={styles.orderIdValue}>#{order._id?.slice(-8).toUpperCase() || 'GYI00001'}</Text>
            </View>
          )}

          {/* Carbon Impact */}
          <View style={styles.carbonCard}>
            <Text style={styles.carbonEmoji}>🌍</Text>
            <Text style={styles.carbonTitle}>Your Eco Impact</Text>
            <Text style={styles.carbonValue}>{totalCarbon || '0'} kg CO₂ Saved</Text>
            <Text style={styles.carbonSub}>
              Equivalent to planting {Math.round((parseFloat(totalCarbon) || 0) / 21) || 1} tree seedlings 🌱
            </Text>
          </View>

          {/* Steps */}
          <View style={styles.trackCard}>
            <Text style={styles.trackTitle}>What happens next?</Text>
            {[
              { emoji: '✅', step: 'Order Confirmed', done: true },
              { emoji: '📦', step: 'Being Packed by Branch', done: false },
              { emoji: '🚚', step: 'Out for Delivery', done: false },
              { emoji: '🏠', step: 'Delivered to You', done: false },
            ].map((s, i) => (
              <View key={i} style={styles.trackRow}>
                <View style={[styles.trackDot, s.done && styles.trackDotDone]}>
                  <Text style={{ fontSize: 14 }}>{s.emoji}</Text>
                </View>
                <Text style={[styles.trackStep, s.done && { color: COLORS.primary, fontWeight: '700' }]}>{s.step}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.ordersBtn} onPress={() => navigation.navigate('MyOrders')}>
          <Text style={styles.ordersBtnText}>View My Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => navigation.navigate('Marketplace')}
        >
          <Text style={styles.shopBtnText}>🛒 Shop More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { alignItems: 'center', padding: SPACING.lg, paddingTop: 80, paddingBottom: 120 },
  successCircle: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg,
  },
  successEmoji: { fontSize: 60 },
  successTitle: { fontSize: 28, fontWeight: '900', color: COLORS.primary, textAlign: 'center' },
  successSub: { fontSize: 14, color: COLORS.text.secondary, marginTop: 6, textAlign: 'center' },
  orderIdCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md,
    alignItems: 'center', marginTop: SPACING.lg, width: '100%', ...SHADOWS.card,
  },
  orderIdLabel: { fontSize: 12, color: COLORS.text.muted },
  orderIdValue: { fontSize: 20, fontWeight: '900', color: COLORS.text.primary, marginTop: 4, letterSpacing: 2 },
  carbonCard: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.xl,
    alignItems: 'center', marginTop: SPACING.md, width: '100%',
  },
  carbonEmoji: { fontSize: 48 },
  carbonTitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  carbonValue: { fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 4 },
  carbonSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 6, textAlign: 'center' },
  trackCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.lg,
    marginTop: SPACING.md, width: '100%', ...SHADOWS.card,
  },
  trackTitle: { fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.md, fontSize: 15 },
  trackRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  trackDot: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.cardBg,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
  },
  trackDotDone: { backgroundColor: `${COLORS.primary}20` },
  trackStep: { fontSize: 14, color: COLORS.text.secondary },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface, flexDirection: 'row', gap: SPACING.sm,
    padding: SPACING.lg, paddingBottom: 30, ...SHADOWS.card,
  },
  ordersBtn: {
    flex: 1, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  ordersBtnText: { color: COLORS.primary, fontWeight: '700' },
  shopBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  shopBtnText: { color: '#fff', fontWeight: '700' },
});

export default OrderSuccessScreen;
