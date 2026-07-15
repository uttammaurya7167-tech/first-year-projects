import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import { insertMessage, updateMessageStatus } from '../db/database';

// ============================================================
// BLE MESH MANAGER
// Implements store-and-forward multi-hop mesh routing with:
//   - TTL/Hop Limit enforcement (default TTL = 7)
//   - SHA-based message deduplication
//   - Store-and-forward queue
//   - Low Power Mode (reduced scan intervals)
// ============================================================

const SERVICE_UUID        = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'; // Custom SankatMochan service
const CHARACTERISTIC_UUID = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E'; // Write characteristic
const NOTIFY_UUID         = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E'; // Notify characteristic

const DEFAULT_TTL           = 7;
const SCAN_INTERVAL_NORMAL  = 5000;  // ms between scans (normal mode)
const SCAN_INTERVAL_LOW_PWR = 30000; // ms between scans (low power mode)
const SCAN_DURATION         = 4;     // seconds per scan window
const MAX_PACKET_SIZE       = 512;   // BLE ATT MTU limit (bytes)

class MeshManagerClass {
  constructor() {
    this.isInitialized  = false;
    this.isScanning     = false;
    this.lowPowerMode   = false;
    this.myNodeId       = null;
    this.peers          = new Map();      // nodeId -> { deviceId, rssi, publicKey, lastSeen }
    this.seenMessages   = new Set();      // Deduplication cache (Set of messageId hashes)
    this.forwardQueue   = [];             // Pending messages awaiting relay
    this.onPeersUpdate  = null;           // Callback for UI updates
    this.onMessageReceived = null;        // Callback for incoming messages
    this.bleManagerEmitter = null;
    this._scanTimer = null;
  }

