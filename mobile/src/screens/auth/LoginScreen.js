import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    dispatch(loginUser(form));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Logo / Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🌿</Text>
          <Text style={styles.title}>Green Yatra India</Text>
          <Text style={styles.subtitle}>Your eco journey begins here</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.text.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(val) => { dispatch(clearError()); setForm({ ...form, email: val }); }}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.text.muted}
              secureTextEntry
              value={form.password}
              onChangeText={(val) => setForm({ ...form, password: val })}
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.loginBtnText}>Login</Text>
            }
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.md },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: { color: COLORS.error, fontSize: 13 },
  inputGroup: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 15,
    color: COLORS.text.primary,
    backgroundColor: COLORS.cardBg,
  },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: SPACING.md },
  forgotText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.card,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.md },
  registerText: { color: COLORS.text.secondary, fontSize: 14 },
  registerLink: { color: COLORS.primary, fontSize: 14, fontWeight: '700' },
});

export default LoginScreen;
