import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, TextInput, Modal,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const PLANT_DATA = [
  { _id: '1', name: 'Neem', scientific: 'Azadirachta indica', count: 1200, region: 'Pan India', benefits: 'Antibacterial, air purifier', carbonAbsorption: 'High', category: 'native', emoji: '🌳', states: ['Maharashtra', 'Delhi', 'UP', 'Rajasthan'] },
  { _id: '2', name: 'Peepal', scientific: 'Ficus religiosa', count: 980, region: 'Pan India', benefits: 'Oxygen 24/7, sacred tree', carbonAbsorption: 'Very High', category: 'native', emoji: '🌳', states: ['UP', 'Bihar', 'Delhi'] },
  { _id: '3', name: 'Tulsi', scientific: 'Ocimum tenuiflorum', count: 5000, region: 'Pan India', benefits: 'Medicinal, antiseptic', carbonAbsorption: 'Medium', category: 'native', emoji: '🌿', states: ['Kerala', 'Tamil Nadu', 'Karnataka'] },
  { _id: '4', name: 'Bamboo', scientific: 'Bambusoideae', count: 450, region: 'Northeast India', benefits: 'Fastest carbon absorber', carbonAbsorption: 'Very High', category: 'native', emoji: '🎋', states: ['Manipur', 'Assam', 'Meghalaya'] },
  { _id: '5', name: 'Kerala Orchid', scientific: 'Vanda tessellata', count: 120, region: 'Kerala', benefits: 'Rare endemic species', carbonAbsorption: 'Low', category: 'protected', emoji: '🌸', states: ['Kerala'] },
  { _id: '6', name: 'Ashoka Tree', scientific: 'Saraca asoca', count: 340, region: 'Western Ghats', benefits: 'Medicinal, sacred', carbonAbsorption: 'High', category: 'protected', emoji: '🌺', states: ['Kerala', 'Karnataka', 'Goa'] },
  { _id: '7', name: 'Indian Rosewood', scientific: 'Dalbergia latifolia', count: 280, region: 'Deccan Plateau', benefits: 'Timber, shade tree', carbonAbsorption: 'Very High', category: 'native', emoji: '🌲', states: ['Maharashtra', 'Karnataka'] },
  { _id: '8', name: 'Khejri', scientific: 'Prosopis cineraria', count: 890, region: 'Rajasthan', benefits: 'Desert survival, nitrogen fixer', carbonAbsorption: 'Medium', category: 'native', emoji: '🌵', states: ['Rajasthan', 'Gujarat'] },
  { _id: '9', name: 'Mahua', scientific: 'Madhuca longifolia', count: 520, region: 'Central India', benefits: 'Tribal livelihoods, food', carbonAbsorption: 'High', category: 'native', emoji: '🌼', states: ['MP', 'Jharkhand', 'Odisha'] },
  { _id: '10', name: 'Areca Palm', scientific: 'Dypsis lutescens', count: 760, region: 'South India', benefits: 'Air purifier, ornamental', carbonAbsorption: 'Medium', category: 'exotic', emoji: '🌴', states: ['Kerala', 'Tamil Nadu'] },
];

const STATS = [
  { label: 'Total Species', value: '250', emoji: '🌿', color: COLORS.primary },
  { label: 'Native Species', value: '180', emoji: '🇮🇳', color: '#4CAF50' },
  { label: 'Protected', value: '30', emoji: '🛡️', color: '#FF9800' },
  { label: 'States Covered', value: '15', emoji: '📍', color: '#795548' },
];

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'native', label: '🌱 Native' },
  { id: 'protected', label: '🛡️ Protected' },
  { id: 'exotic', label: '🌺 Exotic' },
];

const CARBON_COLOR = { Low: '#FF9800', Medium: '#2196F3', High: '#4CAF50', 'Very High': '#2F6B3F' };

