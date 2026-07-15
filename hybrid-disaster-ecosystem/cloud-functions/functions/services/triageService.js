const { OpenAI } = require('openai');

// ============================================================
// AI TRIAGE SERVICE
// Uses GPT-4o to categorize and prioritize incoming SOS data
// from the Sankat Mochan mesh network.
// ============================================================

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SEVERITY_LEVELS = ['P1_critical', 'P2_high', 'P3_medium', 'P4_low'];
const CATEGORIES       = ['rescue', 'medical', 'shelter', 'logistics', 'information'];

const TRIAGE_SYSTEM_PROMPT = `You are an expert emergency triage AI for a disaster relief command system.
You receive raw, unstructured SOS messages and incident reports from an offline mesh network during active disaster conditions.

Your job is to:
1. Assess the severity and urgency of the situation.
2. Categorize the type of response required.
3. Extract key information (location, people involved, risks).
4. Provide actionable triage notes for field commanders.

Severity levels:
- P1_critical: Immediate life threat, rescue needed within 30 minutes.
- P2_high: Serious threat, response needed within 2 hours.
- P3_medium: Significant need, response within 12 hours.
- P4_low: Minor or informational, respond when resources allow.

Categories: rescue, medical, shelter, logistics, information

Always respond with a valid JSON object matching this exact schema:
{
  "severity": "<P1_critical|P2_high|P3_medium|P4_low>",
  "category": "<rescue|medical|shelter|logistics|information>",
  "extractedLocation": "<best-guess location string>",
  "keyEntities": ["list", "of", "key", "people", "objects", "risks"],
  "triageNotes": "<2-3 sentence actionable summary for field commanders>",
  "triageConfidence": <float 0.0 to 1.0>
}`;

/**
 * Triage an incident using AI.
 * @param {string} description - Raw incident description text.
 * @param {string} incidentType - Pre-classified type (flood, fire, medical, etc.)
 * @returns {Promise<object>} Structured AI triage result.
 */
async function triageIncident(description, incidentType = 'other') {
  if (!description || description.trim().length < 5) {
    return buildFallbackTriage('Insufficient description provided.');
  }

  const userPrompt = `Incident Type: ${incidentType.toUpperCase()}

Raw Report:
"${description}"

Please triage this incident and return the structured JSON response.`;

  try {
    const completion = await client.chat.completions.create({
      model:       'gpt-4o',
      messages: [
        { role: 'system', content: TRIAGE_SYSTEM_PROMPT },
        { role: 'user',   content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature:     0.2,  // Low temperature for consistent, reliable triage
      max_tokens:      500,
    });

    const raw = completion.choices[0].message.content;
    const parsed = JSON.parse(raw);

    // Validate and sanitize AI output
    return {
      severity:          SEVERITY_LEVELS.includes(parsed.severity) ? parsed.severity : 'P3_medium',
      category:          CATEGORIES.includes(parsed.category) ? parsed.category : 'information',
      extractedLocation: parsed.extractedLocation || 'Unknown location',
      keyEntities:       Array.isArray(parsed.keyEntities) ? parsed.keyEntities.slice(0, 10) : [],
      triageNotes:       parsed.triageNotes || 'No additional notes.',
      triageConfidence:  typeof parsed.triageConfidence === 'number'
        ? Math.max(0, Math.min(1, parsed.triageConfidence))
        : 0.5,
      model:    'gpt-4o',
      triageAt: new Date().toISOString(),
    };

  } catch (e) {
    console.error('[triageService] OpenAI error:', e.message);
    return buildFallbackTriage(`AI triage unavailable: ${e.message}`);
  }
}

function buildFallbackTriage(reason) {
  return {
    severity:          'P2_high',   // Default high priority when AI fails (fail-safe)
    category:          'rescue',
    extractedLocation: 'Unknown',
    keyEntities:       [],
    triageNotes:       `Automated triage unavailable. Manual review required. Reason: ${reason}`,
    triageConfidence:  0.0,
    model:             'fallback',
    triageAt:          new Date().toISOString(),
  };
}

module.exports = { triageIncident };
