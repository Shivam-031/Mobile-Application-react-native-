import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { INDIA_STATES_GEO } from '../../data/indiaStates';
import { INDIA_STATE_DISTRICTS } from '../../data/indiaStateDistricts';

// Role options for the 3-way toggle. Keep 'EMPLOYEE' as a UI label only —
// when submitted, the backend maps it to role=EMPLOYEE based on the
// employeeKey presented (no DB migration needed; only role strings in code
// change, not the underlying enum value the user is mapped to).
const ROLE_OPTIONS = [
  { id: 'USER', label: 'Customer', emoji: '👤', hint: 'Shop eco products, track your green score' },
  { id: 'EMPLOYEE', label: 'Employee', emoji: '🏭', hint: 'Sell products and manage a region (requires key)' },
  { id: 'MASTER_ADMIN', label: 'Admin', emoji: '🛡️', hint: 'Manage platform (requires key)' },
];

// State list — reuse the canonical 36 states/UTs from the heatmap data file
// so the picker is consistent with the rest of the app's India geography.
const STATES = INDIA_STATES_GEO.map((s) => s.name).sort((a, b) => a.localeCompare(b));

// PickerSheet — bottom-sheet style modal for selecting a value from a list.
// Used for both the state and district pickers so the registration flow
// stays consistent with other modal pickers in the app.
const PickerSheet = ({ visible, title, options, selected, onSelect, onClose, emptyText }) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <View style={pickerStyles.backdrop}>
      <View style={pickerStyles.sheet}>
        <View style={pickerStyles.header}>
          <Text style={pickerStyles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={pickerStyles.closeBtn}>
            <Text style={pickerStyles.closeBtnTxt}>✕</Text>
          </TouchableOpacity>
        </View>
        {options.length === 0 ? (
          <View style={pickerStyles.empty}>
            <Text style={pickerStyles.emptyTxt}>{emptyText || 'No options available'}</Text>
          </View>
        ) : (
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            ItemSeparatorComponent={() => <View style={pickerStyles.sep} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[pickerStyles.row, selected === item && pickerStyles.rowActive]}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <Text style={[pickerStyles.rowTxt, selected === item && pickerStyles.rowTxtActive]}>
                  {item}
                </Text>
                {selected === item && <Text style={pickerStyles.check}>✓</Text>}
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  </Modal>
);

// Field component extracted for readability — same shape as before, just
// extracted to module scope so its identity is stable across renders.
const Field = ({ label, placeholder, value, onChangeText, keyboardType, secure, autoCapitalize, multiline }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.text.muted}
      keyboardType={keyboardType || 'default'}
      secureTextEntry={secure}
      autoCapitalize={autoCapitalize || 'sentences'}
      multiline={!!multiline}
      value={value}
      onChangeText={onChangeText}
    />
  </View>
);

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [role, setRole] = useState('USER');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    state: '', district: '', employeeKey: '', adminKey: '',
  });
  const [statePickerOpen, setStatePickerOpen] = useState(false);
  const [districtPickerOpen, setDistrictPickerOpen] = useState(false);

  const updateField = (field) => (val) => {
    dispatch(clearError());
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  // Districts available for the currently-selected state. Memoized so the
  // FlatList inside PickerSheet doesn't re-render on unrelated state changes.
  const districts = useMemo(() => {
    if (!form.state) return [];
    return INDIA_STATE_DISTRICTS[form.state] || [];
  }, [form.state]);

  // When the user picks a new state, clear the previously-chosen district
  // — old district may not exist in the new state's list.
  const handleStateSelect = (state) => {
    setForm((prev) => ({ ...prev, state, district: '' }));
  };

  const handleRegister = () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (role === 'MASTER_ADMIN' && !form.adminKey.trim()) {
      Alert.alert('Error', 'Please enter the admin key');
      return;
    }
    if (role === 'EMPLOYEE') {
      if (!form.employeeKey.trim()) {
        Alert.alert('Error', 'Please enter the employee key');
        return;
      }
      if (!form.state || !form.district) {
        Alert.alert('Error', 'Please select your state and district');
        return;
      }
    }

    // Strip UI-only fields before dispatching.
    const { confirmPassword, adminKey, employeeKey, ...rest } = form;
    const payload = { ...rest };
    if (role === 'MASTER_ADMIN') payload.adminKey = adminKey;
    if (role === 'EMPLOYEE') payload.employeeKey = employeeKey;
    dispatch(registerUser(payload));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      // 'height' on Android is what actually pushes the form up so the focused
      // input stays visible above the keyboard. Without this, tapping a lower
      // field on Android hides the field behind the keyboard and the user
      // effectively "can't type" because their taps land on the wrong thing.
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        // 'handled' lets taps on the Create Account button register while a
        // field is focused (otherwise the scroll-view swallows the tap to
        // dismiss the keyboard first).
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🌱</Text>
          <Text style={styles.title}>Join Green Yatra</Text>
          <Text style={styles.subtitle}>Start your eco-friendly journey</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Role picker — 3-way segmented control. Hidden as a single toggle
              so it's discoverable but doesn't clutter the form for the common
              (Customer) case. */}
          <View style={styles.roleRow}>
            {ROLE_OPTIONS.map((opt) => {
              const active = role === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.roleChip, active && styles.roleChipActive]}
                  onPress={() => setRole(opt.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.roleEmoji]}>{opt.emoji}</Text>
                  <Text style={[styles.roleLabel, active && styles.roleLabelActive]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.roleHint}>{ROLE_OPTIONS.find((o) => o.id === role)?.hint}</Text>

          <Field
            label="Full Name *"
            placeholder="Aarav Sharma"
            value={form.name}
            onChangeText={updateField('name')}
            autoCapitalize="words"
          />
          <Field
            label="Email *"
            placeholder="aarav@example.com"
            value={form.email}
            onChangeText={updateField('email')}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            label="Phone (optional)"
            placeholder="9876543210"
            value={form.phone}
            onChangeText={updateField('phone')}
            keyboardType="phone-pad"
          />
          <Field
            label="Password *"
            placeholder="Min 6 characters"
            value={form.password}
            onChangeText={updateField('password')}
            secure
          />
          <Field
            label="Confirm Password *"
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChangeText={updateField('confirmPassword')}
            secure
          />

          {/* Employee-only fields: state, district, employee key. Hidden for
              Customer/Admin so the form stays compact for the common cases. */}
          {role === 'EMPLOYEE' && (
            <View style={styles.employeeBlock}>
              <Text style={styles.sectionLabel}>📍 Region</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>State *</Text>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  onPress={() => setStatePickerOpen(true)}
                  activeOpacity={0.7}
                >
                  <Text style={form.state ? styles.pickerValue : styles.pickerPlaceholder}>
                    {form.state || 'Select your state'}
                  </Text>
                  <Text style={styles.pickerChevron}>›</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>District *</Text>
                <TouchableOpacity
                  style={[styles.pickerTrigger, !form.state && styles.pickerTriggerDisabled]}
                  onPress={() => form.state && setDistrictPickerOpen(true)}
                  activeOpacity={form.state ? 0.7 : 1}
                  disabled={!form.state}
                >
                  <Text style={form.district ? styles.pickerValue : styles.pickerPlaceholder}>
                    {form.state ? (form.district || 'Select your district') : 'Pick a state first'}
                  </Text>
                  <Text style={styles.pickerChevron}>›</Text>
                </TouchableOpacity>
              </View>

              <Field
                label="Employee Key *"
                placeholder="Enter the secret employee key"
                value={form.employeeKey}
                onChangeText={updateField('employeeKey')}
                secure
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Admin-only field. Hidden by default. */}
          {role === 'MASTER_ADMIN' && (
            <Field
              label="Admin Key *"
              placeholder="Enter the secret admin key"
              value={form.adminKey}
              onChangeText={updateField('adminKey')}
              secure
              autoCapitalize="none"
            />
          )}

          <TouchableOpacity
            style={[styles.registerBtn, loading && styles.disabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.registerBtnText}>
                  {role === 'MASTER_ADMIN' ? 'Create Admin Account 🛡️'
                   : role === 'EMPLOYEE' ? 'Create Employee Account 🏭'
                   : 'Create Account 🌿'}
                </Text>
            }
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <PickerSheet
        visible={statePickerOpen}
        title="Select State"
        options={STATES}
        selected={form.state}
        onSelect={handleStateSelect}
        onClose={() => setStatePickerOpen(false)}
      />
      <PickerSheet
        visible={districtPickerOpen}
        title={form.state ? `Select District — ${form.state}` : 'Select District'}
        options={districts}
        selected={form.district}
        onSelect={(d) => setForm((prev) => ({ ...prev, district: d }))}
        onClose={() => setDistrictPickerOpen(false)}
        emptyText="No districts found for this state"
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  logo: { fontSize: 60 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.primary, marginTop: SPACING.sm },
  subtitle: { fontSize: 14, color: COLORS.text.secondary, marginTop: 4 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOWS.card },
  cardTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.md },
  errorBox: { backgroundColor: '#FFEBEE', borderRadius: RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.md },
  errorText: { color: COLORS.error, fontSize: 13 },
  inputGroup: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: 15, color: COLORS.text.primary, backgroundColor: COLORS.cardBg,
  },
  // Role picker (3-way)
  roleRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: 4 },
  roleChip: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.border,
  },
  roleChipActive: { backgroundColor: `${COLORS.primary}15`, borderColor: COLORS.primary },
  roleEmoji: { fontSize: 22, marginBottom: 2 },
  roleLabel: { fontSize: 12, fontWeight: '700', color: COLORS.text.secondary },
  roleLabelActive: { color: COLORS.primary },
  roleHint: { fontSize: 11, color: COLORS.text.muted, marginBottom: SPACING.md, marginTop: 4 },
  // Employee block
  employeeBlock: {
    backgroundColor: `${COLORS.primary}08`, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.primary, marginBottom: SPACING.sm },
  pickerTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 14, backgroundColor: COLORS.cardBg,
  },
  pickerTriggerDisabled: { opacity: 0.5 },
  pickerValue: { fontSize: 15, color: COLORS.text.primary, fontWeight: '600' },
  pickerPlaceholder: { fontSize: 15, color: COLORS.text.muted },
  pickerChevron: { fontSize: 22, color: COLORS.text.muted, lineHeight: 22 },
  registerBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', ...SHADOWS.card },
  disabled: { opacity: 0.7 },
  registerBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.md },
  loginText: { color: COLORS.text.secondary, fontSize: 14 },
  loginLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});

const pickerStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg, maxHeight: '75%',
    paddingBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { fontSize: 17, fontWeight: '700', color: COLORS.text.primary, flex: 1 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.cardBg, alignItems: 'center', justifyContent: 'center' },
  closeBtnTxt: { fontWeight: '700', color: COLORS.text.secondary },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: 14,
  },
  rowActive: { backgroundColor: `${COLORS.primary}10` },
  rowTxt: { fontSize: 15, color: COLORS.text.primary },
  rowTxtActive: { fontWeight: '700', color: COLORS.primary },
  check: { fontSize: 18, color: COLORS.primary, fontWeight: '700' },
  sep: { height: 1, backgroundColor: COLORS.border, marginLeft: SPACING.lg },
  empty: { padding: SPACING.xl, alignItems: 'center' },
  emptyTxt: { color: COLORS.text.muted, fontSize: 14 },
});

export default RegisterScreen;