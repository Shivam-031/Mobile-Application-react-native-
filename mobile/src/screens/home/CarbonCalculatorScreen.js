import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Animated,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { submitCarbonCalc } from '../../store/slices/carbonSlice';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const EMISSION_FACTORS = {
  travel: { car_petrol: 0.21, car_diesel: 0.17, bike: 0.09, bus: 0.04, train: 0.014, flight_domestic: 0.255 },
  food: { beef: 27, chicken: 6.9, fish: 5.4, vegetarian: 2.5, vegan: 1.5 },
  energy: { electricity: 0.82, lpg: 2.98 },
  waste: { landfill: 0.5, recycled: 0.1, composted: 0.05 },
  shopping: { clothing: 15, electronics: 70, furniture: 90, food_packaging: 3 },
};

const TRAVEL_MODES = [
  { id: 'car_petrol', label: 'Car (Petrol)', emoji: '🚗' },
  { id: 'car_diesel', label: 'Car (Diesel)', emoji: '🚙' },
  { id: 'bike', label: 'Bike', emoji: '🏍️' },
  { id: 'bus', label: 'Bus', emoji: '🚌' },
  { id: 'train', label: 'Train', emoji: '🚂' },
  { id: 'flight_domestic', label: 'Domestic Flight', emoji: '✈️' },
];

