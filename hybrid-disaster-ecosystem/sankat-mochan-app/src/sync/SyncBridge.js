import NetInfo from '@react-native-community/netinfo';
import { v4 as uuidv4 } from 'uuid';
import {
  getUnsentMessages,
  getUnsentIncidents,
  enqueueOutboxPayload,
  getPendingOutboxItems,
  markOutboxItemDone,
  markOutboxItemFailed,
} from '../db/database';
import { getIdentityValue } from '../db/database';

// ============================================================
// SYNC BRIDGE — Edge-to-Cloud Uplink
// When ANY device in the mesh detects internet connectivity,
// it bundles all unsent local data and uploads to Firebase.
// ============================================================

const CLOUD_FUNCTION_URL = 'https://us-central1-YOUR_PROJECT.cloudfunctions.net/ingestMeshPayload';
const RETRY_DELAY_MS = 5000;
const MAX_RETRIES = 5;

class SyncBridgeClass {
  constructor() {
    this._unsubscribeNetInfo = null;
    this._syncInProgress = false;
    this._onSyncStatus = null; // UI callback
  }

  start(onSyncStatus) {
    this._onSyncStatus = onSyncStatus;
    console.log('[SyncBridge] Starting network monitor...');

    this._unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected && state.isInternetReachable;
      if (isConnected && !this._syncInProgress) {
        console.log(`[SyncBridge] Internet detected (${state.type}). Triggering uplink...`);
        this._updateStatus('online');
        this._triggerUplink();
      } else if (!isConnected) {
        this._updateStatus('offline');
      }
    });
  }

  stop() {
    if (this._unsubscribeNetInfo) {
      this._unsubscribeNetInfo();
      this._unsubscribeNetInfo = null;
    }
  }

  _updateStatus(status, detail = '') {
    if (this._onSyncStatus) this._onSyncStatus({ status, detail, timestamp: Date.now() });
  }

  async _triggerUplink() {
    if (this._syncInProgress) return;
    this._syncInProgress = true;

    try {
      await this._bundleAndEnqueue();
      await this._flushOutboxQueue();
    } catch (e) {
      console.error('[SyncBridge] Uplink error:', e);
      this._updateStatus('error', e.message);
    } finally {
      this._syncInProgress = false;
    }
  }

  async _bundleAndEnqueue() {
    const messages  = await getUnsentMessages();
    const incidents = await getUnsentIncidents();

    if (messages.length === 0 && incidents.length === 0) {
      console.log('[SyncBridge] Nothing to sync.');
      return;
    }

    const nodeId    = await getIdentityValue('mesh_node_id');
    const uplinkUid = await getIdentityValue('firebase_uid') || 'anonymous';

    const payload = {
      payloadId:         uuidv4(),
      uplinkNodeId:      nodeId,
      uplinkUid,
      uploadedAt:        new Date().toISOString(),
      sourceClusterId:   `cluster-${nodeId}`,
      encryptionVersion: 'aes-gcm-256-v1',
      messages: messages.map(m => ({
        messageId:        m.id,
        type:             m.type,
        senderNodeId:     m.sender_node_id,
        recipientNodeId:  m.recipient_node_id,
        encryptedPayload: m.encrypted_payload,
        iv:               m.iv,
        hopCount:         m.hop_count,
        ttlOriginal:      7,
        ttlRemaining:     m.ttl_remaining,
        createdAt:        new Date(m.created_at).toISOString(),
        relayedAt:        [],
      })),
      incidents: incidents.map(i => ({
        incidentId:    i.id,
        reporterNodeId: nodeId,
        incidentType:  i.incident_type,
        description:   i.description,
        location: {
          lat:      i.lat,
          lng:      i.lng,
          landmark: i.landmark,
        },
        mediaHash:     null,
        casualtyCount: i.casualty_count,
        damageLevel:   i.damage_level,
        createdAt:     new Date(i.created_at).toISOString(),
      })),
      processedAt:      null,
      processingStatus: 'pending',
    };

    console.log(`[SyncBridge] Bundled ${messages.length} messages and ${incidents.length} incidents.`);
    this._updateStatus('uploading', `Bundling: ${messages.length} msgs, ${incidents.length} incidents`);

    await enqueueOutboxPayload(JSON.stringify(payload));
  }

  async _flushOutboxQueue() {
    const items = await getPendingOutboxItems();
    if (items.length === 0) return;

    console.log(`[SyncBridge] Flushing ${items.length} outbox items...`);

    for (const item of items) {
      await this._uploadItem(item);
    }
  }

  async _uploadItem(item, retryCount = item.retry_count || 0) {
    try {
      const response = await fetch(CLOUD_FUNCTION_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    item.payload_json,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      await markOutboxItemDone(item.id);
      this._updateStatus('synced', 'Upload complete');
      console.log(`[SyncBridge] Item ${item.id} uploaded successfully.`);
    } catch (e) {
      console.error(`[SyncBridge] Upload failed (attempt ${retryCount + 1}):`, e.message);
      if (retryCount < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS * (retryCount + 1))); // Exponential backoff
        await markOutboxItemFailed(item.id, retryCount + 1);
      } else {
        await markOutboxItemFailed(item.id, retryCount + 1);
        this._updateStatus('error', `Max retries reached for item ${item.id}`);
      }
    }
  }
}

export const SyncBridge = new SyncBridgeClass();
export default SyncBridge;
