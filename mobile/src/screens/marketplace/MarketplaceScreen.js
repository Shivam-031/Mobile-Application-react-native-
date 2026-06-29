import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productsSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🌿' },
  { id: 'small', label: 'Small Pots', emoji: '🪴' },
  { id: 'medium', label: 'Medium Pots', emoji: '🏺' },
  { id: 'large', label: 'Large Pots', emoji: '🫙' },
  { id: 'decorative', label: 'Decorative', emoji: '🎋' },
  { id: 'custom', label: 'Custom', emoji: '✨' },
];

const SORT_OPTIONS = [
  { id: 'default', label: 'Default' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
  { id: 'carbon', label: 'Most Eco-Friendly' },
];

const ProductCard = ({ product, onPress, onAddToCart }) => (
  <TouchableOpacity style={styles.productCard} onPress={() => onPress(product)} activeOpacity={0.85}>
    <View style={styles.productImage}>
      <Text style={{ fontSize: 48 }}>🏺</Text>
      <View style={styles.ecoBadge}>
        <Text style={styles.ecoBadgeText}>🌍 Eco</Text>
      </View>
    </View>
    <View style={styles.productInfo}>
      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
      <Text style={styles.productLocation}>📍 {product.state || product.location || 'India'}</Text>
      <View style={styles.ratingRow}>
        {Array.from({ length: product.ecoRating || 0 }).map((_, i) => (
          <Text key={i} style={{ fontSize: 10 }}>⭐</Text>
        ))}
      </View>
      <View style={styles.carbonRow}>
        <Text style={styles.carbonText}>🌍 Saves {product.carbonSaved ?? 0} kg CO₂</Text>
      </View>
      <View style={styles.productFooter}>
        <Text style={styles.productPrice}>₹{product.price}</Text>
        <TouchableOpacity style={styles.cartBtn} onPress={() => onAddToCart(product)}>
          <Text style={styles.cartBtnText}>+ Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  </TouchableOpacity>
);

const MarketplaceScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.list);
  const loading = useSelector((state) => state.products.loading);
  const error = useSelector((state) => state.products.error);
  const cartItems = useSelector((state) => state.cart.items);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [showSort, setShowSort] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      await dispatch(fetchProducts({ status: 'approved', limit: 100 })).unwrap();
    } catch {
      // Error is surfaced via state.products.error — render handles it.
    }
  }, [dispatch]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filteredProducts = (products || [])
    .filter((p) => selectedCategory === 'all' || p.category === selectedCategory)
    .filter((p) => {
      const q = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.state?.toLowerCase().includes(q) ||
        p.location?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'carbon') return (b.carbonSaved || 0) - (a.carbonSaved || 0);
      return 0;
    });

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  const totalCartItems = cartItems.reduce((acc, i) => acc + i.qty, 0);
  const totalCarbon = filteredProducts.reduce((acc, p) => acc + (p.carbonSaved || 0), 0).toFixed(1);

  return (
    <View style={styles.container}>
      {/* Top section — non-scrolling content above the grid. Sized by content
          so the FlatList claims the remaining screen and can never overlap. */}
      <View style={styles.topSection}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>🛒 Eco Marketplace</Text>
            <Text style={styles.headerSub}>{filteredProducts.length} products · Saves {totalCarbon} kg CO₂</Text>
          </View>
          <TouchableOpacity
            style={styles.cartIconBtn}
            onPress={() => navigation.navigate('Cart')}
          >
            <Text style={{ fontSize: 24 }}>🛒</Text>
            {totalCartItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalCartItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, states..."
              placeholderTextColor={COLORS.text.muted}
              value={search}
              onChangeText={setSearch}
            />
            {search ? <TouchableOpacity onPress={() => setSearch('')}><Text>✕</Text></TouchableOpacity> : null}
          </View>
          <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort(!showSort)}>
            <Text style={styles.sortBtnText}>⇅ Sort</Text>
          </TouchableOpacity>
        </View>

        {/* Sort Dropdown */}
        {showSort && (
          <View style={styles.sortDropdown}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.sortOption, sortBy === opt.id && styles.sortOptionActive]}
                onPress={() => { setSortBy(opt.id); setShowSort(false); }}
              >
                <Text style={[styles.sortOptionText, sortBy === opt.id && { color: COLORS.primary, fontWeight: '700' }]}>
                  {sortBy === opt.id ? '✓ ' : ''}{opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {CATEGORIES.map((c) => {
            const isActive = selectedCategory === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.85}
                style={[styles.catChip, isActive && styles.catChipActive]}
                onPress={() => setSelectedCategory(c.id)}
              >
                <Text
                  numberOfLines={1}
                  allowFontScaling={false}
                  style={[styles.catChipText, isActive && styles.catChipTextActive]}
                >
                  {c.emoji} {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ gap: SPACING.sm }}
        contentContainerStyle={styles.productGrid}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadProducts} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48 }}>🌿</Text>
              <Text style={styles.emptyText}>
                {error ? error : 'No products found'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={(p) => navigation.navigate('ProductDetail', { product: p })}
            onAddToCart={handleAddToCart}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // Wraps header + search + sort + chips so the FlatList can't overlap them.
  // Sized by content (no flex) → list claims remaining vertical space.
  topSection: {
    paddingBottom: SPACING.xs,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.sm,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text.primary },
  headerSub: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  cartIconBtn: { position: 'relative', padding: 8 },
  cartBadge: {
    position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.error,
    borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  searchRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, gap: SPACING.sm, marginBottom: SPACING.sm },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, ...SHADOWS.card,
  },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: COLORS.text.primary },
  sortBtn: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md,
    justifyContent: 'center', ...SHADOWS.card,
  },
  sortBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  sortDropdown: {
    marginHorizontal: SPACING.md, backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    ...SHADOWS.card, overflow: 'hidden', marginBottom: SPACING.sm,
  },
  sortOption: { padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sortOptionActive: { backgroundColor: `${COLORS.primary}10` },
  sortOptionText: { fontSize: 14, color: COLORS.text.primary },
  catRow: {
    paddingHorizontal: SPACING.md, gap: 8,
    paddingBottom: SPACING.sm,
    alignItems: 'center',
  },
  catChip: {
    height: 38,                       // fixed → all chips identical height
    minWidth: 96,                     // short "All" doesn't shrink below usable
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  catChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catChipText: {
    fontSize: 13, fontWeight: '700',
    color: COLORS.text.secondary,
    lineHeight: 18,                   // fixed → predictable vertical center
    includeFontPadding: false,
    textAlignVertical: 'center',      // Android: center inside the lineHeight box
    textAlign: 'center',
  },
  catChipTextActive: { color: '#fff' },
  productGrid: { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: 80, gap: SPACING.sm },
  productCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, overflow: 'hidden', ...SHADOWS.card,
  },
  productImage: {
    height: 120, backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  ecoBadge: {
    position: 'absolute', top: 8, right: 8, backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2,
  },
  ecoBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  productInfo: { padding: SPACING.sm },
  productName: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary },
  productLocation: { fontSize: 10, color: COLORS.text.muted, marginTop: 2 },
  ratingRow: { flexDirection: 'row', marginTop: 3 },
  carbonRow: { marginTop: 3 },
  carbonText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
  productFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm },
  productPrice: { fontSize: 15, fontWeight: '800', color: COLORS.accent },
  cartBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.sm, paddingHorizontal: 10, paddingVertical: 4 },
  cartBtnText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: COLORS.text.muted, marginTop: SPACING.md },
});

export default MarketplaceScreen;