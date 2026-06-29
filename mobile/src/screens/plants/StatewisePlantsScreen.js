import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const STATE_PLANT_DATA = [
  { state: 'Kerala', plants: 890, native: 620, protected: 45, topSpecies: ['Kerala Orchid', 'Ashoka Tree', 'Areca Palm'], carbonHigh: 68, emoji: '🌴' },
  { state: 'Karnataka', plants: 720, native: 510, protected: 38, topSpecies: ['Indian Rosewood', 'Teak', 'Neem'], carbonHigh: 72, emoji: '🌳' },
  { state: 'Maharashtra', plants: 500, native: 360, protected: 22, topSpecies: ['Neem', 'Peepal', 'Mango'], carbonHigh: 55, emoji: '🌿' },
  { state: 'Assam', plants: 640, native: 480, protected: 52, topSpecies: ['Bamboo', 'Tea Plant', 'Orchids'], carbonHigh: 80, emoji: '🎋' },
  { state: 'Rajasthan', plants: 310, native: 240, protected: 12, topSpecies: ['Khejri', 'Acacia', 'Ber'], carbonHigh: 38, emoji: '🌵' },
  { state: 'Tamil Nadu', plants: 640, native: 460, protected: 35, topSpecies: ['Neem', 'Banyan', 'Coconut'], carbonHigh: 62, emoji: '🥥' },
  { state: 'Madhya Pradesh', plants: 420, native: 310, protected: 28, topSpecies: ['Mahua', 'Teak', 'Bamboo'], carbonHigh: 58, emoji: '🌲' },
  { state: 'West Bengal', plants: 560, native: 400, protected: 30, topSpecies: ['Sundari', 'Neem', 'Bamboo'], carbonHigh: 60, emoji: '🌾' },
  { state: 'Gujarat', plants: 340, native: 250, protected: 18, topSpecies: ['Neem', 'Babul', 'Teak'], carbonHigh: 42, emoji: '🌿' },
  { state: 'Uttar Pradesh', plants: 280, native: 200, protected: 10, topSpecies: ['Peepal', 'Neem', 'Tulsi'], carbonHigh: 35, emoji: '🌸' },
  { state: 'Manipur', plants: 460, native: 350, protected: 42, topSpecies: ['Bamboo', 'Orchids', 'Loktak Plants'], carbonHigh: 75, emoji: '🎋' },
  { state: 'Odisha', plants: 390, native: 290, protected: 25, topSpecies: ['Mahua', 'Sal', 'Bamboo'], carbonHigh: 52, emoji: '🌳' },
  { state: 'Delhi', plants: 210, native: 140, protected: 8, topSpecies: ['Neem', 'Peepal', 'Ashoka'], carbonHigh: 28, emoji: '🌱' },
  { state: 'Punjab', plants: 180, native: 130, protected: 6, topSpecies: ['Neem', 'Shisham', 'Poplar'], carbonHigh: 25, emoji: '🌾' },
  { state: 'Meghalaya', plants: 580, native: 440, protected: 50, topSpecies: ['Orchids', 'Bamboo', 'Ferns'], carbonHigh: 82, emoji: '🌺' },
];

const SORT_OPTIONS = [
  { id: 'plants', label: '🌿 Most Plants' },
  { id: 'protected', label: '🛡️ Most Protected' },
  { id: 'carbon', label: '🌍 Highest Carbon' },
];

