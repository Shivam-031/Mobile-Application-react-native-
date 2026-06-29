import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';
import { INDIA_STATES_GEO, INDIA_VIEWBOX } from '../../data/indiaStates';
import { colorForValue, GREEN_SCALE } from './HeatmapLegend';

/**
 * India heatmap rendered as per-state SVG paths.
 *
 * Props:
 *   - stateValues: { [stateName]: number } — carbon-saved (or other metric) per state.
 *   - onStatePress: (stateName) => void
 *   - getValue: (stateName) => number      — optional override; defaults to stateValues[name].
 *   - minValue/maxValue: optional scale clamp; defaults to min/max of supplied data.
 *
 * Each state has a fill color derived from its value; missing states use the
 * lightest green. Tapping a state calls onStatePress. State-name labels are
 * rendered at each state's centroid with a stroke + fill so they read on
 * either light or dark green.
 */
const IndiaHeatmapSvg = ({
  stateValues = {},
  onStatePress,
  getValue,
  minValue,
  maxValue,
  showLabels = true,
}) => {
  const [pressed, setPressed] = useState(null);

  const { min, max } = useMemo(() => {
    if (typeof minValue === 'number' && typeof maxValue === 'number') {
      return { min: minValue, max: maxValue };
    }
    const vals = INDIA_STATES_GEO.map((s) =>
      getValue ? getValue(s.name) : stateValues[s.name],
    ).filter((v) => typeof v === 'number' && !Number.isNaN(v));
    if (!vals.length) return { min: 0, max: 1 };
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [stateValues, getValue, minValue, maxValue]);

  const range = max - min || 1;

  const fillFor = (name) => {
    const v = getValue ? getValue(name) : stateValues[name];
    if (typeof v !== 'number' || Number.isNaN(v)) return GREEN_SCALE[0];
    return colorForValue((v - min) / range);
  };

  // Label font size scales with state bounding-box height; tiny states get a
  // minimum legible size so abbreviations like "DL" still read.
  const fontSizeFor = (h, name) => {
    if (h < 12) return 7;   // degenerate (Lakshadweep, Chandigarh) — handled by abbrev
    if (h < 25) return 8;   // very small (Delhi, Goa, Sikkim)
    if (h < 60) return 9;   // small (Tripura, Nagaland)
    if (h < 110) return 10; // medium
    if (h < 180) return 11; // large
    return 12;              // very large (Rajasthan, MP, Maharashtra, UP, Karnataka, A&N)
  };

  // For very small states a full name won't fit. Show an abbreviation.
  // Some states have large bboxes because of distant enclaves (Puducherry's
  // Yanam/Mahé) but the actual piece the label sits on is tiny — force an
  // abbreviation for those.
  const FORCE_ABBREV = new Set(['Puducherry', 'Andaman and Nicobar Islands']);
  const labelFor = (name, w) => {
    if (FORCE_ABBREV.has(name)) {
      const abbrevMap = {
        'Andaman and Nicobar Islands': 'A&N',
        'Puducherry': 'PY',
      };
      return abbrevMap[name];
    }
    if (w >= 70) return name;
    if (name === 'Andaman and Nicobar Islands') return 'A&N';
    if (name === 'Dadra and Nagar Haveli and Daman and Diu') return 'DNH&DD';
    if (name === 'Jammu and Kashmir') return 'J&K';
    if (name === 'Andhra Pradesh') return 'AP';
    if (name === 'Arunachal Pradesh') return 'AR';
    if (name === 'Himachal Pradesh') return 'HP';
    if (name === 'Madhya Pradesh') return 'MP';
    if (name === 'Tamil Nadu') return 'TN';
    if (name === 'Uttar Pradesh') return 'UP';
    if (name === 'West Bengal') return 'WB';
    if (name === 'Chhattisgarh') return 'CG';
    if (name === 'Jharkhand') return 'JH';
    if (name === 'Meghalaya') return 'ML';
    if (name === 'Nagaland') return 'NL';
    if (name === 'Manipur') return 'MN';
    if (name === 'Mizoram') return 'MZ';
    if (name === 'Tripura') return 'TR';
    if (name === 'Odisha') return 'OD';
    if (name === 'Karnataka') return 'KA';
    if (name === 'Kerala') return 'KL';
    if (name === 'Maharashtra') return 'MH';
    if (name === 'Gujarat') return 'GJ';
    if (name === 'Rajasthan') return 'RJ';
    if (name === 'Punjab') return 'PB';
    if (name === 'Haryana') return 'HR';
    if (name === 'Bihar') return 'BR';
    if (name === 'Assam') return 'AS';
    if (name === 'Goa') return 'GA';
    if (name === 'Delhi') return 'DL';
    if (name === 'Sikkim') return 'SK';
    if (name === 'Telangana') return 'TG';
    if (name === 'Ladakh') return 'LA';
    if (name === 'Lakshadweep') return 'LD';
    if (name === 'Puducherry') return 'PY';
    if (name === 'Chandigarh') return 'CH';
    return name;
  };

  return (
    <View style={styles.container}>
      <Svg
        viewBox={`0 0 ${INDIA_VIEWBOX.width} ${INDIA_VIEWBOX.height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Drop shadow under India (subtle). */}
        <G opacity={0.18} transform="translate(0,4)">
          {INDIA_STATES_GEO.map((s) => (
            <Path
              key={`shadow-${s.slug || s.name}`}
              d={s.d}
              fill="#000"
            />
          ))}
        </G>

        {/* States */}
        {INDIA_STATES_GEO.map((s) => {
          const isPressed = pressed === s.name;
          return (
            <Path
              key={s.slug || s.name}
              d={s.d}
              fill={fillFor(s.name)}
              stroke={isPressed ? COLORS.primaryDark : '#FFFFFF'}
              strokeWidth={isPressed ? 1.6 : 0.8}
              strokeLinejoin="round"
              opacity={isPressed ? 1 : 0.95}
              onPress={() => {
                setPressed(s.name);
                onStatePress?.(s.name);
              }}
              onPressIn={() => setPressed(s.name)}
              onPressOut={() => setPressed(null)}
            />
          );
        })}

        {/* Labels — two-pass: a white-stroke "halo" text behind a dark fill text.
            Works on both light and dark green fills. pointerEvents="none" lets
            the underlying <Path> catch taps. */}
        {showLabels && INDIA_STATES_GEO.map((s) => {
          const text = labelFor(s.name, s.w);
          const fs = fontSizeFor(s.h, s.name);
          const cx = s.cx;
          const cy = s.cy + fs / 3; // visual center vs baseline
          return (
            <G
              key={`lbl-${s.slug || s.name}`}
              pointerEvents="none"
            >
              <SvgText
                x={cx}
                y={cy}
                fontSize={fs}
                fontWeight="700"
                textAnchor="middle"
                fill="#1A2E1A"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                paintOrder="stroke fill"
              >
                {text}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
  },
});

export default IndiaHeatmapSvg;