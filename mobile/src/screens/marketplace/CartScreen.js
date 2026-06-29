import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { incrementQty, decrementQty, removeFromCart } from '../../store/slices/cartSlice';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((s) => s.cart.items);

  const totalPrice = cartItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const totalCarbon = cartItems.reduce((acc, i) => acc + i.carbonSaved * i.qty, 0).toFixed(1);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    // Hand off to the real CheckoutScreen — that screen calls
    // api.post(ENDPOINTS.ORDERS) and clears the cart on success via its
    // own flow. No Alert stub, no fake confirmation. Param key is `cart`
    // because that's what CheckoutScreen destructures (CheckoutScreen.js:13).
    navigation.navigate('Checkout', { cart: cartItems });
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={{ fontSize: 80 }}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySub}>Add eco-friendly products to get started</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Marketplace')}>
          <Text style={styles.shopBtnText}>Browse Products 🌿</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>🛒 Your Cart ({cartItems.length})</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.carbonBanner}>
        <Text style={styles.carbonBannerText}>🌍 This order saves {totalCarbon} kg CO₂</Text>
      </View>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: SPACING.md, gap: SPACING.sm, paddingBottom: 180 }}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.cartItemImage}><Text style={{ fontSize: 36 }}>🏺</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cartItemName}>{item.name}</Text>
              <Text style={styles.cartItemLocation}>📍 {item.location}</Text>
              <Text style={styles.cartItemCarbon}>🌍 Saves {(item.carbonSaved * item.qty).toFixed(1)} kg CO₂</Text>
              <View style={styles.cartItemFooter}>
                <Text style={styles.cartItemPrice}>₹{item.price * item.qty}</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => dispatch(decrementQty(item._id))}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyVal}>{item.qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => dispatch(incrementQty(item._id))}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => dispatch(removeFromCart(item._id))} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{totalPrice}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={styles.checkoutBtnText}>Checkout →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl, backgroundColor: COLORS.background },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text.primary, marginTop: SPACING.md },
  emptySub: { fontSize: 14, color: COLORS.text.muted, marginTop: 4, textAlign: 'center' },
  shopBtn: { marginTop: SPACING.xl, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 32, paddingVertical: 14 },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.sm,
  },
  back: { fontSize: 24, color: COLORS.primary, fontWeight: '700', padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },
  carbonBanner: {
    backgroundColor: `${COLORS.primary}15`, marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center',
  },
  carbonBannerText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  cartItem: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md,
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, ...SHADOWS.card,
  },
  cartItemImage: {
    width: 70, height: 70, backgroundColor: `${COLORS.primary}10`,
    borderRadius: RADIUS.sm, alignItems: 'center', justifyContent: 'center',
  },
  cartItemName: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary },
  cartItemLocation: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
  cartItemCarbon: { fontSize: 11, color: COLORS.primary, fontWeight: '600', marginTop: 2 },
  cartItemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm },
  cartItemPrice: { fontSize: 16, fontWeight: '800', color: COLORS.accent },
  qtyRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: RADIUS.sm },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 16, color: COLORS.primary, fontWeight: '700' },
  qtyVal: { width: 24, textAlign: 'center', fontWeight: '700', color: COLORS.text.primary, fontSize: 13 },
  removeBtn: { padding: 4 },
  removeBtnText: { color: COLORS.error, fontSize: 14, fontWeight: '700' },
  checkoutBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surface,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.lg, paddingBottom: 30, ...SHADOWS.card,
  },
  totalLabel: { fontSize: 12, color: COLORS.text.muted },
  totalValue: { fontSize: 22, fontWeight: '900', color: COLORS.accent },
  checkoutBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 32, paddingVertical: 14 },
  checkoutBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

export default CartScreen;
