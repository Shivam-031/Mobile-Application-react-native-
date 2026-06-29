// Firebase Cloud Messaging Service
// Requires:
//   - @react-native-firebase/app + @react-native-firebase/messaging in package.json
//   - android/app/google-services.json present (already in repo)
//   - ios/GreenYatraIndia/GoogleService-Info.plist present (already in repo)
//   - com.google.gms:google-services Gradle plugin applied (see android/build.gradle)
//
// ⚠️  IMPORTANT — native rebuild required after `npm install`:
//     The Firebase JS package wraps a NATIVE module (RNFBMessagingModule).
//     Metro/JS can resolve the package fine, but at runtime Hermes loads the
//     native module via the JNI bridge — if the APK on the device was built
//     BEFORE these packages were added, the native module isn't registered
//     and `require('@react-native-firebase/messaging')` returns undefined.
//     Hermes then throws: "Requiring unknown module 'undefined'".
//     Fix: `cd android && ./gradlew clean && ./gradlew assembleDebug` then
//     reinstall the APK on the device. Until then, this service stays
//     disabled so the rest of the app keeps working.

import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './apiService';

class NotificationService {
  constructor() {
    this.messaging = null;
    this.initialized = false;
  }

  async init() {
    try {
      // Wrap the entire Firebase setup so any failure (missing native module,
      // permission denial, FCM not enabled) lands in the catch — without
      // bringing the whole app down. The native-module undefined case shows
      // up as a string message starting with "Requiring unknown module".
      const mod = await import('@react-native-firebase/messaging');
      const messaging = mod?.default;
      if (typeof messaging !== 'function') {
        console.warn('Push notifications disabled: native module not linked. Run `cd android && ./gradlew clean && ./gradlew assembleDebug` and reinstall the APK.');
        return;
      }
      this.messaging = messaging();
      this.initialized = true;

      await this.requestPermission();
      await this.getAndSaveFCMToken();
      this.setupForegroundHandler();
      this.setupBackgroundHandler();
    } catch (err) {
      // Permission denial, no google-services.json, or FCM not enabled in
      // the Firebase project. App still runs; we just won't get push.
      console.warn('Push notifications disabled:', err?.message || err);
    }
  }

  async requestPermission() {
    if (!this.messaging) return;
    const authStatus = await this.messaging.requestPermission();
    const enabled =
      authStatus === 1 || // AUTHORIZED
      authStatus === 2;   // PROVISIONAL
    if (!enabled) console.warn('Notification permission not granted');
    return enabled;
  }

  async getAndSaveFCMToken() {
    if (!this.messaging) return;
    try {
      const token = await this.messaging.getToken();
      if (token) {
        const saved = await AsyncStorage.getItem('fcmToken');
        if (saved !== token) {
          await AsyncStorage.setItem('fcmToken', token);
          // Save to backend
          await api.put('/users/profile', { fcmToken: token });
        }
      }
    } catch (err) {
      console.warn('FCM token error:', err.message);
    }
  }

  setupForegroundHandler() {
    if (!this.messaging) return;
    this.messaging.onMessage(async (remoteMessage) => {
      const { notification, data } = remoteMessage;
      Alert.alert(
        notification?.title || 'Green Yatra',
        notification?.body || '',
        [{ text: 'OK' }]
      );
    });
  }

  setupBackgroundHandler() {
    if (!this.messaging) return;
    // Background handler must be registered outside of any component
    this.messaging.setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background notification:', remoteMessage);
    });
  }

  async subscribeToTopic(topic) {
    if (!this.messaging) return;
    await this.messaging.subscribeToTopic(topic);
  }

  async unsubscribeFromTopic(topic) {
    if (!this.messaging) return;
    await this.messaging.unsubscribeFromTopic(topic);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