  async initialize(nodeId, callbacks = {}) {
    this.myNodeId = nodeId;
    this.onPeersUpdate = callbacks.onPeersUpdate;
    this.onMessageReceived = callbacks.onMessageReceived;

    await BleManager.start({ showAlert: false });

    this.bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

    this.bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this._onDiscoverPeer.bind(this));
    this.bleManagerEmitter.addListener('BleManagerStopScan',          this._onScanStop.bind(this));
    this.bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this._onDataReceived.bind(this));
    this.bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this._onPeerDisconnected.bind(this));

    this.isInitialized = true;
    console.log(`[MeshManager] Initialized. Node ID: ${nodeId}`);

    this._startScanCycle();
  }

  setLowPowerMode(enabled) {
    this.lowPowerMode = enabled;
    console.log(`[MeshManager] Low Power Mode: ${enabled}`);
    // Restart scan cycle with new interval
    if (this._scanTimer) clearTimeout(this._scanTimer);
    this._startScanCycle();
  }

  // ---- Scanning ----
  _startScanCycle() {
    const interval = this.lowPowerMode ? SCAN_INTERVAL_LOW_PWR : SCAN_INTERVAL_NORMAL;
    this._doScan();
    this._scanTimer = setInterval(() => this._doScan(), interval);
  }

  async _doScan() {
    if (this.isScanning) return;
    try {
      this.isScanning = true;
      await BleManager.scan([SERVICE_UUID], SCAN_DURATION, false);
    } catch (e) {
      console.error('[MeshManager] Scan error:', e);
      this.isScanning = false;
    }
  }

  _onScanStop() {
    this.isScanning = false;
    this._processForwardQueue();
  }

  // ---- Peer discovery ----
  _onDiscoverPeer(peripheral) {
    const { id: deviceId, rssi, advertising } = peripheral;
    // Extract our custom advertised node ID from manufacturer data or local name
    const nodeId = advertising?.localName || deviceId;
    if (nodeId === this.myNodeId) return; // Ignore self

    const existing = this.peers.get(nodeId);
    this.peers.set(nodeId, {
      deviceId,
      rssi,
      lastSeen: Date.now(),
      publicKey: existing?.publicKey || null,
      isReachable: true,
    });

    if (this.onPeersUpdate) {
      this.onPeersUpdate([...this.peers.entries()].map(([id, info]) => ({ id, ...info })));
    }
  }

  _onPeerDisconnected(data) {
    const { peripheral: deviceId } = data;
    // Mark as unreachable (keep in map for history)
    for (const [nodeId, info] of this.peers.entries()) {
      if (info.deviceId === deviceId) {
        this.peers.set(nodeId, { ...info, isReachable: false });
        break;
      }
    }
    if (this.onPeersUpdate) {
      this.onPeersUpdate([...this.peers.entries()].map(([id, info]) => ({ id, ...info })));
    }
  }

  // ---- Sending messages ----
  async sendMessage({ messageId, type, recipientNodeId, encryptedPayload, iv }) {
    const packet = {
      messageId: messageId || uuidv4(),
      type,
      senderNodeId: this.myNodeId,
      recipientNodeId: recipientNodeId || null,
      encryptedPayload,
      iv,
      hopCount: 0,
      ttlRemaining: DEFAULT_TTL,
      createdAt: Date.now(),
    };

    // Save locally first
    await insertMessage({
      ...packet,
      deliveryStatus: 'queued_locally',
    });

    // Add to forward queue
    this.forwardQueue.push(packet);
    this._processForwardQueue();
  }

  async _processForwardQueue() {
    if (this.forwardQueue.length === 0) return;
    const reachablePeers = [...this.peers.values()].filter(p => p.isReachable);
    if (reachablePeers.length === 0) return;

    const toProcess = [...this.forwardQueue];
    this.forwardQueue = [];

    for (const packet of toProcess) {
      // TTL check
      if (packet.ttlRemaining <= 0) {
        console.warn(`[MeshManager] Dropping packet ${packet.messageId} — TTL exhausted`);
        continue;
      }

      let sent = false;
      for (const peer of reachablePeers) {
        // If directed message, only send to specific peer
        if (packet.recipientNodeId && !this._isPeer(peer.deviceId, packet.recipientNodeId)) {
          continue;
        }
        try {
          await this._writePacketToPeer(peer.deviceId, packet);
          sent = true;
          await updateMessageStatus(packet.messageId,
            peer.deviceId === packet.recipientNodeId ? 'delivered' : 'relayed'
          );
        } catch (e) {
          console.warn(`[MeshManager] Failed to send to ${peer.deviceId}:`, e.message);
        }
      }

      if (!sent) {
        // Re-queue if no peer was available (store-and-forward)
        this.forwardQueue.push(packet);
      }
    }
  }

  _isPeer(deviceId, nodeId) {
    const peer = this.peers.get(nodeId);
    return peer?.deviceId === deviceId;
  }

  async _writePacketToPeer(deviceId, packet) {
    const decremented = { ...packet, hopCount: packet.hopCount + 1, ttlRemaining: packet.ttlRemaining - 1 };
    const jsonStr  = JSON.stringify(decremented);
    const chunks   = this._chunkString(jsonStr, MAX_PACKET_SIZE);
    const totalChunks = chunks.length;

    // Connect if needed
    try {
      await BleManager.connect(deviceId);
      await BleManager.retrieveServices(deviceId);
    } catch (e) {
      // Already connected or error — continue
    }

    for (let i = 0; i < chunks.length; i++) {
      const header = JSON.stringify({ ci: i, ct: totalChunks, mid: packet.messageId });
      const fullChunk = `${header}|${chunks[i]}`;
      const bytes = Array.from(Buffer.from(fullChunk, 'utf8'));
      await BleManager.write(deviceId, SERVICE_UUID, CHARACTERISTIC_UUID, bytes, MAX_PACKET_SIZE);
    }
  }

  _chunkString(str, size) {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
      chunks.push(str.slice(i, i + size));
    }
    return chunks;
  }

  // ---- Receiving messages ----
  _packetBuffer = {}; // Reassembly buffer per messageId

  _onDataReceived(data) {
    try {
      const raw = Buffer.from(data.value, 'base64').toString('utf8');
      const separatorIdx = raw.indexOf('|');
      if (separatorIdx === -1) return;

      const header  = JSON.parse(raw.slice(0, separatorIdx));
      const payload = raw.slice(separatorIdx + 1);
      const { ci, ct, mid } = header;

      if (!this._packetBuffer[mid]) {
        this._packetBuffer[mid] = { chunks: new Array(ct), received: 0, total: ct };
      }

      const buf = this._packetBuffer[mid];
      buf.chunks[ci] = payload;
      buf.received++;

      if (buf.received === buf.total) {
        const full = buf.chunks.join('');
        delete this._packetBuffer[mid];
        this._handleCompletePacket(JSON.parse(full));
      }
    } catch (e) {
      console.error('[MeshManager] Packet parse error:', e);
    }
  }

  async _handleCompletePacket(packet) {
    const { messageId, senderNodeId, ttlRemaining, type } = packet;

    // Deduplication
    if (this.seenMessages.has(messageId)) {
      console.log(`[MeshManager] Duplicate packet ignored: ${messageId}`);
      return;
    }
    this.seenMessages.add(messageId);

    // TTL check
    if (ttlRemaining <= 0) {
      console.warn(`[MeshManager] TTL=0, not forwarding: ${messageId}`);
      return;
    }

    // Prune dedup cache (keep last 1000 IDs)
    if (this.seenMessages.size > 1000) {
      const iter = this.seenMessages.values();
      this.seenMessages.delete(iter.next().value);
    }

    // Save and notify UI
    await insertMessage({ ...packet, deliveryStatus: 'delivered' });
    if (this.onMessageReceived) {
      this.onMessageReceived(packet);
    }

    // Forward to other peers (store-and-forward)
    const isDirectedToMe = packet.recipientNodeId === this.myNodeId;
    if (!isDirectedToMe) {
      this.forwardQueue.push(packet);
      this._processForwardQueue();
    }
  }

  destroy() {
    if (this._scanTimer) clearInterval(this._scanTimer);
    BleManager.stopScan();
    if (this.bleManagerEmitter) {
      this.bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
      this.bleManagerEmitter.removeAllListeners('BleManagerStopScan');
      this.bleManagerEmitter.removeAllListeners('BleManagerDidUpdateValueForCharacteristic');
      this.bleManagerEmitter.removeAllListeners('BleManagerDisconnectPeripheral');
    }
  }
}

export const MeshManager = new MeshManagerClass();
export default MeshManager;
