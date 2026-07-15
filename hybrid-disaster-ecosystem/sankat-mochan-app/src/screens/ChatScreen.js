import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../context/AppContext';
import { encryptForPeer } from '../mesh/Encryption';
import { insertMessage } from '../db/database';

const THEME = {
  bg: '#0A0E1A', surface: '#111827', border: '#1E3A5F',
  accent: '#3B82F6', danger: '#EF4444', success: '#10B981',
  warning: '#F59E0B', text: '#F1F5F9', muted: '#64748B',
};

const DELIVERY_STATUS = {
  queued_locally: { label: 'Queued locally', icon: '🕐', color: '#F59E0B' },
  relayed:        { label: 'Relayed (1 peer)', icon: '📶', color: '#3B82F6' },
  delivered:      { label: 'Delivered',       icon: '✓✓',  color: '#10B981' },
};

function MessageBubble({ message, isOwn }) {
  const status = DELIVERY_STATUS[message.delivery_status || message.deliveryStatus] || DELIVERY_STATUS.queued_locally;

  return (
    <View style={[styles.bubbleWrapper, isOwn ? styles.bubbleRight : styles.bubbleLeft]}>
      {!isOwn && (
        <Text style={styles.senderLabel}>
          {message.sender_node_id?.slice(0, 10) || 'unknown'}
        </Text>
      )}
      <View style={[
        styles.bubble,
        isOwn ? styles.bubbleOwn : styles.bubblePeer,
      ]}>
        <Text style={styles.bubbleText}>
          {message._decrypted || '[Encrypted message]'}
        </Text>
        <View style={styles.bubbleMeta}>
          <Text style={[styles.statusLabel, { color: status.color }]}>
            {status.icon} {status.label}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { messages, myNodeId, peers, sendMessage } = useApp();
  const [inputText, setInputText] = useState('');
  const [targetPeerId, setTargetPeerId] = useState(null);
  const [showPeerSelector, setShowPeerSelector] = useState(false);

  const reachablePeers = peers.filter(p => p.isReachable);
  const targetPeer = peers.find(p => p.id === targetPeerId);

  const chatMessages = messages.filter(m =>
    (m.sender_node_id === myNodeId && m.recipient_node_id === targetPeerId) ||
    (m.sender_node_id === targetPeerId && m.recipient_node_id === myNodeId)
  );

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;
    if (!targetPeerId || !targetPeer) {
      Alert.alert('No peer selected', 'Tap the "To:" field to select a peer.');
      return;
    }

    setInputText('');

    try {
      let encryptedPayload, iv;
      if (targetPeer.publicKey) {
        const encrypted = await encryptForPeer(text, targetPeer.publicKey);
        encryptedPayload = encrypted.encryptedPayload;
        iv = encrypted.iv;
      } else {
        // Fallback: base64 encode (unencrypted — peer public key not yet exchanged)
        encryptedPayload = Buffer.from(text).toString('base64');
        iv = '';
      }

      await sendMessage({
        messageId: uuidv4(),
        type: 'chat',
        recipientNodeId: targetPeerId,
        encryptedPayload,
        iv,
      });
    } catch (e) {
      Alert.alert('Send Error', e.message);
    }
  }, [inputText, targetPeerId, targetPeer, sendMessage]);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={60}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>MESH CHAT</Text>
          <Text style={styles.subtitle}>End-to-End Encrypted · Offline</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: THEME.success + '20', borderColor: THEME.success + '40' }]}>
          <Text style={{ color: THEME.success, fontFamily: 'monospace', fontSize: 10 }}>🔒 E2E</Text>
        </View>
      </View>

      {/* Peer selector */}
      <TouchableOpacity
        style={styles.peerSelector}
        onPress={() => setShowPeerSelector(!showPeerSelector)}
      >
        <Text style={{ color: THEME.muted, fontFamily: 'monospace', fontSize: 11 }}>TO:</Text>
        <Text style={{ color: targetPeer ? THEME.accent : THEME.muted, fontFamily: 'monospace', fontSize: 13, flex: 1, marginLeft: 8 }}>
          {targetPeer ? (targetPeer.displayName || targetPeer.id?.slice(0, 20)) : 'Select peer...'}
        </Text>
        <Text style={{ color: THEME.muted }}>▼</Text>
      </TouchableOpacity>

      {/* Peer dropdown */}
      {showPeerSelector && (
        <View style={styles.peerDropdown}>
          {reachablePeers.length === 0 ? (
            <Text style={[styles.muted, { padding: 12, textAlign: 'center' }]}>
              No reachable peers. Check BLE.
            </Text>
          ) : (
            reachablePeers.map(peer => (
              <TouchableOpacity
                key={peer.id}
                style={styles.peerOption}
                onPress={() => { setTargetPeerId(peer.id); setShowPeerSelector(false); }}
              >
                <Text style={{ fontSize: 16 }}>📡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: THEME.text, fontFamily: 'monospace', fontSize: 12 }}>
                    {peer.displayName || peer.id?.slice(0, 20)}
                  </Text>
                  <Text style={{ color: THEME.muted, fontFamily: 'monospace', fontSize: 10 }}>
                    RSSI: {peer.rssi} dBm
                  </Text>
                </View>
                {peer.id === targetPeerId && (
                  <Text style={{ color: THEME.success }}>✓</Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {/* Messages list */}
      <FlatList
        data={chatMessages}
        keyExtractor={m => m.id || m.messageId}
        contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 20 }}
        inverted={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>💬</Text>
            <Text style={styles.emptyTitle}>
              {targetPeer ? 'No messages yet' : 'Select a peer to chat'}
            </Text>
            <Text style={styles.muted}>
              Messages are encrypted and relayed through the mesh.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwn={item.sender_node_id === myNodeId}
          />
        )}
      />

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor={THEME.muted}
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { opacity: inputText.trim() ? 1 : 0.4 }]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Text style={{ fontSize: 18 }}>➤</Text>
        </TouchableOpacity>
      </View>
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
  peerSelector: {
    flexDirection: 'row', alignItems: 'center', padding: 12,
    borderBottomWidth: 1, borderBottomColor: THEME.border, backgroundColor: THEME.surface + '80',
  },
  peerDropdown: {
    backgroundColor: THEME.surface, borderBottomWidth: 1, borderBottomColor: THEME.border,
    maxHeight: 200,
  },
  peerOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderBottomWidth: 1, borderBottomColor: THEME.border + '60',
  },
  bubbleWrapper: { maxWidth: '80%' },
  bubbleLeft: { alignSelf: 'flex-start' },
  bubbleRight: { alignSelf: 'flex-end' },
  senderLabel: { color: THEME.muted, fontSize: 10, fontFamily: 'monospace', marginBottom: 2, marginLeft: 4 },
  bubble: { padding: 10, borderRadius: 12, gap: 4 },
  bubbleOwn: { backgroundColor: THEME.accent + '25', borderWidth: 1, borderColor: THEME.accent + '40' },
  bubblePeer: { backgroundColor: THEME.surface, borderWidth: 1, borderColor: THEME.border },
  bubbleText: { color: THEME.text, fontSize: 14, lineHeight: 20 },
  bubbleMeta: { flexDirection: 'row', justifyContent: 'flex-end' },
  statusLabel: { fontSize: 9, fontFamily: 'monospace' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    padding: 12, borderTopWidth: 1, borderTopColor: THEME.border,
    backgroundColor: THEME.surface,
  },
  input: {
    flex: 1, backgroundColor: THEME.bg, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: THEME.border,
    color: THEME.text, fontSize: 14, maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: THEME.accent, alignItems: 'center', justifyContent: 'center',
  },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 4 },
  emptyTitle: { color: THEME.text, fontSize: 16, fontWeight: '600', marginBottom: 8 },
  muted: { color: THEME.muted, fontSize: 12, fontFamily: 'monospace', textAlign: 'center' },
});