const StatewisePlantsScreen = ({ navigation }) => {
  const [sort, setSort] = useState('plants');
  const [selected, setSelected] = useState(null);

  const sorted = [...STATE_PLANT_DATA].sort((a, b) => {
    if (sort === 'plants') return b.plants - a.plants;
    if (sort === 'protected') return b.protected - a.protected;
    if (sort === 'carbon') return b.carbonHigh - a.carbonHigh;
    return 0;
  });

  const totalPlants = STATE_PLANT_DATA.reduce((a, s) => a + s.plants, 0);
  const totalProtected = STATE_PLANT_DATA.reduce((a, s) => a + s.protected, 0);
  const topState = sorted[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🗺️ State-wise Plants</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>🌿 India Plant Biodiversity</Text>
          <View style={styles.summaryStats}>
            {[
              { label: 'Total Species', value: totalPlants.toLocaleString(), emoji: '🌱' },
              { label: 'Protected', value: totalProtected, emoji: '🛡️' },
              { label: 'States', value: STATE_PLANT_DATA.length, emoji: '🗺️' },
            ].map((s) => (
              <View key={s.label} style={styles.summaryStat}>
                <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
                <Text style={styles.summaryStatValue}>{s.value}</Text>
                <Text style={styles.summaryStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.topStateBadge}>
            <Text style={styles.topStateTxt}>🏆 Richest State: {topState?.state} with {topState?.plants} species</Text>
          </View>
        </View>

        {/* Sort */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[styles.sortChip, sort === opt.id && styles.sortChipActive]}
              onPress={() => setSort(opt.id)}
            >
              <Text style={[styles.sortChipText, sort === opt.id && { color: '#fff' }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* State Cards */}
        <View style={styles.list}>
          {sorted.map((item, index) => (
            <TouchableOpacity
              key={item.state}
              style={[styles.stateCard, selected === item.state && styles.stateCardExpanded]}
              onPress={() => setSelected(selected === item.state ? null : item.state)}
              activeOpacity={0.85}
            >
              <View style={styles.stateCardHeader}>
                <View style={styles.stateRank}>
                  <Text style={styles.stateRankText}>#{index + 1}</Text>
                </View>
                <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                  <Text style={styles.stateName}>{item.state}</Text>
                  <Text style={styles.stateTotal}>{item.plants} plant species</Text>
                </View>
                <View style={styles.stateStats}>
                  <Text style={styles.stateStatNative}>{item.native} native</Text>
                  <Text style={styles.stateStatProtected}>🛡️ {item.protected}</Text>
                </View>
                <Text style={styles.expandArrow}>{selected === item.state ? '▲' : '▼'}</Text>
              </View>

              {/* Carbon bar */}
              <View style={styles.carbonBarRow}>
                <Text style={styles.carbonBarLabel}>🌍 Carbon absorption</Text>
                <View style={styles.carbonBarBg}>
                  <View style={[styles.carbonBarFill, { width: `${item.carbonHigh}%` }]} />
                </View>
                <Text style={styles.carbonBarValue}>{item.carbonHigh}%</Text>
              </View>

              {/* Expanded detail */}
              {selected === item.state && (
                <View style={styles.expandedDetail}>
                  <Text style={styles.expandedTitle}>Top Species in {item.state}</Text>
                  <View style={styles.speciesRow}>
                    {item.topSpecies.map((sp) => (
                      <View key={sp} style={styles.speciesChip}>
                        <Text style={styles.speciesChipText}>🌱 {sp}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.expandedStats}>
                    <View style={styles.expandedStat}>
                      <Text style={styles.expandedStatValue}>{item.native}</Text>
                      <Text style={styles.expandedStatLabel}>Native Species</Text>
                    </View>
                    <View style={styles.expandedStat}>
                      <Text style={[styles.expandedStatValue, { color: '#FF9800' }]}>{item.protected}</Text>
                      <Text style={styles.expandedStatLabel}>Protected</Text>
                    </View>
                    <View style={styles.expandedStat}>
                      <Text style={[styles.expandedStatValue, { color: COLORS.primary }]}>{item.carbonHigh}%</Text>
                      <Text style={styles.expandedStatLabel}>Carbon Idx</Text>
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 40 }} />
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
  summaryCard: {
    backgroundColor: COLORS.primary, margin: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.lg,
  },
  summaryTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: SPACING.md },
  summaryStats: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryStat: { alignItems: 'center' },
  summaryStatValue: { fontSize: 20, fontWeight: '900', color: '#fff', marginTop: 4 },
  summaryStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  topStateBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.sm,
    padding: SPACING.sm, marginTop: SPACING.md,
  },
  topStateTxt: { color: '#fff', fontSize: 12, fontWeight: '600', textAlign: 'center' },
  sortRow: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    paddingHorizontal: SPACING.md, gap: 8, marginBottom: SPACING.sm,
  },
  sortLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary },
  sortChip: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 6, ...SHADOWS.card,
  },
  sortChipActive: { backgroundColor: COLORS.primary },
  sortChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text.secondary },
  list: { paddingHorizontal: SPACING.md, gap: SPACING.sm },
  stateCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, ...SHADOWS.card },
  stateCardExpanded: { borderWidth: 1.5, borderColor: COLORS.primary },
  stateCardHeader: { flexDirection: 'row', alignItems: 'center' },
  stateRank: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm,
  },
  stateRankText: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  stateName: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary },
  stateTotal: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  stateStats: { alignItems: 'flex-end', marginRight: SPACING.sm },
  stateStatNative: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  stateStatProtected: { fontSize: 11, color: '#FF9800', fontWeight: '600', marginTop: 2 },
  expandArrow: { fontSize: 12, color: COLORS.text.muted },
  carbonBarRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: SPACING.sm },
  carbonBarLabel: { fontSize: 10, color: COLORS.text.muted, width: 110 },
  carbonBarBg: { flex: 1, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  carbonBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  carbonBarValue: { fontSize: 10, fontWeight: '700', color: COLORS.primary, width: 30, textAlign: 'right' },
  expandedDetail: { marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
  expandedTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.sm },
  speciesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  speciesChip: {
    backgroundColor: `${COLORS.primary}12`, borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  speciesChipText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  expandedStats: { flexDirection: 'row', justifyContent: 'space-around' },
  expandedStat: { alignItems: 'center' },
  expandedStatValue: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },
  expandedStatLabel: { fontSize: 10, color: COLORS.text.muted, marginTop: 2 },
});

export default StatewisePlantsScreen;
