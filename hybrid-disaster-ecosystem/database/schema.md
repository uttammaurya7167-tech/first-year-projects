# Disaster Management Ecosystem — Database Schema

## 1. FIRESTORE COLLECTIONS (Cloud)

### Collection: `users`
Document ID: `{uid}` (Firebase Auth UID)
```json
{
  "uid": "string",
  "displayName": "string",
  "role": "responder | commander | civilian",
  "publicKey": "string (base64 PEM — for E2E message verification)",
  "meshNodeId": "string (BLE-generated UUID, stable per device)",
  "lastKnownLocation": {
    "lat": "number",
    "lng": "number",
    "accuracy": "number (metres)",
    "timestamp": "Timestamp"
  },
  "isOnline": "boolean",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### Collection: `meshPayloads`
Document ID: `{payloadId}` (UUID generated at upload time)
```json
{
  "payloadId": "string",
  "uplinkNodeId": "string (meshNodeId of the device that uploaded)",
  "uplinkUid": "string (Firebase Auth UID of uplink node)",
  "uploadedAt": "Timestamp",
  "sourceClusterId": "string (UUID identifying offline BLE cluster)",
  "encryptionVersion": "string (e.g. 'aes-gcm-256-v1')",
  "messages": [
    {
      "messageId": "string (UUID)",
      "type": "chat | sos | broadcast | report",
      "senderNodeId": "string",
      "recipientNodeId": "string | null (null = broadcast)",
      "encryptedPayload": "string (base64 AES-GCM ciphertext)",
      "iv": "string (base64 AES-GCM IV)",
      "hopCount": "number",
      "ttlOriginal": "number (default: 7)",
      "ttlRemaining": "number",
      "createdAt": "Timestamp (device local time)",
      "relayedAt": ["Timestamp (array of relay hop timestamps)"]
    }
  ],
  "incidents": [
    {
      "incidentId": "string (UUID)",
      "reporterNodeId": "string",
      "incidentType": "flood | fire | collapse | medical | missing | other",
      "description": "string (raw text — AI triage input)",
      "location": {
        "lat": "number",
        "lng": "number",
        "landmark": "string"
      },
      "mediaHash": "string | null (SHA-256 of attached media, stored in Firebase Storage)",
      "casualtyCount": "number",
      "damageLevel": "low | medium | high | critical",
      "createdAt": "Timestamp"
    }
  ],
  "processedAt": "Timestamp | null",
  "processingStatus": "pending | processing | completed | failed"
}
```

### Collection: `incidents`
Document ID: `{incidentId}` (UUID — sourced from meshPayload or direct entry)
```json
{
  "incidentId": "string",
  "sourcePayloadId": "string | null (null if entered directly via portal)",
  "incidentType": "flood | fire | collapse | medical | missing | other",
  "rawDescription": "string",
  "aiTriage": {
    "severity": "P1_critical | P2_high | P3_medium | P4_low",
    "category": "rescue | medical | shelter | logistics | information",
    "extractedLocation": "string",
    "keyEntities": ["string"],
    "triageNotes": "string",
    "triageConfidence": "number (0.0–1.0)",
    "model": "string (e.g. gpt-4o)",
    "triageAt": "Timestamp"
  },
  "location": {
    "lat": "number",
    "lng": "number",
    "geohash": "string",
    "landmark": "string"
  },
  "status": "new | triaged | assigned | in_progress | resolved | closed",
  "assignedResourceIds": ["string"],
  "reporterNodeId": "string",
  "casualtyCount": "number",
  "damageLevel": "low | medium | high | critical",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

### Collection: `resources`
Document ID: `{resourceId}`
```json
{
  "resourceId": "string",
  "name": "string (e.g. 'NDRF Team Alpha')",
  "type": "team | vehicle | medical_unit | shelter | supply_cache",
  "subType": "string (e.g. 'boat', 'helicopter', 'ambulance', 'ndrf', 'fire_brigade')",
  "status": "available | deployed | en_route | unavailable",
  "commanderUid": "string",
  "capacity": "number | null",
  "currentLoad": "number | null",
  "location": {
    "lat": "number",
    "lng": "number",
    "geohash": "string",
    "lastUpdated": "Timestamp"
  },
  "assignedIncidentIds": ["string"],
  "contactFrequency": "string (e.g. '156.8 MHz VHF')",
  "notes": "string",
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

---

## 2. LOCAL SQLITE SCHEMA (Mobile — Sankat Mochan)

Using Expo SQLite / WatermelonDB column structure.

### Table: `local_peers`
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | BLE device UUID |
| display_name | TEXT | Advertised name |
| public_key | TEXT | Base64 ECDH public key |
| last_seen_at | INTEGER | Unix timestamp ms |
| rssi | INTEGER | Signal strength |
| is_reachable | INTEGER | 0/1 |

### Table: `local_messages`
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | UUID |
| type | TEXT | chat/sos/broadcast/report |
| sender_node_id | TEXT | |
| recipient_node_id | TEXT | null = broadcast |
| encrypted_payload | TEXT | Base64 AES-GCM |
| iv | TEXT | Base64 IV |
| hop_count | INTEGER | Times relayed |
| ttl_remaining | INTEGER | Hops left |
| delivery_status | TEXT | queued_locally/relayed/delivered |
| created_at | INTEGER | Unix ms |
| synced_to_cloud | INTEGER | 0/1 |

### Table: `local_incidents`
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | UUID |
| incident_type | TEXT | |
| description | TEXT | |
| lat | REAL | |
| lng | REAL | |
| landmark | TEXT | |
| casualty_count | INTEGER | |
| damage_level | TEXT | |
| created_at | INTEGER | |
| synced_to_cloud | INTEGER | 0/1 |

### Table: `outbox_queue`
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | Queue entry UUID |
| payload_json | TEXT | Full JSON payload blob |
| retry_count | INTEGER | |
| last_attempt_at | INTEGER | |
| status | TEXT | pending/uploading/done/failed |
| created_at | INTEGER | |

### Table: `identity`
| Column | Type | Notes |
|---|---|---|
| key | TEXT PK | e.g. 'private_key', 'public_key', 'mesh_node_id' |
| value | TEXT | Secure store reference or raw value |
