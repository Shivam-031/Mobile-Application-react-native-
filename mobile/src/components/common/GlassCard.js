import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../../constants/theme';

/**
 * GlassCard - Frosted glass effect card component
 * Uses semi-transparent background with border + shadow to simulate glassmorphism
 */
const GlassCard = ({ children, style, dark = false }) => (
  <View style={[styles.glass, dark && styles.glassDark, style]}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    overflow: 'hidden',
  },
  glassDark: {
    backgroundColor: 'rgba(47, 107, 63, 0.15)',
    borderColor: 'rgba(47, 107, 63, 0.3)',
  },
});

export default GlassCard;
