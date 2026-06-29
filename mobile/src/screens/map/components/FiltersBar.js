import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../../constants/theme';

const TIER_OPTIONS = [
  { id: 'all', label: 'All tiers', emoji: '🏷️' },
  { id: 'platinum', label: 'Platinum (85+)', emoji: '💎' },
  { id: 'gold', label: 'Gold (70+)', emoji: '🥇' },
  { id: 'silver', label: 'Silver (55+)', emoji: '🥈' },
];

const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All', emoji: '🏷️' },
  { id: 'pots', label: 'Pots', emoji: '🏺' },
  { id: 'plants', label: 'Plants', emoji: '🌱' },
  { id: 'decor', label: 'Decor', emoji: '🎨' },
  { id: 'accessories', label: 'Accessories', emoji: '🧺' },
];

/**
 * FiltersBar — Horizontal scrollable chip rows for district, category, tier.
 * Renders the union of unique districts from the cities so the chips adapt
 * to whatever state is currently loaded.
 */
const FiltersBar = ({ filters, onChange, cities }) => {
  const districts = useMemo(() => {
    const set = new Set((cities || []).map((c) => c.district));
    return ['all', ...Array.from(set).sort()];
  }, [cities]);

  const Chip = ({ active, label, emoji, onPress }) => (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={styles.chipEmoji}>{emoji}</Text>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  const isActive = (group, id) => filters?.[group] === id;

  return (
    <View style={styles.wrap}>
      <Row title="📍 District">
        {districts.map((d) => (
          <Chip
            key={d}
            active={isActive('district', d)}
            emoji="📍"
            label={d === 'all' ? 'All' : d}
            onPress={() => onChange({ ...filters, district: d })}
          />
        ))}
      </Row>

      <Row title="🛒 Category">
        {CATEGORY_OPTIONS.map((c) => (
          <Chip
            key={c.id}
            active={isActive('category', c.id)}
            emoji={c.emoji}
            label={c.label}
            onPress={() => onChange({ ...filters, category: c.id })}
          />
        ))}
      </Row>

      <Row title="⭐ Sustainability tier">
        {TIER_OPTIONS.map((t) => (
          <Chip
            key={t.id}
            active={isActive('sustainabilityTier', t.id)}
            emoji={t.emoji}
            label={t.label}
            onPress={() => onChange({ ...filters, sustainabilityTier: t.id })}
          />
        ))}
      </Row>

      {(filters?.district !== 'all' || filters?.category !== 'all' || filters?.sustainabilityTier !== 'all') && (
        <TouchableOpacity
          style={styles.reset}
          onPress={() => onChange({ district: 'all', category: 'all', sustainabilityTier: 'all' })}
        >
          <Text style={styles.resetTxt}>↺ Reset filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const Row = ({ title, children }) => (
  <View style={{ marginBottom: 6 }}>
    <Text style={styles.rowTitle}>{title}</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {children}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  rowTitle: {
    fontSize: 10, fontWeight: '800', color: COLORS.text.secondary,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4, marginLeft: 2,
  },
  row: { gap: 6, paddingRight: SPACING.md },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full, backgroundColor: `${COLORS.primary}12`,
    borderWidth: 1, borderColor: 'transparent',
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primaryDark },
  chipEmoji: { fontSize: 11 },
  chipText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  chipTextActive: { color: '#fff' },
  reset: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.error + '15',
    marginTop: 4,
  },
  resetTxt: { fontSize: 11, fontWeight: '700', color: COLORS.error },
});

export default FiltersBar;