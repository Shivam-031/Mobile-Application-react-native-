import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../../constants/theme';

const SORT_OPTIONS = [
  { id: 'revenue', label: 'Revenue', emoji: '💰' },
  { id: 'orders', label: 'Orders', emoji: '📦' },
  { id: 'carbonSaved', label: 'Carbon', emoji: '🌿' },
  { id: 'treesPlanted', label: 'Trees', emoji: '🌳' },
  { id: 'growthPct', label: 'Growth', emoji: '📈' },
];

const SortBar = ({ sortBy, onChange }) => (
  <View style={styles.wrap}>
    <Text style={styles.title}>↕ Sort by</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {SORT_OPTIONS.map((s) => {
        const active = sortBy === s.id;
        return (
          <TouchableOpacity
            key={s.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(s.id)}
          >
            <Text style={styles.emoji}>{s.emoji}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{s.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  title: {
    fontSize: 10, fontWeight: '800', color: COLORS.text.secondary,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4, marginLeft: 2,
  },
  row: { gap: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.full, backgroundColor: `${COLORS.primary}12`,
  },
  chipActive: { backgroundColor: COLORS.primary },
  emoji: { fontSize: 11 },
  label: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  labelActive: { color: '#fff' },
});

export default SortBar;