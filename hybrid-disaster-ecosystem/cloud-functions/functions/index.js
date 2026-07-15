const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin  = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const { triageIncident }  = require('./services/triageService');
const { validatePayload } = require('./services/payloadValidator');

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// ============================================================
// CLOUD FUNCTION: ingestMeshPayload
// POST endpoint receiving bulk encrypted offline mesh data
// from Sankat Mochan uplink devices.
// ============================================================
exports.ingestMeshPayload = onRequest(
  {
    cors:        ['*'],
    region:      'us-central1',
    timeoutSeconds: 120,
    memory:      '512MiB',
  },
  async (req, res) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Verify Firebase ID token
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    let decodedToken;
    try {
      if (idToken) {
        decodedToken = await admin.auth().verifyIdToken(idToken);
      }
    } catch (e) {
      console.warn('[ingestMeshPayload] Invalid token:', e.message);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = req.body;

    // Validate payload schema
    const validationError = validatePayload(payload);
    if (validationError) {
      return res.status(400).json({ error: `Validation failed: ${validationError}` });
    }

    const payloadId  = payload.payloadId || uuidv4();
    const batch      = db.batch();
    const now        = admin.firestore.FieldValue.serverTimestamp();

    try {
      // 1. Store the raw mesh payload
      const payloadRef = db.collection('meshPayloads').doc(payloadId);
      batch.set(payloadRef, {
        ...payload,
        payloadId,
        uploadedAt: now,
        processingStatus: 'processing',
      });

      await batch.commit();
      console.log(`[ingestMeshPayload] Stored payload ${payloadId} with ${payload.incidents?.length || 0} incidents.`);

      // 2. Send an immediate response (don't block on AI triage)
      res.status(202).json({
        success: true,
        payloadId,
        message: `Payload accepted. Processing ${payload.incidents?.length || 0} incidents.`,
      });

      // 3. Process incidents asynchronously (AI triage)
      await processIncidentsAsync(payload, payloadId, decodedToken?.uid);

    } catch (e) {
      console.error('[ingestMeshPayload] Error:', e);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error', detail: e.message });
      }
    }
  }
);

// ---- Async incident processing pipeline ----
async function processIncidentsAsync(payload, payloadId, uploaderUid) {
  const incidents = payload.incidents || [];
  const promises  = incidents.map(inc => processOneIncident(inc, payloadId));
  const results   = await Promise.allSettled(promises);

  let successCount = 0;
  let failCount    = 0;
  results.forEach(r => r.status === 'fulfilled' ? successCount++ : failCount++);

  // Update payload status
  await db.collection('meshPayloads').doc(payloadId).update({
    processingStatus: failCount > 0 ? 'partial' : 'completed',
    processedAt: admin.firestore.FieldValue.serverTimestamp(),
    processingStats: { successCount, failCount },
  });

  console.log(`[processIncidentsAsync] Done: ${successCount} triaged, ${failCount} failed.`);
}

async function processOneIncident(rawIncident, payloadId) {
  const incidentId = rawIncident.incidentId || uuidv4();

  try {
    // Run AI triage
    const aiTriage = await triageIncident(rawIncident.description, rawIncident.incidentType);

    // Compute geohash (simple approximation)
    const geohash = rawIncident.location?.lat
      ? computeSimpleGeohash(rawIncident.location.lat, rawIncident.location.lng)
      : '';

    const incidentDoc = {
      incidentId,
      sourcePayloadId: payloadId,
      incidentType:    rawIncident.incidentType,
      rawDescription:  rawIncident.description,
      aiTriage,
      location: {
        lat:      rawIncident.location?.lat || null,
        lng:      rawIncident.location?.lng || null,
        geohash,
        landmark: rawIncident.location?.landmark || '',
      },
      status:              'triaged',
      assignedResourceIds: [],
      reporterNodeId:      rawIncident.reporterNodeId,
      casualtyCount:       rawIncident.casualtyCount || 0,
      damageLevel:         rawIncident.damageLevel || 'low',
      createdAt:           rawIncident.createdAt
        ? admin.firestore.Timestamp.fromDate(new Date(rawIncident.createdAt))
        : admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('incidents').doc(incidentId).set(incidentDoc, { merge: true });
    console.log(`[processOneIncident] Incident ${incidentId} triaged: ${aiTriage.severity}`);
    return { incidentId, severity: aiTriage.severity };

  } catch (e) {
    console.error(`[processOneIncident] Failed for ${incidentId}:`, e.message);
    // Save the incident without triage rather than losing data
    await db.collection('incidents').doc(incidentId).set({
      incidentId,
      sourcePayloadId: payloadId,
      incidentType:    rawIncident.incidentType,
      rawDescription:  rawIncident.description,
      aiTriage:        null,
      location:        rawIncident.location || {},
      status:          'new',
      createdAt:       admin.firestore.FieldValue.serverTimestamp(),
      updatedAt:       admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    throw e;
  }
}

function computeSimpleGeohash(lat, lng) {
  // Simplified geohash approximation (replace with ngeohash library in production)
  const latBin = Math.floor((lat + 90) / 180 * 65536).toString(16).padStart(4, '0');
  const lngBin = Math.floor((lng + 180) / 360 * 65536).toString(16).padStart(4, '0');
  return `${latBin}${lngBin}`;
}

// ============================================================
// CLOUD FUNCTION: onIncidentCreated (Firestore trigger)
// Fires when a new incident is written. Used for:
//   - Sending real-time push notifications to responders
//   - Updating aggregate stats
// ============================================================
exports.onIncidentCreated = onDocumentCreated(
  'incidents/{incidentId}',
  async (event) => {
    const incident = event.data.data();
    const { incidentId, aiTriage, location, incidentType } = incident;

    console.log(`[onIncidentCreated] New incident: ${incidentId}, severity: ${aiTriage?.severity}`);

    if (aiTriage?.severity === 'P1_critical') {
      // In production: send FCM push notification to all commanders
      // await sendCriticalAlert(incident);
      console.log(`[onIncidentCreated] P1 CRITICAL alert triggered for ${incidentId}`);
    }
  }
);
