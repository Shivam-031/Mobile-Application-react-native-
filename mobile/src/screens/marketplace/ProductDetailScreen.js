import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const ProductDetailScreen = ({ route, navigation }) => {
  // Prefer the canonical product from the Redux store over the
  // route.params snapshot — MarketplaceScreen may have launched with a
  // slightly stale copy, and we want the latest stock/price here.
  const paramProduct = route.params?.product;
  const product = useSelector((state) =>
    state.products.list.find((p) => p._id === paramProduct?._id)
  ) || paramProduct;

  const dispatch = useDispatch();
  const cartItems = useSelector((s) => s.cart.items);
  const [qty, setQty] = useState(1);

  // Use the qty already in the cart (if user came back from Cart and taps +),
  // otherwise start at 1. Stops the "I added 1, opened detail, it says 1"
  // mismatch when the product is already in the cart.
  const inCartQty = cartItems.find((i) => i._id === product?._id)?.qty || 0;

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) dispatch(addToCart(product));
    Alert.alert('Added to Cart 🛒', `${qty}x ${product.name} added!`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') },
    ]);
  };

  const InfoRow = ({ emoji, label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  if (!product) {
    return (
      <View style={[styles.container, styles.missingState]}>
        <Text style={{ fontSize: 48 }}>🌱</Text>
        <Text style={styles.missingText}>This product is no longer available.</Text>
        <TouchableOpacity style={styles.backMissingBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backMissingBtnText}>← Back to Marketplace</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 100 }}>🏺</Text>
          <View style={styles.imageBadges}>
            <View style={styles.badge}><Text style={styles.badgeText}>🌿 Organic</Text></View>
            <View style={[styles.badge, { backgroundColor: COLORS.accent }]}>
              <Text style={styles.badgeText}>✋ Handmade</Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.ratingRow}>
            {Array.from({ length: product.ecoRating || 0 }).map((_, i) => <Text key={i}>⭐</Text>)}
            <Text style={styles.ratingText}>({product.ecoRating || 0}.0)</Text>
          </View>
          <Text style={styles.price}>₹{product.price}</Text>

          <View style={styles.carbonHighlight}>
            <Text style={styles.carbonHighlightText}>🌍 This purchase saves {product.carbonSaved} kg CO₂</Text>
            <Text style={styles.carbonHighlightSub}>Equivalent to planting {Math.round((product.carbonSaved || 0) / 21)} tree seedlings</Text>
          </View>

          <View style={styles.separator} />

          <Text style={styles.sectionTitle}>Product Details</Text>
          <InfoRow emoji="📍" label="Origin" value={product.state || product.location || 'India'} />
          <InfoRow emoji="🏷️" label="Category" value={(product.category || '').charAt(0).toUpperCase() + (product.category || '').slice(1)} />
          <InfoRow emoji="📦" label="In Stock" value={`${product.stock ?? 0} units available`} />
          <InfoRow emoji="🌱" label="Material" value={product.material || "Natural clay, organic finish"} />
          <InfoRow emoji="♻️" label="Eco Rating" value={`${product.ecoRating || 0}/5 — Premium Eco Product`} />

          <View style={styles.separator} />

          <Text style={styles.sectionTitle}>Shipped from</Text>
          <View style={styles.branchCard}>
            <Text style={styles.branchEmoji}>🏭</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.branchName}>{product.state || product.branchId?.state || 'India'} Branch</Text>
              <Text style={styles.branchSub}>Green Yatra India Certified Partner</Text>
            </View>
            <Text style={styles.branchTag}>✅ Verified</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View style={styles.qtyControl}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))}>
            <Text style={styles.qtyBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{qty}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(qty + 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>🛒 Add to Cart · ₹{product.price * qty}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  imageSection: {
    height: 280, backgroundColor: `${COLORS.primary}12`, alignItems: 'center',
    justifyContent: 'center', position: 'relative',
  },
  backBtn: {
    position: 'absolute', top: 56, left: SPACING.lg, backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: RADIUS.full, width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
  },
  backBtnText: { fontSize: 20, color: COLORS.primary, fontWeight: '700' },
  imageBadges: { position: 'absolute', bottom: SPACING.md, flexDirection: 'row', gap: SPACING.sm },
  badge: { backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  detailsCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg, marginTop: -SPACING.lg,
  },
  productName: { fontSize: 22, fontWeight: '800', color: COLORS.text.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { color: COLORS.text.muted, fontSize: 12, marginLeft: 4 },
  price: { fontSize: 28, fontWeight: '900', color: COLORS.accent, marginTop: SPACING.sm },
  carbonHighlight: {
    backgroundColor: `${COLORS.primary}12`, borderRadius: RADIUS.md,
    padding: SPACING.md, marginTop: SPACING.md,
  },
  carbonHighlightText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  carbonHighlightSub: { color: COLORS.text.secondary, fontSize: 12, marginTop: 4 },
  separator: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.sm },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
  infoEmoji: { fontSize: 20, marginRight: SPACING.sm },
  infoLabel: { fontSize: 11, color: COLORS.text.muted },
  infoValue: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  branchCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md, padding: SPACING.md,
  },
  branchEmoji: { fontSize: 32, marginRight: SPACING.sm },
  branchName: { fontWeight: '700', color: COLORS.text.primary },
  branchSub: { fontSize: 12, color: COLORS.text.muted },
  branchTag: { color: COLORS.success, fontSize: 12, fontWeight: '700' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface, flexDirection: 'row', alignItems: 'center',
    padding: SPACING.md, paddingBottom: 30, gap: SPACING.sm, ...SHADOWS.card,
  },
  qtyControl: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.primary,
  },
  qtyBtn: { width: 36, height: 44, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontSize: 20, color: COLORS.primary, fontWeight: '700' },
  qtyValue: { width: 30, textAlign: 'center', fontWeight: '800', color: COLORS.text.primary },
  addToCartBtn: {
    flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    height: 44, alignItems: 'center', justifyContent: 'center', ...SHADOWS.card,
  },
  addToCartText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  missingState: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.lg },
  missingText: { color: COLORS.text.muted, marginTop: SPACING.md, fontSize: 16, textAlign: 'center' },
  backMissingBtn: {
    marginTop: SPACING.lg, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md, backgroundColor: COLORS.primary,
  },
  backMissingBtnText: { color: '#fff', fontWeight: '700' },
});

export default ProductDetailScreen;
