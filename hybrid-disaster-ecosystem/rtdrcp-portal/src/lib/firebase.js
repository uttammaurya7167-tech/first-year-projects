// Firebase configuration and Firestore client for RTDRCP portal
// Replace these values with your actual Firebase project configuration

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once (Next.js hot reload guard)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db   = getFirestore(app);
export const auth = getAuth(app);

// ---- Realtime Firestore Listeners ----

/**
 * Subscribe to live incident updates.
 * @param {function} callback - Called with array of incident objects on each update.
 * @returns {function} Unsubscribe function.
 */
export function subscribeToIncidents(callback) {
  const q = query(
    collection(db, 'incidents'),
    where('status', 'in', ['new', 'triaged', 'assigned', 'in_progress']),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, snapshot => {
    const incidents = snapshot.docs.map(doc => ({
      ...doc.data(),
      // Convert Firestore Timestamps to ISO strings for serialization
      createdAt: doc.data().createdAt?.toDate?.().toISOString() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.().toISOString() || doc.data().updatedAt,
    }));
    callback(incidents);
  });
}

/**
 * Subscribe to live resource updates.
 * @param {function} callback - Called with array of resource objects.
 * @returns {function} Unsubscribe function.
 */
export function subscribeToResources(callback) {
  const q = query(collection(db, 'resources'), orderBy('name', 'asc'));

  return onSnapshot(q, snapshot => {
    const resources = snapshot.docs.map(doc => ({ ...doc.data() }));
    callback(resources);
  });
}