const PlantCard = ({ plant, onPress }) => (
  <TouchableOpacity style={styles.plantCard} onPress={() => onPress(plant)} activeOpacity={0.85}>
    <View style={styles.plantCardLeft}>
      <Text style={{ fontSize: 44 }}>{plant.emoji}</Text>
    </View>
    <View style={styles.plantCardBody}>
      <View style={styles.plantCardHeader}>
        <Text style={styles.plantName}>{plant.name}</Text>
        <View style={[styles.carbonBadge, { backgroundColor: CARBON_COLOR[plant.carbonAbsorption] }]}>
          <Text style={styles.carbonBadgeText}>{plant.carbonAbsorption} CO₂</Text>
        </View>
      </View>
      <Text style={styles.plantScientific}>{plant.scientific}</Text>
      <Text style={styles.plantRegion}>📍 {plant.region}</Text>
      <View style={styles.plantFooter}>
        <Text style={styles.plantCount}>🌱 {plant.count.toLocaleString()} trees tracked</Text>
        {plant.category === 'protected' && <Text style={styles.protectedTag}>🛡️ Protected</Text>}
      </View>
    </View>
  </TouchableOpacity>
);

const PlantDetailModal = ({ plant, onClose }) => {
  if (!plant) return null;
  return (
    <Modal visible={!!plant} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <Text style={styles.modalCloseTxt}>✕ Close</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: SPACING.lg }}>
          <Text style={{ fontSize: 80, textAlign: 'center' }}>{plant.emoji}</Text>
          <Text style={styles.modalTitle}>{plant.name}</Text>
          <Text style={styles.modalScientific}>{plant.scientific}</Text>

          <View style={[styles.carbonHighlight, { backgroundColor: `${CARBON_COLOR[plant.carbonAbsorption]}20` }]}>
            <Text style={[styles.carbonHighlightTxt, { color: CARBON_COLOR[plant.carbonAbsorption] }]}>
              🌍 Carbon Absorption: {plant.carbonAbsorption}
            </Text>
          </View>

          <View style={styles.modalStats}>
            {[
              { label: 'Trees Tracked', value: plant.count.toLocaleString(), emoji: '🌳' },
              { label: 'Region', value: plant.region, emoji: '📍' },
              { label: 'Category', value: plant.category, emoji: '🏷️' },
              { label: 'States', value: plant.states.length, emoji: '🗺️' },
            ].map((s) => (
              <View key={s.label} style={styles.modalStatCard}>
                <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
                <Text style={styles.modalStatValue}>{s.value}</Text>
                <Text style={styles.modalStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Benefits</Text>
            <Text style={styles.modalSectionText}>{plant.benefits}</Text>
          </View>

          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>Found in States</Text>
            <View style={styles.stateTagRow}>
              {plant.states.map((s) => (
                <View key={s} style={styles.stateTag}>
                  <Text style={styles.stateTagText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const PlantDashboardScreen = () => {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPlant, setSelectedPlant] = useState(null);

  const filtered = PLANT_DATA
    .filter((p) => category === 'all' || p.category === category)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.region.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.container}>
      {/* Top section — non-scrolling, fixed-height content above the list.
          Wrapping in <View> (not ScrollView) lets the FlatList claim the rest
          of the screen without overlapping the chips. */}
      <View style={styles.topSection}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🌿 Plant Biodiversity</Text>
          <Text style={styles.headerSub}>India's Green Heritage Dashboard</Text>
        </View>

        {/* Stats — uniform 2x2 grid so all 4 cards share the same height & baseline */}
        <View style={styles.statsGrid}>
          {STATS.map((s) => (
            <View key={s.label} style={[styles.statCard, { borderTopColor: s.color }]}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={[styles.statValue, { color: s.color }]} numberOfLines={1}>{s.value}</Text>
              <Text style={styles.statLabel} numberOfLines={1}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search plants, regions..."
            placeholderTextColor={COLORS.text.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {CATEGORIES.map((c) => {
            const isActive = category === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                activeOpacity={0.85}
                style={[styles.catChip, isActive && styles.catChipActive]}
                onPress={() => setCategory(c.id)}
              >
                <Text
                  numberOfLines={1}
                  allowFontScaling={false}
                  style={[styles.catChipText, isActive && styles.catChipTextActive]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.resultCount}>{filtered.length} species found</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p._id}
        contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, gap: SPACING.sm, paddingBottom: 80 }}
        renderItem={({ item }) => <PlantCard plant={item} onPress={setSelectedPlant} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ fontSize: 48 }}>🌱</Text>
            <Text style={styles.emptyText}>No plants found</Text>
          </View>
        }
      />

      <PlantDetailModal plant={selectedPlant} onClose={() => setSelectedPlant(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // Wraps header + stats + search + chips + result count so the FlatList
  // can't visually overlap them. Sized by content (not flex:1) so the
  // list claims the remaining vertical space.
  topSection: {
    paddingBottom: SPACING.xs,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  header: { paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.sm },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text.primary },
  headerSub: { fontSize: 13, color: COLORS.text.muted, marginTop: 2 },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SPACING.md, gap: SPACING.sm,
    paddingBottom: SPACING.sm, paddingTop: SPACING.sm,
  },
  statCard: {
    flexBasis: '48%', flexGrow: 1,
    height: 96,                          // fixed height → all 4 cards same size
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderTopWidth: 3,
    alignItems: 'center', justifyContent: 'center',  // vertical center everything
    ...SHADOWS.card,
  },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '900', lineHeight: 26 },  // fixed lineHeight → aligned baselines
  statLabel: {
    fontSize: 11, color: COLORS.text.muted, marginTop: 4,
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4,
    textAlign: 'center',
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm, ...SHADOWS.card,
  },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: COLORS.text.primary },
  catRow: {
    paddingHorizontal: SPACING.md, gap: 8,
    paddingBottom: SPACING.sm,
    // No alignItems: let the chip's own height define the row. Chips are
    // explicitly height: 38 so they line up regardless of emoji vs text glyphs.
  },
  catChip: {
    height: 38,                                // ↑ from 34 — fits emoji + lineHeight cleanly
    minWidth: 92,                              // ↑ from 84 — short labels like "All" stay readable
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',                        // clip any glyph that tries to overflow
    ...SHADOWS.card,
  },
  catChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catChipText: {
    fontSize: 13,                              // ↑ from 12
    fontWeight: '700',
    color: COLORS.text.secondary,
    lineHeight: 18,                            // ↑ from 16 — text glyphs center predictably
    includeFontPadding: false,
    textAlignVertical: 'center',               // Android: vertical center inside chip
    textAlign: 'center',
  },
  catChipTextActive: { color: '#fff' },
  resultCount: { fontSize: 12, color: COLORS.text.muted, paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  plantCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, flexDirection: 'row',
    overflow: 'hidden', ...SHADOWS.card,
  },
  plantCardLeft: {
    width: 50, backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center', justifyContent: 'center',
  },
  plantCardBody: { flex: 1, padding: SPACING.md },
  plantCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  plantName: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary, flex: 1 },
  carbonBadge: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 4 },
  carbonBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  plantScientific: { fontSize: 11, color: COLORS.text.muted, fontStyle: 'italic', marginTop: 2 },
  plantRegion: { fontSize: 11, color: COLORS.text.secondary, marginTop: 2 },
  plantFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm },
  plantCount: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  protectedTag: { fontSize: 10, color: '#FF9800', fontWeight: '700' },
  emptyText: { fontSize: 16, color: COLORS.text.muted, marginTop: SPACING.md },
  // Modal
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: { paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.sm, flexDirection: 'row', justifyContent: 'flex-end' },
  modalCloseBtn: { backgroundColor: `${COLORS.primary}15`, borderRadius: RADIUS.md, paddingHorizontal: 16, paddingVertical: 8 },
  modalCloseTxt: { color: COLORS.primary, fontWeight: '700' },
  modalTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text.primary, textAlign: 'center', marginTop: SPACING.sm },
  modalScientific: { fontSize: 14, color: COLORS.text.muted, fontStyle: 'italic', textAlign: 'center', marginTop: 4 },
  carbonHighlight: { borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.md, alignItems: 'center' },
  carbonHighlightTxt: { fontWeight: '700', fontSize: 14 },
  modalStats: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.md },
  modalStatCard: {
    flex: 1, minWidth: '45%', backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, alignItems: 'center', ...SHADOWS.card,
  },
  modalStatValue: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginTop: 4 },
  modalStatLabel: { fontSize: 11, color: COLORS.text.muted },
  modalSection: { marginTop: SPACING.lg },
  modalSectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.sm },
  modalSectionText: { fontSize: 14, color: COLORS.text.secondary, lineHeight: 22 },
  stateTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stateTag: { backgroundColor: `${COLORS.primary}15`, borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 6 },
  stateTagText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
});

export default PlantDashboardScreen;