const FOOD_TYPES = [
  { id: 'beef', label: 'Beef', emoji: '🥩' },
  { id: 'chicken', label: 'Chicken', emoji: '🍗' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
];

const WASTE_TYPES = [
  { id: 'landfill', label: 'Landfill', emoji: '🗑️' },
  { id: 'recycled', label: 'Recycled', emoji: '♻️' },
  { id: 'composted', label: 'Composted', emoji: '🌱' },
];

const STEPS = ['Travel', 'Food', 'Energy', 'Waste & Shopping', 'Result'];

const CarbonCalculatorScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [travelMode, setTravelMode] = useState('car_petrol');
  const [travelKm, setTravelKm] = useState('');
  const [foodType, setFoodType] = useState('vegetarian');
  const [foodKg, setFoodKg] = useState('');
  const [electricity, setElectricity] = useState('');
  const [lpg, setLpg] = useState('');
  const [wasteType, setWasteType] = useState('landfill');
  const [wasteKg, setWasteKg] = useState('');
  const [clothingItems, setClothingItems] = useState('');
  const [electronicsItems, setElectronicsItems] = useState('');
  const [result, setResult] = useState(null);

  const calculateCarbon = () => {
    const travelCO2 = (parseFloat(travelKm) || 0) * (EMISSION_FACTORS.travel[travelMode] || 0);
    const foodCO2 = (parseFloat(foodKg) || 0) * (EMISSION_FACTORS.food[foodType] || 0);
    const elCO2 = (parseFloat(electricity) || 0) * EMISSION_FACTORS.energy.electricity;
    const lpgCO2 = (parseFloat(lpg) || 0) * EMISSION_FACTORS.energy.lpg;
    const wasteCO2 = (parseFloat(wasteKg) || 0) * (EMISSION_FACTORS.waste[wasteType] || 0);
    const shoppingCO2 =
      (parseFloat(clothingItems) || 0) * EMISSION_FACTORS.shopping.clothing +
      (parseFloat(electronicsItems) || 0) * EMISSION_FACTORS.shopping.electronics;

    const total = travelCO2 + foodCO2 + elCO2 + lpgCO2 + wasteCO2 + shoppingCO2;
    const treesNeeded = Math.ceil(total / 21);

    setResult({
      totalGenerated: total.toFixed(2),
      treesNeeded,
      breakdown: {
        travel: travelCO2.toFixed(2),
        food: foodCO2.toFixed(2),
        electricity: elCO2.toFixed(2),
        lpg: lpgCO2.toFixed(2),
        waste: wasteCO2.toFixed(2),
        shopping: shoppingCO2.toFixed(2),
      },
    });

    // Save to backend via Redux
    dispatch(submitCarbonCalc({
      travelMode, travelKm: parseFloat(travelKm) || 0,
      foodType, foodKg: parseFloat(foodKg) || 0,
      electricity: parseFloat(electricity) || 0,
      lpg: parseFloat(lpg) || 0,
      wasteType, wasteKg: parseFloat(wasteKg) || 0,
      shoppingCO2,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    }));

    setStep(4);
  };

  const reset = () => {
    setStep(0); setResult(null);
    setTravelKm(''); setFoodKg(''); setElectricity(''); setLpg('');
    setWasteKg(''); setClothingItems(''); setElectronicsItems('');
  };

  const ModeSelector = ({ modes, selected, onSelect }) => (
    <View style={styles.modeGrid}>
      {modes.map((m) => (
        <TouchableOpacity
          key={m.id}
          style={[styles.modeCard, selected === m.id && styles.modeCardActive]}
          onPress={() => onSelect(m.id)}
        >
          <Text style={{ fontSize: 26 }}>{m.emoji}</Text>
          <Text style={[styles.modeLabel, selected === m.id && { color: '#fff' }]}>{m.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const InputField = ({ label, value, onChange, placeholder, tip }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      {tip && <Text style={styles.inputTip}>{tip}</Text>}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.muted}
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
      />
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View>
            <Text style={styles.stepTitle}>🚗 Travel this month</Text>
            <ModeSelector modes={TRAVEL_MODES} selected={travelMode} onSelect={setTravelMode} />
            <InputField
              label="Total km travelled this month"
              value={travelKm} onChange={setTravelKm}
              placeholder="e.g. 500"
              tip="Check Google Maps timeline or odometer"
            />
          </View>
        );

      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>🍽️ Food & Diet</Text>
            <ModeSelector modes={FOOD_TYPES} selected={foodType} onSelect={setFoodType} />
            <InputField
              label="Meat / animal products consumed (kg)"
              value={foodKg} onChange={setFoodKg}
              placeholder="e.g. 2 (enter 0 for fully plant-based)"
            />
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>💡 Did you know?</Text>
              <Text style={styles.tipText}>Switching to a vegetarian diet for one day/week saves ~8 kg CO₂ per month.</Text>
            </View>
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>🏠 Home Energy</Text>
            <InputField
              label="⚡ Electricity used (kWh)"
              value={electricity} onChange={setElectricity}
              placeholder="Check your electricity bill — e.g. 200"
              tip="Average Indian household uses 90–200 kWh/month"
            />
            <InputField
              label="🔥 LPG Gas used (kg)"
              value={lpg} onChange={setLpg}
              placeholder="1 cylinder = 14.2 kg"
              tip="Count cylinders used × 14.2"
            />
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>☀️ Solar Tip</Text>
              <Text style={styles.tipText}>Installing a 2kW rooftop solar panel can eliminate 80% of your electricity carbon footprint.</Text>
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>🛍️ Waste & Shopping</Text>
            <Text style={styles.subSectionTitle}>🗑️ Waste Disposal Method</Text>
            <ModeSelector modes={WASTE_TYPES} selected={wasteType} onSelect={setWasteType} />
            <InputField
              label="Total waste generated (kg)"
              value={wasteKg} onChange={setWasteKg}
              placeholder="e.g. 20 (average family ~30 kg/month)"
            />
            <Text style={[styles.subSectionTitle, { marginTop: SPACING.lg }]}>🛒 New Purchases This Month</Text>
            <InputField
              label="👕 New clothing items bought"
              value={clothingItems} onChange={setClothingItems}
              placeholder="e.g. 3 (each item ~15 kg CO₂)"
            />
            <InputField
              label="💻 Electronics purchased"
              value={electronicsItems} onChange={setElectronicsItems}
              placeholder="e.g. 1 (each item ~70 kg CO₂)"
            />
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>♻️ Eco Tip</Text>
              <Text style={styles.tipText}>Composting food waste can reduce household waste CO₂ by up to 60%. Buy second-hand clothing to reduce fashion emissions.</Text>
            </View>
          </View>
        );

      case 4:
        if (!result) return null;
        const total = parseFloat(result.totalGenerated);
        const level = total < 150 ? { label: 'Low Impact 🌱', color: '#4CAF50' }
          : total < 350 ? { label: 'Medium Impact 🌿', color: '#FF9800' }
          : { label: 'High Impact 🔴', color: '#F44336' };
        const breakdownEntries = [
          { label: 'Travel', value: result.breakdown.travel, emoji: '🚗' },
          { label: 'Food', value: result.breakdown.food, emoji: '🍽️' },
          { label: 'Electricity', value: result.breakdown.electricity, emoji: '⚡' },
          { label: 'LPG', value: result.breakdown.lpg, emoji: '🔥' },
          { label: 'Waste', value: result.breakdown.waste, emoji: '🗑️' },
          { label: 'Shopping', value: result.breakdown.shopping, emoji: '🛒' },
        ];
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.resultCard}>
              <Text style={{ fontSize: 56 }}>🌍</Text>
              <Text style={styles.resultTitle}>Your Carbon Footprint</Text>
              <Text style={[styles.resultValue, { color: level.color }]}>{result.totalGenerated} kg CO₂</Text>
              <View style={[styles.levelBadge, { backgroundColor: `${level.color}20` }]}>
                <Text style={[styles.levelText, { color: level.color }]}>{level.label}</Text>
              </View>
              <Text style={styles.resultMonth}>This month · Saved to your history</Text>
            </View>

            <Text style={styles.sectionTitle}>Breakdown (6 categories)</Text>
            {breakdownEntries.map((b) => (
              <View key={b.label} style={styles.breakdownRow}>
                <Text style={{ fontSize: 18, width: 30 }}>{b.emoji}</Text>
                <Text style={styles.breakdownLabel}>{b.label}</Text>
                <View style={styles.breakdownBar}>
                  <View style={[styles.breakdownBarFill, {
                    width: `${Math.min(100, total > 0 ? (parseFloat(b.value) / total) * 100 : 0)}%`,
                    backgroundColor: COLORS.primary,
                  }]} />
                </View>
                <Text style={styles.breakdownValue}>{b.value} kg</Text>
              </View>
            ))}

            <View style={styles.treesCard}>
              <Text style={{ fontSize: 38 }}>🌳</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.treesTitle}>Trees needed to offset</Text>
                <Text style={styles.treesText}>
                  Plant <Text style={{ fontWeight: '900', color: COLORS.primary }}>{result.treesNeeded} trees</Text> to offset this month
                </Text>
              </View>
            </View>

            <View style={styles.suggestionsCard}>
              <Text style={styles.suggestionsTitle}>💡 Personalized Suggestions</Text>
              {[
                parseFloat(result.breakdown.travel) > 50 && '🚌 Use public transport or carpool to cut travel emissions',
                parseFloat(result.breakdown.food) > 30 && '🥗 Try plant-based meals 3 days a week',
                parseFloat(result.breakdown.electricity) > 40 && '💡 Switch to LED bulbs & unplug idle appliances',
                parseFloat(result.breakdown.shopping) > 20 && '♻️ Buy second-hand clothing or wait before new purchases',
                parseFloat(result.breakdown.waste) > 10 && '🌱 Start composting kitchen waste at home',
                '🏺 Buy eco-certified products from Green Yatra marketplace',
              ].filter(Boolean).map((s, i) => (
                <Text key={i} style={styles.suggestionText}>{s}</Text>
              ))}
            </View>

            <TouchableOpacity style={styles.shopEcoBtn} onPress={() => navigation.navigate('Marketplace')}>
              <Text style={styles.shopEcoBtnText}>🛒 Shop Eco to Offset Carbon</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate('CarbonHistory')}>
              <Text style={styles.historyBtnText}>📊 View My Carbon History</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <Text style={styles.resetBtnText}>🔄 Recalculate</Text>
            </TouchableOpacity>

            <View style={{ height: 80 }} />
          </ScrollView>
        );
    }
  };

  const progressPct = ((step) / (STEPS.length - 1)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌍 Carbon Calculator</Text>
        <View style={{ width: 40 }} />
      </View>

      {step < 4 && (
        <>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
          </View>
          <View style={styles.stepLabelRow}>
            {STEPS.slice(0, 4).map((s, i) => (
              <Text key={s} style={[styles.stepChip, i === step && styles.stepChipActive]}>{s}</Text>
            ))}
          </View>
        </>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      {step < 4 && (
        <View style={styles.bottomBar}>
          {step > 0 && (
            <TouchableOpacity style={styles.prevBtn} onPress={() => setStep(step - 1)}>
              <Text style={styles.prevBtnText}>← Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextBtn, step === 0 && { flex: 1 }]}
            onPress={() => step === 3 ? calculateCarbon() : setStep(step + 1)}
          >
            <Text style={styles.nextBtnText}>{step === 3 ? '🌍 Calculate' : 'Next →'}</Text>
          </TouchableOpacity>
        </View>
      )}
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
  progressBarBg: { height: 4, backgroundColor: COLORS.border, marginHorizontal: SPACING.lg, borderRadius: 2 },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  stepLabelRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, gap: 6, flexWrap: 'wrap' },
  stepChip: { fontSize: 10, color: COLORS.text.muted, backgroundColor: COLORS.surface, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 4 },
  stepChipActive: { backgroundColor: COLORS.primary, color: '#fff', fontWeight: '700' },
  content: { padding: SPACING.lg, paddingBottom: 120 },
  stepTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.md },
  subSectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text.secondary, marginBottom: SPACING.sm },
  modeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  modeCard: {
    width: '30%', backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.sm, alignItems: 'center', ...SHADOWS.card,
  },
  modeCardActive: { backgroundColor: COLORS.primary },
  modeLabel: { fontSize: 10, color: COLORS.text.secondary, marginTop: 4, textAlign: 'center', fontWeight: '600' },
  inputGroup: { marginBottom: SPACING.md },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary, marginBottom: 4 },
  inputTip: { fontSize: 11, color: COLORS.text.muted, marginBottom: 6, fontStyle: 'italic' },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: SPACING.md, fontSize: 15, color: COLORS.text.primary, backgroundColor: COLORS.surface,
  },
  tipCard: { backgroundColor: `${COLORS.primary}12`, borderRadius: RADIUS.md, padding: SPACING.md, borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  tipTitle: { fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  tipText: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 20 },
  resultCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl, alignItems: 'center', ...SHADOWS.card, marginBottom: SPACING.md },
  resultTitle: { fontSize: 15, color: COLORS.text.secondary, marginTop: SPACING.sm },
  resultValue: { fontSize: 42, fontWeight: '900', marginTop: 4 },
  levelBadge: { borderRadius: RADIUS.full, paddingHorizontal: 16, paddingVertical: 6, marginTop: SPACING.sm },
  levelText: { fontWeight: '700', fontSize: 14 },
  resultMonth: { fontSize: 11, color: COLORS.text.muted, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.sm },
  breakdownRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.sm, gap: 6, ...SHADOWS.card,
  },
  breakdownLabel: { width: 72, fontSize: 12, color: COLORS.text.secondary, fontWeight: '600' },
  breakdownBar: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
  breakdownBarFill: { height: '100%', borderRadius: 4 },
  breakdownValue: { width: 55, fontSize: 11, fontWeight: '700', color: COLORS.text.primary, textAlign: 'right' },
  treesCard: {
    backgroundColor: `${COLORS.primary}12`, borderRadius: RADIUS.md, padding: SPACING.md,
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginVertical: SPACING.sm,
  },
  treesTitle: { fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  treesText: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 20 },
  suggestionsCard: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, ...SHADOWS.card, marginBottom: SPACING.sm },
  suggestionsTitle: { fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.sm, fontSize: 15 },
  suggestionText: { fontSize: 13, color: COLORS.text.secondary, lineHeight: 22, paddingVertical: 2 },
  shopEcoBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', ...SHADOWS.card, marginBottom: SPACING.sm },
  shopEcoBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  historyBtn: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.primary, marginBottom: SPACING.sm },
  historyBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  resetBtn: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border },
  resetBtnText: { color: COLORS.text.secondary, fontWeight: '700' },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.surface,
    flexDirection: 'row', padding: SPACING.lg, paddingBottom: 30, gap: SPACING.sm, ...SHADOWS.card,
  },
  prevBtn: { backgroundColor: COLORS.cardBg, borderRadius: RADIUS.md, paddingHorizontal: 20, justifyContent: 'center', borderWidth: 1.5, borderColor: COLORS.border },
  prevBtnText: { color: COLORS.text.secondary, fontWeight: '700' },
  nextBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center', ...SHADOWS.card },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

export default CarbonCalculatorScreen;
