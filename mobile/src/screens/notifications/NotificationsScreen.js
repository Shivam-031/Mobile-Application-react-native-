import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Switch,
} from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

const MOCK_NOTIFICATIONS = [
  { _id: 'n1', type: 'order', title: 'Order Shipped! 🚚', body: 'Your Medium Clay Pot order has been shipped. Expected delivery in 3-5 days.', time: '2 hours ago', read: false },
  { _id: 'n2', type: 'approval', title: 'Product Approved ✅', body: 'Your product "Decorative Jali Pot" has been approved and is now live on the marketplace.', time: '1 day ago', read: false },
  { _id: 'n3', type: 'plant', title: 'Plant Campaign 🌱', body: 'Join our Neem Plantation drive in Delhi this Sunday! Help plant 1000 trees.', time: '2 days ago', read: true },
  { _id: 'n4', type: 'awareness', title: 'Eco Tip of the Day 💡', body: 'Switching to a plant-based diet for just one day a week can reduce your carbon footprint by 8 kg CO₂ per month.', time: '3 days ago', read: true },
  { _id: 'n5', type: 'order', title: 'Order Delivered! 🏠', body: 'Your Small Terracotta Pot has been delivered. Rate your experience!', time: '4 days ago', read: true },
  { _id: 'n6', type: 'awareness', title: 'Green Score Milestone 🌟', body: 'You\'ve reached 100 Green Score points! You\'ve earned the "Sapling" badge 🌿', time: '5 days ago', read: true },
  { _id: 'n7', type: 'plant', title: 'New Plant Added 🌸', body: 'Kerala Orchid has been added to the Plant Biodiversity Dashboard. Discover its benefits!', time: '1 week ago', read: true },
];

const TYPE_CONFIG = {
  order:     { emoji: '📦', color: '#2196F3', bg: '#E3F2FD' },
  approval:  { emoji: '✅', color: '#4CAF50', bg: '#E8F5E9' },
  plant:     { emoji: '🌱', color: COLORS.primary, bg: `${COLORS.primary}15` },
  awareness: { emoji: '💡', color: '#FF9800', bg: '#FFF8E1' },
};

const PREF_ITEMS = [
  { key: 'orders', label: 'Order Updates', sub: 'Shipping, delivery, cancellation', emoji: '📦' },
  { key: 'approvals', label: 'Approval Updates', sub: 'Product approval status', emoji: '✅' },
  { key: 'plants', label: 'Plant Campaigns', sub: 'Plantation drives, new species', emoji: '🌱' },
  { key: 'awareness', label: 'Awareness Alerts', sub: 'Eco tips, green score milestones', emoji: '💡' },
];

const NotificationsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [prefs, setPrefs] = useState({ orders: true, approvals: true, plants: true, awareness: true });

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id) => setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = activeTab === 'all'
    ? notifications
    : activeTab === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications.filter((n) => n.type === activeTab);

  const renderNotification = ({ item }) => {
    const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.awareness;
    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.read && styles.notifCardUnread]}
        onPress={() => markRead(item._id)}
        activeOpacity={0.85}
      >
        <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
          <Text style={{ fontSize: 22 }}>{cfg.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.notifHeader}>
            <Text style={[styles.notifTitle, !item.read && { color: COLORS.primary }]} numberOfLines={1}>
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>🔔 Notifications</Text>
          {unreadCount > 0 && <Text style={styles.unreadCount}>{unreadCount} unread</Text>}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter tabs */}
      <ScrollViewTabs activeTab={activeTab} setActiveTab={setActiveTab} unreadCount={unreadCount} />

      <FlatList
        data={filtered}
        keyExtractor={(n) => n._id}
        contentContainerStyle={styles.list}
        renderItem={renderNotification}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 60 }}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.prefsSection}>
            <Text style={styles.prefsSectionTitle}>⚙️ Notification Preferences</Text>
            {PREF_ITEMS.map((p) => (
              <View key={p.key} style={styles.prefRow}>
                <Text style={{ fontSize: 22, marginRight: SPACING.sm }}>{p.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prefLabel}>{p.label}</Text>
                  <Text style={styles.prefSub}>{p.sub}</Text>
                </View>
                <Switch
                  value={prefs[p.key]}
                  onValueChange={(v) => setPrefs({ ...prefs, [p.key]: v })}
                  trackColor={{ false: COLORS.border, true: `${COLORS.primary}60` }}
                  thumbColor={prefs[p.key] ? COLORS.primary : '#fff'}
                />
              </View>
            ))}
          </View>
        }
      />
    </View>
  );
};

// Inline tab bar component
const ScrollViewTabs = ({ activeTab, setActiveTab, unreadCount }) => {
  const { ScrollView } = require('react-native');
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: `Unread (${unreadCount})` },
    { id: 'order', label: '📦 Orders' },
    { id: 'plant', label: '🌱 Plants' },
    { id: 'awareness', label: '💡 Tips' },
  ];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabChip, activeTab === tab.id && styles.tabChipActive]}
          onPress={() => setActiveTab(tab.id)}
        >
          <Text style={[styles.tabChipText, activeTab === tab.id && { color: '#fff' }]}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
  unreadCount: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  markAllText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  tabsRow: { paddingHorizontal: SPACING.md, gap: 8, paddingBottom: SPACING.sm },
  tabChip: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 8, ...SHADOWS.card,
  },
  tabChipActive: { backgroundColor: COLORS.primary },
  tabChipText: { fontSize: 12, fontWeight: '600', color: COLORS.text.secondary },
  list: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: 40 },
  notifCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md,
    flexDirection: 'row', gap: SPACING.md, ...SHADOWS.card,
  },
  notifCardUnread: { borderLeftWidth: 3, borderLeftColor: COLORS.primary },
  notifIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  notifHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notifTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text.primary, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: 6 },
  notifBody: { fontSize: 13, color: COLORS.text.secondary, marginTop: 4, lineHeight: 20 },
  notifTime: { fontSize: 11, color: COLORS.text.muted, marginTop: 6 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: SPACING.sm },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text.muted },
  prefsSection: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, margin: SPACING.sm, padding: SPACING.md, ...SHADOWS.card },
  prefsSectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text.primary, marginBottom: SPACING.md },
  prefRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  prefLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  prefSub: { fontSize: 12, color: COLORS.text.muted, marginTop: 2 },
});

export default NotificationsScreen;
