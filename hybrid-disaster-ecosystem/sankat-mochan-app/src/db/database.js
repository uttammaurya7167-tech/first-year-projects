import * as SQLite from 'expo-sqlite';

let db = null;

export async function getDatabase() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('sankat_mochan.db');
    await initializeSchema(db);
  }
  return db;
}

async function initializeSchema(db) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    -- Identity store (private/public keys, mesh node ID)
    CREATE TABLE IF NOT EXISTS identity (
      key   TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    -- Discovered BLE peers
    CREATE TABLE IF NOT EXISTS local_peers (
      id           TEXT PRIMARY KEY NOT NULL,
      display_name TEXT NOT NULL,
      public_key   TEXT,
      last_seen_at INTEGER NOT NULL,
      rssi         INTEGER DEFAULT -100,
      is_reachable INTEGER DEFAULT 0
    );

    -- Local message store
    CREATE TABLE IF NOT EXISTS local_messages (
      id                 TEXT PRIMARY KEY NOT NULL,
      type               TEXT NOT NULL DEFAULT 'chat',
      sender_node_id     TEXT NOT NULL,
      recipient_node_id  TEXT,
      encrypted_payload  TEXT NOT NULL,
      iv                 TEXT NOT NULL,
      hop_count          INTEGER DEFAULT 0,
      ttl_remaining      INTEGER DEFAULT 7,
      delivery_status    TEXT DEFAULT 'queued_locally',
      created_at         INTEGER NOT NULL,
      synced_to_cloud    INTEGER DEFAULT 0
    );

    -- Offline incident reports
    CREATE TABLE IF NOT EXISTS local_incidents (
      id              TEXT PRIMARY KEY NOT NULL,
      incident_type   TEXT NOT NULL,
      description     TEXT NOT NULL,
      lat             REAL,
      lng             REAL,
      landmark        TEXT,
      casualty_count  INTEGER DEFAULT 0,
      damage_level    TEXT DEFAULT 'low',
      created_at      INTEGER NOT NULL,
      synced_to_cloud INTEGER DEFAULT 0
    );

    -- Outbox queue (pending cloud sync)
    CREATE TABLE IF NOT EXISTS outbox_queue (
      id              TEXT PRIMARY KEY NOT NULL,
      payload_json    TEXT NOT NULL,
      retry_count     INTEGER DEFAULT 0,
      last_attempt_at INTEGER,
      status          TEXT DEFAULT 'pending',
      created_at      INTEGER NOT NULL
    );
  `);
}

// ---- Identity Helpers ----
export async function getIdentityValue(key) {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT value FROM identity WHERE key = ?', [key]);
  return row ? row.value : null;
}

export async function setIdentityValue(key, value) {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO identity (key, value) VALUES (?, ?)',
    [key, value]
  );
}

// ---- Message Helpers ----
export async function insertMessage(msg) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO local_messages
      (id, type, sender_node_id, recipient_node_id, encrypted_payload, iv,
       hop_count, ttl_remaining, delivery_status, created_at, synced_to_cloud)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      msg.id, msg.type, msg.senderNodeId, msg.recipientNodeId || null,
      msg.encryptedPayload, msg.iv,
      msg.hopCount ?? 0, msg.ttlRemaining ?? 7,
      msg.deliveryStatus ?? 'queued_locally',
      msg.createdAt ?? Date.now(), 0,
    ]
  );
}

export async function updateMessageStatus(id, status) {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE local_messages SET delivery_status = ? WHERE id = ?',
    [status, id]
  );
}

export async function getUnsentMessages() {
  const db = await getDatabase();
  return db.getAllAsync('SELECT * FROM local_messages WHERE synced_to_cloud = 0');
}

// ---- Incident Helpers ----
export async function insertIncident(incident) {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO local_incidents
      (id, incident_type, description, lat, lng, landmark,
       casualty_count, damage_level, created_at, synced_to_cloud)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      incident.id, incident.incidentType, incident.description,
      incident.lat || null, incident.lng || null, incident.landmark || null,
      incident.casualtyCount ?? 0, incident.damageLevel ?? 'low',
      incident.createdAt ?? Date.now(), 0,
    ]
  );
}

export async function getUnsentIncidents() {
  const db = await getDatabase();
  return db.getAllAsync('SELECT * FROM local_incidents WHERE synced_to_cloud = 0');
}

// ---- Outbox Helpers ----
export async function enqueueOutboxPayload(payloadJson) {
  const db = await getDatabase();
  const id = `outbox-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await db.runAsync(
    `INSERT INTO outbox_queue (id, payload_json, status, created_at) VALUES (?, ?, 'pending', ?)`,
    [id, payloadJson, Date.now()]
  );
  return id;
}

export async function getPendingOutboxItems() {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT * FROM outbox_queue WHERE status IN ('pending', 'failed') AND retry_count < 5 ORDER BY created_at ASC`
  );
}

export async function markOutboxItemDone(id) {
  const db = await getDatabase();
  await db.runAsync(`UPDATE outbox_queue SET status = 'done' WHERE id = ?`, [id]);
  // Mark messages and incidents as synced
  await db.runAsync(`UPDATE local_messages SET synced_to_cloud = 1`);
  await db.runAsync(`UPDATE local_incidents SET synced_to_cloud = 1`);
}

export async function markOutboxItemFailed(id, retryCount) {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE outbox_queue SET status = 'failed', retry_count = ?, last_attempt_at = ? WHERE id = ?`,
    [retryCount, Date.now(), id]
  );
}
