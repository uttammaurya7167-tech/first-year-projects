# 🆘 Hybrid Disaster Management Ecosystem

A military-grade, offline-first disaster response and communication ecosystem. This platform coordinates civilian reporting through peer-to-peer (P2P) BLE mesh network overlays and synchronizes to a cloud command deck utilizing Firebase and GPT-powered triage automation.

---

## 🏗️ Architecture Overview

The system operates across three primary physical topologies to route emergency payloads from disconnected disaster zones to relief coordinators:

```
┌────────────────────────────────────────────────────────────────┐
│                      DISASTER AREA (OFFLINE)                   │
│                                                                │
│  📱 Sankat Mochan A   ←—BLE—→   📱 Node B   ←—BLE—→   📱 Node C   │
│     (Civilian Client)          (Mesh Relay)        (Internet Uplink)
└───────────────────────────────────────────────────────────│────┘
                                                            │ HTTPS POST
                                                ┌───────────▼──────────┐
                                                │  Firebase Cloud Fn   │
                                                │  ingestMeshPayload   │
                                                │  ┌─────────────────┐ │
                                                │  │  AI Triage GPT  │ │
                                                │  └────────┬────────┘ │
                                                └───────────│──────────┘
                                                            │ Firestore Sync
                                                ┌───────────▼──────────┐
                                                │  Command Dashboard   │
                                                │  (RTDRCP Web Portal) │
                                                │  🗺️ Live GIS Map     │
                                                └──────────────────────┘
```

---

## 📡 BLE Mesh Protocol & Store-and-Forward Routing

* **Custom BLE Protocol**: Employs a flooding-mesh algorithm with a custom packet structure designed for low-overhead broadcast.
  * **Payload Budget**: Fixed MTU of 512 bytes over BLE write-without-response attributes.
  * **Packet Schema**: `{ messageId, type, senderNodeId, recipientNodeId, TTL, payload, signature }`.
* **Store-and-Forward**: If no active peers are nearby, packets are cached inside local device SQLite stores. As soon as a peer advertising the mesh service UUID is discovered, nodes exchange delta-tables and relay unsynced logs.
* **Collision & Loop Prevention**: Each node maintains an in-memory deduplication bloom filter (default cache size: last 1,000 message IDs). TTL (Time-To-Live) starts at `7` and decrements at each node hop; packets with `TTL <= 0` are immediately dropped.

---

## 🔐 Cryptographic Encryption Layer

All offline mesh communication is encrypted end-to-end (E2E) using a hybrid cryptographic framework:
* **Key Agreement**: Custom Elliptic Curve Diffie-Hellman (ECDH) exchange over the **secp256r1 (P-256)** curve. Nodes exchange public keys on initial connection to derive a shared secret.
* **Symmetric Encryption**: Derived shared secrets are hashed via HKDF-SHA256 to generate ephemeral keys for **AES-256-GCM** encryption. This guarantees message confidentiality and integrity.
* **Device Authentication**: Local SQLite databases encrypt keys using SQLCipher.

---

## 🤖 AI Triage Pipeline (Firebase Cloud Functions)

When a node with cellular/satellite uplink encounters internet connection, it posts its mesh database logs to Firebase.
1. **Ingest Payload**: Schema validator strips signatures and ensures metadata completeness.
2. **GPT-4o Triage Analysis**: The Cloud Function sends the unstructured incident message to OpenAI with a strict JSON format prompt.
3. **Information Extraction**:
   * **Severity**: Classifies from `P1` (Immediate life threat) to `P4` (Minor/Information only).
   * **Category**: Tags as Medical, Fire, Structure Collapse, Flood, Hazmat, or Security.
   * **Resource Requirements**: Estimates rescue assets needed (e.g., "1 ambulance", "heavy rescue tools").
4. **Command Update**: Write directly to Firestore collections, triggering real-time UI canvas refreshes in the web Command Portal via WebSockets.

---

## 📦 Project Layout

```
hybrid-disaster-ecosystem/
├── database/                    # Database schemas and rules
│   ├── firestore.rules          # Firestore granular ACL rules
│   ├── schema.md                # SQLite & Firestore database schemas
│   └── sample-payloads.json     # Test JSON meshes
│
├── rtdrcp-portal/               # Next.js Command Deck Dashboard
│   ├── src/
│   │   ├── app/                 # App Router (globals, layouts, views)
│   │   ├── components/          # Leaflet GIS maps, triage sidebar panels
│   │   └── lib/                 # Firebase SDK integration & mock generators
│   └── package.json
│
├── sankat-mochan-app/           # React Native Expo Mobile App
│   ├── src/
│   │   ├── db/                  # SQLite schema declarations & SQLCipher configs
│   │   ├── mesh/                # MeshManager.js (BLE loops) & Encryption.js
│   │   ├── sync/                # SyncBridge.js (uplink daemon)
│   │   └── screens/             # Map, chat, reports, settings
│   └── package.json
│
└── cloud-functions/             # Firebase serverless environment
    └── functions/
        ├── index.js             # API endpoint entry point
        └── services/            # OpenAI triage engine and schema validators
```

---

## 🚀 Setup & Execution

### Next.js Command Deck
```bash
cd rtdrcp-portal
npm install
npm run dev
```

### React Native Mobile App
```bash
cd sankat-mochan-app
npm install
npx expo start
```

### Firebase Cloud Functions
```bash
cd cloud-functions/functions
npm install
cd ..
firebase emulators:start
```
