import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import api from '../../services/apiService';
import { ENDPOINTS } from '../../constants/api';

const STEPS = ['Address', 'Review', 'Payment'];

const CheckoutScreen = ({ route, navigation }) => {
  const { cart = [] } = route.params || {};
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const totalAmount = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const totalCarbon = cart.reduce((acc, i) => acc + i.carbonSaved * i.qty, 0).toFixed(1);
  const totalItems = cart.reduce((acc, i) => acc + i.qty, 0);

  const validateAddress = () => {
    const { name, phone, line1, city, state, pincode } = address;
    if (!name || !phone || !line1 || !city || !state || !pincode) {
      Alert.alert('Missing Fields', 'Please fill all required address fields'); return false;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      Alert.alert('Invalid Phone', 'Enter a valid 10-digit Indian mobile number'); return false;
    }
    if (!/^\d{6}$/.test(pincode)) {
      Alert.alert('Invalid Pincode', 'Enter a valid 6-digit pincode'); return false;
    }
    return true;
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      const items = cart.map((i) => ({ productId: i._id, qty: i.qty }));
      const res = await api.post(ENDPOINTS.ORDERS, { items, address, paymentMethod });
      navigation.replace('OrderSuccess', { order: res.data.data, totalCarbon });
    } catch (err) {
      Alert.alert('Order Failed', err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const AddressField = ({ label, field, placeholder, keyboard, required }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}{required ? ' *' : ''}</Text>
      <TextInput
        style={styles.fieldInput}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.muted}
        keyboardType={keyboard || 'default'}
        value={address[field]}
        onChangeText={(v) => setAddress({ ...address, [field]: v })}
      />
    </View>
  );

  const INDIAN_STATES = ['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'];

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>📦 Delivery Address</Text>
            <AddressField label="Full Name" field="name" placeholder="Aarav Sharma" required />
            <AddressField label="Phone" field="phone" placeholder="9876543210" keyboard="phone-pad" required />
            <AddressField label="Address Line 1" field="line1" placeholder="House No, Street, Area" required />
            <AddressField label="Address Line 2" field="line2" placeholder="Landmark (optional)" />
            <AddressField label="City" field="city" placeholder="Mumbai" required />
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>State *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                {INDIAN_STATES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.stateChip, address.state === s && styles.stateChipActive]}
                    onPress={() => setAddress({ ...address, state: s })}
                  >
                    <Text style={[styles.stateChipText, address.state === s && { color: '#fff' }]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <AddressField label="Pincode" field="pincode" placeholder="400001" keyboard="numeric" required />
            <View style={{ height: 120 }} />
          </ScrollView>
        );

      case 1:
        return (
          <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>🧾 Review Order</Text>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewSectionTitle}>📦 Delivery To</Text>
              <Text style={styles.reviewText}>{address.name} · {address.phone}</Text>
              <Text style={styles.reviewText}>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</Text>
              <Text style={styles.reviewText}>{address.city}, {address.state} - {address.pincode}</Text>
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewSectionTitle}>🛒 Items ({totalItems})</Text>
              {cart.map((item) => (
                <View key={item._id} style={styles.reviewItem}>
                  <Text style={styles.reviewItemEmoji}>🏺</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewItemName}>{item.name}</Text>
                    <Text style={styles.reviewItemSub}>Qty: {item.qty} · 🌍 Saves {(item.carbonSaved * item.qty).toFixed(1)} kg CO₂</Text>
                  </View>
                  <Text style={styles.reviewItemPrice}>₹{item.price * item.qty}</Text>
                </View>
              ))}
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewSectionTitle}>💰 Price Summary</Text>
              {[
                { label: `Subtotal (${totalItems} items)`, value: `₹${totalAmount}` },
                { label: 'Delivery', value: totalAmount > 499 ? 'FREE 🎉' : '₹49' },
                { label: 'Eco Impact', value: `🌍 ${totalCarbon} kg CO₂ saved` },
              ].map((r) => (
                <View key={r.label} style={styles.priceRow}>
                  <Text style={styles.priceLabel}>{r.label}</Text>
                  <Text style={[styles.priceValue, r.label === 'Eco Impact' && { color: COLORS.primary }]}>{r.value}</Text>
                </View>
              ))}
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.totalValue}>₹{totalAmount > 499 ? totalAmount : totalAmount + 49}</Text>
              </View>
            </View>
            <View style={{ height: 120 }} />
          </ScrollView>
        );

      case 2:
        return (
          <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.stepTitle}>💳 Payment Method</Text>

            {[
              { id: 'cod', emoji: '💵', label: 'Cash on Delivery', sub: 'Pay when you receive your order' },
              { id: 'upi', emoji: '📱', label: 'UPI Payment', sub: 'GPay, PhonePe, Paytm, BHIM' },
              { id: 'card', emoji: '💳', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay' },
              { id: 'netbanking', emoji: '🏦', label: 'Net Banking', sub: 'All major Indian banks' },
            ].map((pm) => (
              <TouchableOpacity
                key={pm.id}
                style={[styles.paymentOption, paymentMethod === pm.id && styles.paymentOptionActive]}
                onPress={() => setPaymentMethod(pm.id)}
              >
                <Text style={{ fontSize: 28 }}>{pm.emoji}</Text>
                <View style={{ flex: 1, marginLeft: SPACING.md }}>
                  <Text style={[styles.paymentLabel, paymentMethod === pm.id && { color: COLORS.primary }]}>{pm.label}</Text>
                  <Text style={styles.paymentSub}>{pm.sub}</Text>
                </View>
                <View style={[styles.radioOuter, paymentMethod === pm.id && styles.radioOuterActive]}>
                  {paymentMethod === pm.id && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.orderSummaryMini}>
              <Text style={styles.orderSummaryTitle}>Order Total</Text>
              <Text style={styles.orderSummaryValue}>₹{totalAmount > 499 ? totalAmount : totalAmount + 49}</Text>
              <Text style={styles.orderSummarySub}>🌍 This order saves {totalCarbon} kg CO₂</Text>
            </View>
            <View style={{ height: 120 }} />
          </ScrollView>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepRow}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, i <= step && styles.stepDotActive, i === step && styles.stepDotCurrent]}>
                {i < step
                  ? <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>
                  : <Text style={{ color: i === step ? '#fff' : COLORS.text.muted, fontSize: 11, fontWeight: '700' }}>{i + 1}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, i === step && { color: COLORS.primary, fontWeight: '700' }]}>{s}</Text>
            </View>
            {i < STEPS.length - 1 && <View style={[styles.stepLine, i < step && { backgroundColor: COLORS.primary }]} />}
          </React.Fragment>
        ))}
      </View>

      {/* Step Content */}
      <View style={{ flex: 1 }}>{renderStep()}</View>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotal}>₹{totalAmount > 499 ? totalAmount : totalAmount + 49}</Text>
          <Text style={styles.bottomSub}>{totalItems} items · 🌍 {totalCarbon} kg saved</Text>
        </View>
        <TouchableOpacity
          style={[styles.ctaBtn, loading && { opacity: 0.7 }]}
          disabled={loading}
          onPress={() => {
            if (step === 0) { if (validateAddress()) setStep(1); }
            else if (step === 1) setStep(2);
            else placeOrder();
          }}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.ctaBtnText}>{step < 2 ? 'Continue →' : '🌿 Place Order'}</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingTop: 56, paddingBottom: SPACING.sm,
  },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 24, color: COLORS.primary, fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text.primary },
  stepRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md,
  },
  stepItem: { alignItems: 'center' },
  stepDot: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { backgroundColor: COLORS.primaryLight },
  stepDotCurrent: { backgroundColor: COLORS.primary },
  stepLabel: { fontSize: 10, color: COLORS.text.muted, marginTop: 4 },
  stepLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginBottom: 14 },
  stepContent: { paddingHorizontal: SPACING.lg },
  stepTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.md },
  fieldGroup: { marginBottom: SPACING.md },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary, marginBottom: 6 },
  fieldInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: 15, color: COLORS.text.primary, backgroundColor: COLORS.surface,
  },
  stateChip: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1.5, borderColor: COLORS.border,
  },
  stateChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stateChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text.secondary },
  reviewCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.card },
  reviewSectionTitle: { fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.sm, fontSize: 14 },
  reviewText: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 22 },
  reviewItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  reviewItemEmoji: { fontSize: 28, marginRight: SPACING.sm },
  reviewItemName: { fontSize: 13, fontWeight: '700', color: COLORS.text.primary },
  reviewItemSub: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
  reviewItemPrice: { fontSize: 14, fontWeight: '800', color: COLORS.accent },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  priceLabel: { fontSize: 13, color: COLORS.text.secondary },
  priceValue: { fontSize: 13, fontWeight: '600', color: COLORS.text.primary },
  totalRow: { borderTopWidth: 1.5, borderTopColor: COLORS.border, marginTop: SPACING.sm, paddingTop: SPACING.sm },
  totalLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary },
  totalValue: { fontSize: 18, fontWeight: '900', color: COLORS.accent },
  paymentOption: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm,
    borderWidth: 1.5, borderColor: COLORS.border, ...SHADOWS.card,
  },
  paymentOptionActive: { borderColor: COLORS.primary, backgroundColor: `${COLORS.primary}08` },
  paymentLabel: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary },
  paymentSub: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
  radioOuter: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  radioOuterActive: { borderColor: COLORS.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
  orderSummaryMini: {
    backgroundColor: `${COLORS.primary}12`, borderRadius: RADIUS.md,
    padding: SPACING.lg, alignItems: 'center', marginTop: SPACING.md,
  },
  orderSummaryTitle: { fontSize: 13, color: COLORS.text.secondary },
  orderSummaryValue: { fontSize: 32, fontWeight: '900', color: COLORS.primary, marginTop: 4 },
  orderSummarySub: { fontSize: 12, color: COLORS.text.secondary, marginTop: 4 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: SPACING.lg, paddingBottom: 30, ...SHADOWS.card,
  },
  bottomTotal: { fontSize: 20, fontWeight: '900', color: COLORS.accent },
  bottomSub: { fontSize: 11, color: COLORS.text.muted, marginTop: 2 },
  ctaBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: 28, paddingVertical: 14 },
  ctaBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

export default CheckoutScreen;
