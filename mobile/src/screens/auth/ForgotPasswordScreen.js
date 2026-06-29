import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import api from '../../services/apiService';
import { ENDPOINTS } from '../../constants/api';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) { Alert.alert('Error', 'Please enter your email'); return; }
    setLoading(true);
    try {
      await api.post(ENDPOINTS.FORGOT_PASSWORD, { email });
      setSent(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successEmoji}>📧</Text>
            <Text style={styles.successTitle}>Email Sent!</Text>
            <Text style={styles.successMsg}>Check your email for the password reset link.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backBtn}>
              <Text style={styles.backBtnText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.emoji}>🔐</Text>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>Enter your email and we'll send you a reset link</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <TouchableOpacity style={[styles.btn, loading && styles.disabled]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Reset Link</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
              <Text style={styles.backLinkText}>← Back to Login</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', padding: SPACING.lg },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, ...SHADOWS.card },
  emoji: { fontSize: 50, textAlign: 'center', marginBottom: SPACING.md },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text.primary, textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center', marginBottom: SPACING.lg },
  inputGroup: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary, marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: 15, color: COLORS.text.primary, backgroundColor: COLORS.cardBg,
  },
  btn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' },
  disabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  backLink: { marginTop: SPACING.md, alignItems: 'center' },
  backLinkText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  successBox: { alignItems: 'center' },
  successEmoji: { fontSize: 60 },
  successTitle: { fontSize: 22, fontWeight: '700', color: COLORS.primary, marginTop: SPACING.md },
  successMsg: { fontSize: 14, color: COLORS.text.secondary, textAlign: 'center', marginTop: SPACING.sm, marginBottom: SPACING.lg },
  backBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingVertical: 12, paddingHorizontal: 32 },
  backBtnText: { color: '#fff', fontWeight: '700' },
});

export default ForgotPasswordScreen;
