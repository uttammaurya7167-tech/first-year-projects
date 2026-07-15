import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../context/AppContext';
import { encryptBroadcast } from '../mesh/Encryption';

const THEME = {
  bg: '#0A0E1A', surface: '#111827', border: '#1E3A5F',
  accent: '#3B82F6', danger: '#EF4444', success: '#10B981',
  warning: '#F59E0B', text: '#F1F5F9', muted: '#64748B',
};

// Simple shared broadcast key (in production, distribute via key exchange)
const BROADCAST_KEY_B64 = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='; // 32-byte placeholder

const BROADCAST_PRESETS = [
  { emoji: '🆘', label: 'SOS', text: 'SOS! Emergency assistance needed. Please relay this message.' },
  { emoji: '⚠️', label: 'Flood Alert', text: 'FLOOD ALERT: Rising water in this area. Move to higher ground immediately.' },
  { emoji: '🔥', label: 'Fire Alert', text: 'FIRE ALERT: Active fire in the area. Evacuate now. Follow emergency routes.' },
  { emoji: '🏥', label: 'Medical', text: 'MEDICAL EMERGENCY: Medical assistance urgently required at this location.' },
  { emoji: '✅', label: 'All Clear', text: 'ALL CLEAR: Area declared safe. Rescue teams are operational.' },
];

export default function BroadcastScreen() {
  const { myNodeId, peers, sendMessage } = useApp();
  const [message, setMessage]   = useState('');
  const [sending, setSending]   = useState(false);
  const [sentCount, setSentCount] = useState(null);

  const reachablePeers = peers.filter(p => p.isReachable);

  const handleBroadcast = useCallback(async () => {
    const text = message.trim();
    if (!text) return;

    setSending(true);
    setSentCount(null);

    try {
      const { encryptedPayload, iv } = await encryptBroadcast(text, BROADCAST_KEY_B64);

      await sendMessage({
        messageId: uuidv4(),
        type: 'broadcast',
        recipientNodeId: null, // null = broadcast
        encryptedPayload,
        iv,
      });

      setSentCount(reachablePeers.length);
      setMessage('');
      Alert.alert(
        '📢 Broadcast Sent',
        `Message queued for relay to ${reachablePeers.length} peer(s) and will propagate through the mesh.`
      );
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSending(false);
    }
  }, [message, reachablePeers, sendMessage]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>BROADCAST</Text>
          <Text style={styles.subtitle}>Group mesh broadcast · TTL 7 hops</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: THEME.warning + '20', borderColor: THEME.warning + '40' }]}>
          <Text style={{ color: THEME.warning, fontFamily: 'monospace', fontSize: 10 }}>
            📡 {reachablePeers.length} PEERS
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} keyboardShouldPersistTaps="handled">
        {/* Info card */}
        <View style={styles.infoCard}>
          <Text style={{ fontSize: 20 }}>📢</Text>
          <Text style={{ color: THEME.muted, fontSize: 12, fontFamily: 'monospace', flex: 1 }}>
            Broadcasts are relayed to ALL peers up to 7 hops away. Use for urgent group announcements only.
          </Text>
        </View>

        {/* Quick presets */}
        <View>
          <Text style={styles.sectionLabel}>QUICK PRESETS</Text>
          <View style={styles.presetGrid}>
            {BROADCAST_PRESETS.map(preset => (
              <TouchableOpacity
                key={preset.label}
                style={styles.presetBtn}
                onPress={() => setMessage(preset.text)}
              >
                <Text style={{ fontSize: 20 }}>{preset.emoji}</Text>
                <Text style={{ color: THEME.text, fontSize: 11, fontFamily: 'monospace', marginTop: 4 }}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Message editor */}
        <View>
          <Text style={styles.sectionLabel}>MESSAGE</Text>
          <TextInput
            style={styles.textArea}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your broadcast message..."
            placeholderTextColor={THEME.muted}
            multiline
            numberOfLines={5}
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: message.length > 800 ? THEME.danger : THEME.muted }]}>
            {message.length}/1000
          </Text>
        </View>

        {/* Broadcast button */}
        <TouchableOpacity
          style={[
            styles.broadcastBtn,
            { opacity: (!message.trim() || sending) ? 0.4 : 1 }
          ]}
          onPress={handleBroadcast}
          disabled={!message.trim() || sending}
        >
          <Text style={{ fontSize: 20 }}>📢</Text>
          <Text style={styles.broadcastBtnText}>
            {sending ? 'Broadcasting...' : `BROADCAST TO MESH`}
          </Text>
        </TouchableOpacity>

        {sentCount !== null && (
          <View style={styles.successBanner}>
            <Text style={{ color: THEME.success, fontFamily: 'monospace', fontSize: 13 }}>
              ✅ Broadcast queued → {sentCount} immediate peers + mesh propagation
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: THEME.border, backgroundColor: THEME.surface,
  },
  title: { color: THEME.text, fontSize: 18, fontWeight: '800', fontFamily: 'monospace', letterSpacing: 2 },
  subtitle: { color: THEME.muted, fontSize: 11, marginTop: 2, fontFamily: 'monospace' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  infoCard: {
    flexDirection: 'row', gap: 12, padding: 12, borderRadius: 10,
    backgroundColor: THEME.accent + '10', borderWidth: 1, borderColor: THEME.accent + '30',
    alignItems: 'center',
  },
  sectionLabel: {
    color: THEME.muted, fontFamily: 'monospace', fontSize: 10,
    letterSpacing: 2, marginBottom: 8,
  },
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  presetBtn: {
    backgroundColor: THEME.surface, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: THEME.border, alignItems: 'center',
    minWidth: '28%', flex: 1,
  },
  textArea: {
    backgroundColor: THEME.surface, borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: THEME.border, color: THEME.text,
    fontSize: 14, lineHeight: 22, minHeight: 120,
  },
  charCount: { textAlign: 'right', fontFamily: 'monospace', fontSize: 11, marginTop: 4 },
  broadcastBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: THEME.danger, borderRadius: 12, padding: 16,
  },
  broadcastBtnText: { color: 'white', fontWeight: '800', fontFamily: 'monospace', fontSize: 15, letterSpacing: 1 },
  successBanner: {
    padding: 12, borderRadius: 10,
    backgroundColor: THEME.success + '15', borderWidth: 1, borderColor: THEME.success + '40',
  },
});
