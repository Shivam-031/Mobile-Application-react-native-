import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

const BADGE_CONFIGS = {
  eco: { emoji: '🌿', label: 'Eco Certified', bg: '#E8F5E9', color: '#2F6B3F' },
  organic: { emoji: '🌱', label: 'Organic', bg: '#F1F8E9', color: '#558B2F' },
  handmade: { emoji: '✋', label: 'Handmade', bg: '#FFF3E0', color: '#E65100' },
  carbon: { emoji: '🌍', label: 'Carbon Positive', bg: '#E0F7FA', color: '#00838F' },
  local: { emoji: '📍', label: 'Local Artisan', bg: '#FCE4EC', color: '#C2185B' },
  protected: { emoji: '🛡️', label: 'Protected Species', bg: '#FFF8E1', color: '#F57F17' },
};

const EcoBadge = ({ type = 'eco', size = 'sm' }) => {
  const cfg = BADGE_CONFIGS[type] || BADGE_CONFIGS.eco;
  const isLg = size === 'lg';
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }, isLg && styles.badgeLg]}>
      <Text style={[styles.emoji, isLg && styles.emojiLg]}>{cfg.emoji}</Text>
      {(size === 'lg' || size === 'md') && (
        <Text style={[styles.label, { color: cfg.color }, isLg && styles.labelLg]}>{cfg.label}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3, gap: 3,
  },
  badgeLg: { paddingHorizontal: 12, paddingVertical: 6 },
  emoji: { fontSize: 11 },
  emojiLg: { fontSize: 16 },
  label: { fontSize: 10, fontWeight: '700' },
  labelLg: { fontSize: 13 },
});

export default EcoBadge;
