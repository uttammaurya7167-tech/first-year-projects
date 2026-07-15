import * as Crypto from 'expo-crypto';
import { Buffer } from 'buffer';
import { setIdentityValue, getIdentityValue } from '../db/database';

// ============================================================
// LOCAL E2E ENCRYPTION MODULE
// Uses AES-256-GCM via Web Crypto API (available in Expo)
// Key exchange: ECDH P-256 for per-session shared secrets
// ============================================================

const MESH_NODE_ID_KEY = 'mesh_node_id';
const PRIVATE_KEY_KEY  = 'private_key_b64';
const PUBLIC_KEY_KEY   = 'public_key_b64';

// Generate or retrieve the device's stable identity
export async function initializeIdentity() {
  let nodeId = await getIdentityValue(MESH_NODE_ID_KEY);
  if (!nodeId) {
    nodeId = `node-${await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${Date.now()}-${Math.random()}`,
      { encoding: Crypto.CryptoEncoding.HEX }
    ).then(h => h.slice(0, 12))}`;
    await setIdentityValue(MESH_NODE_ID_KEY, nodeId);
  }

  // Check if ECDH keypair already generated
  const existingPub = await getIdentityValue(PUBLIC_KEY_KEY);
  if (!existingPub) {
    await generateAndStoreKeyPair();
  }

  return nodeId;
}

async function generateAndStoreKeyPair() {
  // Use SubtleCrypto (available in Expo's JS runtime)
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits']
  );

  const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey);
  const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  const pubB64 = Buffer.from(publicKeyBuffer).toString('base64');
  const privB64 = Buffer.from(privateKeyBuffer).toString('base64');

  await setIdentityValue(PUBLIC_KEY_KEY, pubB64);
  await setIdentityValue(PRIVATE_KEY_KEY, privB64);

  console.log('[Encryption] ECDH keypair generated and stored.');
  return { publicKeyB64: pubB64 };
}

export async function getPublicKeyB64() {
  return getIdentityValue(PUBLIC_KEY_KEY);
}

// Derive shared AES key from our private key + peer's public key
async function deriveSharedKey(peerPublicKeyB64) {
  const privB64 = await getIdentityValue(PRIVATE_KEY_KEY);
  if (!privB64 || !peerPublicKeyB64) throw new Error('Keys not initialized');

  const privKeyBuffer = Buffer.from(privB64, 'base64');
  const pubKeyBuffer  = Buffer.from(peerPublicKeyB64, 'base64');

  const privateKey = await crypto.subtle.importKey(
    'pkcs8', privKeyBuffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false, ['deriveKey', 'deriveBits']
  );

  const publicKey = await crypto.subtle.importKey(
    'raw', pubKeyBuffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false, []
  );

  const sharedKey = await crypto.subtle.deriveKey(
    { name: 'ECDH', public: publicKey },
    privateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return sharedKey;
}

// Encrypt a plaintext string for a specific peer
export async function encryptForPeer(plaintext, peerPublicKeyB64) {
  const sharedKey = await deriveSharedKey(peerPublicKeyB64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, sharedKey, encoded);
  return {
    encryptedPayload: Buffer.from(ciphertext).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
  };
}

// Encrypt using a group broadcast key (AES key from shared secret)
export async function encryptBroadcast(plaintext, groupKeyB64) {
  const keyBuffer = Buffer.from(groupKeyB64, 'base64');
  const key = await crypto.subtle.importKey(
    'raw', keyBuffer, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return {
    encryptedPayload: Buffer.from(ciphertext).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
  };
}

// Decrypt
export async function decryptFromPeer(encryptedB64, ivB64, peerPublicKeyB64) {
  const sharedKey = await deriveSharedKey(peerPublicKeyB64);
  const iv = Buffer.from(ivB64, 'base64');
  const ciphertext = Buffer.from(encryptedB64, 'base64');
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, sharedKey, ciphertext);
  return new TextDecoder().decode(decrypted);
}
