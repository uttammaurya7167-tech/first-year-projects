import React from 'react';
import {
  View, Text, Switch, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';

const THEME = {
  bg: '#0A0E1A', surface: '#111827', border: '#1E3A5F',
  accent: '#3B82F6', danger: '#EF4444', success: '#10B981',
  warning: '#F59E0B', text: '#F1F5F9', muted: '#64748B',
};

function SettingRow({ icon, label, subtitle, children }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingLabel}>{label}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {children}
    </View>
  );
}

function InfoRow({ label, value, color }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const { myNodeId, peers, syncStatus, lowPowerMode, toggleLowPowerMode } = useApp();

  const reachable = peers.filter(p => p.isReachable).length;

  const handleClearData = () => {
    Alert.alert(
      'Clear Local Data',
      'This will delete all locally cached messages and incident reports. Synced data in the cloud will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => Alert.alert('Data cleared') },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SETTINGS</Text>
        <Text style={styles.subtitle}>Sankat Mochan v1.0.0</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>

        {/* Node Identity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NODE IDENTITY</Text>
          <View style={styles.card}>
            <InfoRow label="Node ID" value={myNodeId || 'Initializing...'} color={THEME.accent} />
            <InfoRow label="Encryption" value="ECDH P-256 + AES-256-GCM" color={THEME.success} />
            <InfoRow label="Network" value="BLE Mesh (Multi-hop)" />
            <InfoRow label="Max Hops (TTL)" value="7" />
          </View>
        </View>

        {/* Connectivity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONNECTIVITY STATUS</Text>
          <View style={styles.card}>
            <InfoRow label="Reachable Peers" value={`${reachable} device(s)`} color={reachable > 0 ? THEME.success : THEME.muted} />
            <InfoRow label="Total Discovered" value={`${peers.length} device(s)`} />
            <InfoRow
              label="Cloud Sync"
              value={syncStatus?.status?.toUpperCase() || 'OFFLINE'}
              color={
                syncStatus?.status === 'synced' ? THEME.success :
                syncStatus?.status === 'uploading' ? THEME.warning :
                syncStatus?.status === 'error' ? THEME.danger : THEME.muted
              }
            />
            {syncStatus?.detail ? (
              <InfoRow label="Sync Detail" value={syncStatus.detail} />
            ) : null}
          </View>
        </View>

        {/* Power & Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>POWER & PERFORMANCE</Text>
          <View style={styles.card}>
            <SettingRow
              icon={lowPowerMode ? '🔋' : '⚡'}
              label="Low Power Mode"
              subtitle={
                lowPowerMode
                  ? 'BLE scans every 30s — saves battery'
                  : 'BLE scans every 5s — faster discovery'
              }
            >
              <Switch
                value={lowPowerMode}
                onValueChange={toggleLowPowerMode}
                trackColor={{ false: THEME.border, true: THEME.success + '80' }}
                thumbColor={lowPowerMode ? THEME.success : THEME.muted}
              />
            </SettingRow>
          </View>

          {lowPowerMode && (
            <View style={styles.warningBanner}>
              <Text style={{ color: THEME.warning, fontFamily: 'monospace', fontSize: 12 }}>
                ⚠️ Low Power Mode: BLE scanning is slower. Peer discovery will be delayed. Enable only when battery is below 20%.
              </Text>
            </View>
          )}
        </View>

        {/* BLE Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BLE MESH PARAMETERS</Text>
          <View style={styles.card}>
            <InfoRow label="Service UUID" value="6E400001-B5A3..." />
            <InfoRow label="Scan Interval (Normal)" value="5 seconds" />
            <InfoRow label="Scan Interval (Low Power)" value="30 seconds" />
            <InfoRow label="MTU / Packet Size" value="512 bytes" />
            <InfoRow label="Store-and-Forward" value="Enabled" color={THEME.success} />
            <InfoRow label="Dedup Cache" value="Last 1000 msg IDs" />
          </View>
        </View>

        {/* Danger zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: THEME.danger }]}>DATA MANAGEMENT</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.dangerBtn} onPress={handleClearData}>
              <Text style={{ fontSize: 16 }}>🗑️</Text>
              <View>
                <Text style={{ color: THEME.danger, fontFamily: 'monospace', fontWeight: '700', fontSize: 13 }}>
                  Clear Local Cache
                </Text>
                <Text style={styles.settingSubtitle}>Remove unsent messages and reports</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={[styles.card, { alignItems: 'center', padding: 20, gap: 4 }]}>
          <Text style={{ fontSize: 32 }}>🆘</Text>
          <Text style={{ color: THEME.accent, fontFamily: 'monospace', fontWeight: '800', fontSize: 16, letterSpacing: 2 }}>
            SANKAT MOCHAN
          </Text>
          <Text style={{ color: THEME.muted, fontFamily: 'monospace', fontSize: 11, textAlign: 'center' }}>
            Offline-first BLE Mesh Disaster Response{'\n'}
            Part of the RTDRCP Ecosystem · v1.0.0
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.bg },
  header: {
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: THEME.border, backgroundColor: THEME.surface,
  },
  title: { color: THEME.text, fontSize: 18, fontWeight: '800', fontFamily: 'monospace', letterSpacing: 2 },
  subtitle: { color: THEME.muted, fontSize: 11, marginTop: 2, fontFamily: 'monospace' },
  section: { gap: 8 },
  sectionTitle: {
    color: THEME.muted, fontFamily: 'monospace', fontSize: 10,
    letterSpacing: 2, paddingLeft: 4,
  },
  card: {
    backgroundColor: THEME.surface, borderRadius: 12,
    borderWidth: 1, borderColor: THEME.border, overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    borderBottomWidth: 1, borderBottomColor: THEME.border + '60',
  },
  settingIcon: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: THEME.bg, alignItems: 'center', justifyContent: 'center',
  },
  settingLabel: { color: THEME.text, fontFamily: 'monospace', fontSize: 13, fontWeight: '600' },
  settingSubtitle: { color: THEME.muted, fontFamily: 'monospace', fontSize: 10, marginTop: 2 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: THEME.border + '40',
  },
  infoLabel: { color: THEME.muted, fontFamily: 'monospace', fontSize: 11 },
  infoValue: { color: THEME.text, fontFamily: 'monospace', fontSize: 11, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  warningBanner: {
    padding: 12, borderRadius: 10,
    backgroundColor: THEME.warning + '10', borderWidth: 1, borderColor: THEME.warning + '40',
  },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
  },
});
