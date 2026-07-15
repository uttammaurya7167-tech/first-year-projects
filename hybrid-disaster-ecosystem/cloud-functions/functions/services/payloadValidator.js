// ============================================================
// PAYLOAD VALIDATOR
// Validates the structure of incoming mesh payloads
// ============================================================

/**
 * Validate the structure of an incoming mesh payload.
 * @param {object} payload - Parsed JSON from request body.
 * @returns {string|null} Error message string if invalid, null if valid.
 */
exports.validatePayload = function(payload) {
  if (!payload || typeof payload !== 'object') {
    return 'Payload must be a JSON object';
  }

  if (!payload.uplinkNodeId || typeof payload.uplinkNodeId !== 'string') {
    return 'Missing or invalid uplinkNodeId';
  }

  if (!payload.sourceClusterId || typeof payload.sourceClusterId !== 'string') {
    return 'Missing or invalid sourceClusterId';
  }

  if (!Array.isArray(payload.messages)) {
    return 'messages must be an array';
  }

  if (!Array.isArray(payload.incidents)) {
    return 'incidents must be an array';
  }

  // Validate each incident
  const validIncidentTypes = ['flood', 'fire', 'collapse', 'medical', 'missing', 'shelter', 'other'];
  for (const inc of payload.incidents) {
    if (!inc.incidentId) return `Incident missing incidentId`;
    if (!inc.description || inc.description.length < 3) {
      return `Incident ${inc.incidentId} has insufficient description`;
    }
    if (!validIncidentTypes.includes(inc.incidentType)) {
      return `Incident ${inc.incidentId} has invalid type: ${inc.incidentType}`;
    }
  }

  // Validate total payload size (prevent abuse)
  const estimatedSizeKB = JSON.stringify(payload).length / 1024;
  if (estimatedSizeKB > 5000) { // 5MB limit
    return `Payload too large: ${estimatedSizeKB.toFixed(0)}KB (max 5MB)`;
  }

  return null; // Valid
};
