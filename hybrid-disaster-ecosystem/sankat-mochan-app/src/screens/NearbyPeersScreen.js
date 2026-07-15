import React, { useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useApp } from '../context/AppContext';

const THEME = {
  bg: '#0A0E1A', surface: '#111827', border: '#1E3A5F',
  accent: '#3B82F6', danger: '#EF4444', success: '#10B981',
  warning: '#F59E0B', text: '#F1F5F9', muted: '#64748B',
};

function getRssiLabel(rssi) {
  if (rssi >= -60) return { label: 'Strong', color: THEME.success };
  if (rssi >= -75) return { label: 'Good',   color: THEME.warning };
  if (rssi >= -90) return { label: 'Weak',   color: THEME.danger };
  return                   { label: 'Faint',  color: '#64748B' };
}

function PeerCard({ peer, myNodeId }) {
  const rssiInfo = getRssiLabel(peer.rssi);
  const isMe = peer.id === myNodeId;
  const timeSince = peer.lastSeen
    ? Math.round((Date.now() - peer.lastSeen) / 1000)
    : null;

  return (
    <View style={[styles.card, { opacity: peer.isReachable ? 1 : 0.5 }]}>
      {/* Avatar / icon */}
      <View style={[styles.avatar, { backgroundColor: isMe ? THEME.accent + '30' : THEME.surface }]}>
        <Text style={{ fontSize: 22 }}>{peer.isReachable ? '📡' : '📴'}</Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardRow}>
          <Text style={styles.peerName} numberOfLines={1}>
            {peer.displayName || peer.id?.slice(0, 14) + '…'}
          </Text>
          <View style={[styles.badge, { backgroundColor: rssiInfo.color + '20', borderColor: rssiInfo.color + '60' }]}>
            <Text style={[styles.badgeText, { color: rssiInfo.color }]}>
              {rssiInfo.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <Text style={styles.muted} numberOfLines={1}>
            ID: {peer.id?.slice(0, 18)}...
          </Text>
          {timeSince !== null && (
            <Text style={[styles.muted, { fontSize: 10 }]}>
              {timeSince < 60 ? `${timeSince}s ago` : `${Math.floor(timeSince / 60)}m ago`}
            </Text>
          )}
        </View>

        <View style={styles.cardRow}>
          <Text style={[styles.muted, { fontSize: 10 }]}>
            RSSI: {peer.rssi ?? 'N/A'} dBm
          </Text>
          <View style={[styles.statusDot, {
            backgroundColor: peer.isReachable ? THEME.success : THEME.muted,
          }]} />
        </View>
      </View>
    </View>
  );
}

export default function NearbyPeersScreen() {
  const { peers, myNodeId, syncStatus, isReady } = useApp();

  const sortedPeers = useMemo(() =>
    [...peers].sort((a, b) => (b.rssi ?? -200) - (a.rssi ?? -200)),
    [peers]
  );

  if (!isReady) {
    return (
      <View style={styles.centerScreen}>
        <ActivityIndicator color={THEME.accent} size="large" />
        <Text style={[styles.muted, { marginTop: 12 }]}>Initializing BLE mesh...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>NEARBY PEERS</Text>
          <Text style={styles.subtitle}>BLE Mesh Network</Text>
        </View>
        <View>
          <View style={styles.countBadge}>
            <Text style={{ color: THEME.success, fontFamily: 'monospace', fontWeight: '700', fontSize: 18 }}>
              {peers.filter(p => p.isReachable).length}
            </Text>
            <Text style={[styles.muted, { fontSize: 10 }]}>REACHABLE</Text>
          </View>
        </View>
      </View>

      {/* My node info */}
      <View style={styles.myNodeBanner}>
        <Text style={{ fontSize: 14 }}>🔵</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: THEME.accent, fontFamily: 'monospace', fontSize: 11, fontWeight: '600' }}>
            MY NODE ID
          </Text>
          <Text style={{ color: THEME.text, fontFamily: 'monospace', fontSize: 12 }}>{myNodeId}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: THEME.accent + '20', borderColor: THEME.accent + '60' }]}>
          <Text style={[styles.badgeText, { color: THEME.accent }]}>LOCAL</Text>
        </View>
      </View>

      {/* Sync status banner */}
      {syncStatus?.status !== 'offline' && (
        <View style={[styles.syncBanner, {
          backgroundColor: syncStatus.status === 'synced' ? THEME.success + '15' : THEME.warning + '15',
          borderColor: syncStatus.status === 'synced' ? THEME.success + '40' : THEME.warning + '40',
        }]}>
          <Text style={{ color: syncStatus.status === 'synced' ? THEME.success : THEME.warning, fontSize: 12 }}>
            {syncStatus.status === 'uploading' ? '⬆️' : syncStatus.status === 'synced' ? '✅' : '⚡'}
            {'  '}{syncStatus.detail || syncStatus.status.toUpperCase()}
          </Text>
        </View>
      )}

      {/* Peers list */}
      <FlatList
        data={sortedPeers}
        keyExtractor={p => p.id}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📡</Text>
            <Text style={styles.emptyTitle}>Scanning for peers...</Text>
            <Text style={styles.muted}>
              Make sure Bluetooth is enabled.{'\n'}
              Other Sankat Mochan devices will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => <PeerCard peer={item} myNodeId={myNodeId} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.bg },
  centerScreen: { flex: 1, backgroundColor: THEME.bg, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: THEME.border,
    backgroundColor: THEME.surface,
  },
  title: { color: THEME.text, fontSize: 18, fontWeight: '800', fontFamily: 'monospace', letterSpacing: 2 },
  subtitle: { color: THEME.muted, fontSize: 11, marginTop: 2, fontFamily: 'monospace' },
  countBadge: { alignItems: 'center' },
  myNodeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 12, padding: 12, borderRadius: 10,
    backgroundColor: THEME.accent + '10', borderWidth: 1, borderColor: THEME.accent + '30',
  },
  syncBanner: {
    marginHorizontal: 12, marginBottom: 4, padding: 10, borderRadius: 8,
    borderWidth: 1,
  },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: THEME.surface, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: THEME.border,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  cardContent: { flex: 1, gap: 3 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  peerName: { color: THEME.text, fontWeight: '600', fontSize: 13, flex: 1 },
  badge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6,
    borderWidth: 1, marginLeft: 6,
  },
  badgeText: { fontFamily: 'monospace', fontSize: 9, fontWeight: '700' },
  muted: { color: THEME.muted, fontSize: 11, fontFamily: 'monospace' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 4 },
  emptyTitle: { color: THEME.text, fontSize: 16, fontWeight: '600', marginBottom: 8 },
});
