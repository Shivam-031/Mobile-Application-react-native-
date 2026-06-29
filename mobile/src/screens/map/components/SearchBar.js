import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../../../constants/theme';

/**
 * SearchBar — Debounced city-name search. Calls `onChange` after 250ms of
 * input idle so we don't refilter the list on every keystroke.
 */
const SearchBar = ({ value, onChange, placeholder = 'Search city...' }) => {
  const [local, setLocal] = useState(value || '');
  const timer = useRef(null);

  useEffect(() => {
    setLocal(value || '');
  }, [value]);

  const handleChange = (v) => {
    setLocal(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange?.(v), 250);
  };

  const clear = () => {
    setLocal('');
    if (timer.current) clearTimeout(timer.current);
    onChange?.('');
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={local}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.muted}
        autoCorrect={false}
        autoCapitalize="words"
      />
      {local.length > 0 && (
        <TouchableOpacity onPress={clear} style={styles.clearBtn}>
          <Text style={styles.clearTxt}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  icon: { fontSize: 14, marginRight: 6 },
  input: {
    flex: 1, fontSize: 14, color: COLORS.text.primary,
    paddingVertical: 8,
  },
  clearBtn: {
    paddingHorizontal: 8, paddingVertical: 2,
  },
  clearTxt: { color: COLORS.text.muted, fontSize: 14, fontWeight: '700' },
});

export default SearchBar;