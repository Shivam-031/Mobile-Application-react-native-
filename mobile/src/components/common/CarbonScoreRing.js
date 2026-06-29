import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '../../constants/theme';

/**
 * CarbonScoreRing - Circular progress indicator for carbon score
 */
const CarbonScoreRing = ({ value = 0, max = 500, size = 100, label = 'kg CO₂' }) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, value / max);
  const strokeDashoffset = circumference * (1 - pct);
  const color = pct < 0.4 ? '#4CAF50' : pct < 0.7 ? '#FF9800' : '#F44336';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Background ring */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={`${COLORS.border}`} strokeWidth={8} fill="none"
        />
        {/* Progress ring */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={8} fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.content}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center' },
  value: { fontSize: 18, fontWeight: '900' },
  label: { fontSize: 9, color: COLORS.text.muted, marginTop: 1 },
});

export default CarbonScoreRing;
