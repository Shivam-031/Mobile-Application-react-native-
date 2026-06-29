import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar,
} from 'react-native';
import { COLORS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish }) => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const leafLeft = useRef(new Animated.Value(-100)).current;
  const leafRight = useRef(new Animated.Value(100)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    StatusBar.setBarStyle('light-content');

    Animated.sequence([
      // Leaves fly in
      Animated.parallel([
        Animated.spring(leafLeft, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.spring(leafRight, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      ]),
      // Logo pops in
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // App name fades in
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      // Tagline fades in
      Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressWidth, {
      toValue: width * 0.6,
      duration: 2800,
      useNativeDriver: false,
    }).start();

    // Navigate after 3.2s
    const timer = setTimeout(() => {
      StatusBar.setBarStyle('dark-content');
      onFinish?.();
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Background circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      {/* Leaf animations */}
      <Animated.Text style={[styles.leafLeft, { transform: [{ translateX: leafLeft }, { rotate: '-30deg' }] }]}>
        🌿
      </Animated.Text>
      <Animated.Text style={[styles.leafRight, { transform: [{ translateX: leafRight }, { rotate: '30deg' }] }]}>
        🌿
      </Animated.Text>
      <Animated.Text style={[styles.leafTopLeft, { transform: [{ translateX: leafLeft }] }]}>
        🍃
      </Animated.Text>
      <Animated.Text style={[styles.leafBottomRight, { transform: [{ translateX: leafRight }] }]}>
        🍃
      </Animated.Text>

      {/* Main content */}
      <View style={styles.center}>
        <Animated.View style={[styles.logoCircle, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
          <Text style={styles.logoEmoji}>🌿</Text>
        </Animated.View>

        <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
          Green Yatra India
        </Animated.Text>

        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Eco Marketplace · Carbon Tracking{'\n'}Plant Biodiversity · Green India
        </Animated.Text>

        {/* Progress bar */}
        <View style={styles.progressBg}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        <Animated.Text style={[styles.loadingText, { opacity: taglineOpacity }]}>
          Loading your green journey...
        </Animated.Text>
      </View>

      {/* Bottom tagline */}
      <Animated.Text style={[styles.bottomText, { opacity: taglineOpacity }]}>
        🇮🇳 Made for a Greener India
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  bgCircle1: {
    position: 'absolute', width: 400, height: 400, borderRadius: 200,
    backgroundColor: 'rgba(255,255,255,0.05)', top: -100, right: -100,
  },
  bgCircle2: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: -50, left: -80,
  },
  bgCircle3: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)', top: height * 0.3, left: -60,
  },
  leafLeft: {
    position: 'absolute', fontSize: 60, top: height * 0.15, left: width * 0.05,
  },
  leafRight: {
    position: 'absolute', fontSize: 60, top: height * 0.15, right: width * 0.05,
  },
  leafTopLeft: {
    position: 'absolute', fontSize: 40, top: height * 0.08, left: width * 0.25,
  },
  leafBottomRight: {
    position: 'absolute', fontSize: 40, bottom: height * 0.15, right: width * 0.2,
  },
  center: { alignItems: 'center', paddingHorizontal: 40 },
  logoCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 24,
  },
  logoEmoji: { fontSize: 60 },
  appName: {
    fontSize: 32, fontWeight: '900', color: '#fff',
    letterSpacing: 0.5, textAlign: 'center', marginBottom: 12,
  },
  tagline: {
    fontSize: 13, color: 'rgba(255,255,255,0.75)',
    textAlign: 'center', lineHeight: 22, marginBottom: 40,
  },
  progressBg: {
    width: width * 0.6, height: 4, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', backgroundColor: '#fff', borderRadius: 2,
  },
  loadingText: {
    fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 12,
  },
  bottomText: {
    position: 'absolute', bottom: 48,
    fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '600',
  },
});

export default SplashScreen;
