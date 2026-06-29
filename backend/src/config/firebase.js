const admin = require('firebase-admin');

let firebaseApp;

const initFirebase = () => {
  if (firebaseApp) return firebaseApp;
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('✅ Firebase Admin initialized');
  } catch (err) {
    console.warn('⚠️  Firebase not configured:', err.message);
  }
  return firebaseApp;
};

const sendNotification = async ({ fcmToken, title, body, data = {} }) => {
  if (!firebaseApp) { console.warn('Firebase not initialized'); return; }
  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: { ...data },
      android: { priority: 'high', notification: { sound: 'default', channelId: 'green_yatra' } },
      apns: { payload: { aps: { sound: 'default', badge: 1 } } },
    });
  } catch (err) {
    console.error('FCM send error:', err.message);
  }
};

const sendToTopic = async ({ topic, title, body, data = {} }) => {
  if (!firebaseApp) return;
  try {
    await admin.messaging().send({
      topic,
      notification: { title, body },
      data,
    });
  } catch (err) {
    console.error('FCM topic send error:', err.message);
  }
};

// Notification templates
const NOTIFICATIONS = {
  ORDER_PLACED: (orderId) => ({
    title: '🌿 Order Confirmed!',
    body: `Your eco order #${orderId.slice(-6).toUpperCase()} has been placed successfully.`,
    data: { type: 'order', orderId },
  }),
  ORDER_SHIPPED: (orderId, trackingId) => ({
    title: '🚚 Order Shipped!',
    body: `Your order is on the way! Tracking: ${trackingId || 'N/A'}`,
    data: { type: 'order', orderId },
  }),
  ORDER_DELIVERED: (orderId) => ({
    title: '🏠 Order Delivered!',
    body: `Your eco product has arrived! Rate your experience.`,
    data: { type: 'order', orderId },
  }),
  PRODUCT_APPROVED: (productName) => ({
    title: '✅ Product Approved!',
    body: `"${productName}" is now live on the marketplace.`,
    data: { type: 'approval' },
  }),
  PRODUCT_REJECTED: (productName, reason) => ({
    title: '❌ Product Needs Changes',
    body: `"${productName}" requires updates: ${reason}`,
    data: { type: 'approval' },
  }),
  GREEN_SCORE_MILESTONE: (score) => ({
    title: '🌟 Green Score Milestone!',
    body: `You've reached ${score} Green Score points! Keep going 🌿`,
    data: { type: 'awareness' },
  }),
};

module.exports = { initFirebase, sendNotification, sendToTopic, NOTIFICATIONS };
