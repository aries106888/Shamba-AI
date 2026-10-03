// ─── AI Farm Assistant Route ────────────────────────────────────
// Integrates Google Gemini API as the ShambaPoint farm advisor
// Supports Kiswahili and English queries
const express = require('express');
const router = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// System context injected into every Gemini request
const SYSTEM_CONTEXT = `You are Shamba AI, the intelligent farm assistant for ShambaPoint Climate — a Kenya-focused climate-resilient agricultural logistics platform.

Your role:
- Help smallholder farmers in Kenya with climate, irrigation, crop health, and market questions
- Respond in the same language the user writes (Kiswahili or English)
- Give practical, specific, actionable advice suited to Kenyan farming conditions
- Always mention uncertainty in weather forecasts — say "inatarajiwa" (expected) not "itakuwa" (will be)
- Reference Kenyan crops: maize, tea, wheat, tomatoes, kale/sukuma wiki, avocados, beans, coffee
- Reference Kenyan counties: Kericho, Nakuru, Kirinyaga, Meru, Garissa, etc.
- Mention M-Pesa for payments, Africa's Talking for SMS alerts, USSD *483*12# for offline access
- You are NOT a doctor, lawyer or financial advisor — refer to experts for those matters
- Keep responses concise and farmer-friendly — avoid jargon
- If asked about pricing, always say prices are indicative and market-driven in KSh
- End responses with an offer to help further: "Je, una swali lingine?" or "Any other questions?"

Sample topics you can help with:
- When to irrigate (based on soil moisture, rainfall forecast, crop stage)
- Dry-spell risk interpretation (low/moderate/high/critical scores)
- NDVI crop health scores and what they mean
- How to register yield and connect to buyers
- M-Pesa escrow payment process
- Best crop varieties for specific counties
- Climate change adaptation strategies for Kenyan farmers`;

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  const { message, history = [], county, crop } = req.body;

  if (!message) return res.status(400).json({ error: 'message required' });

  if (!GEMINI_API_KEY) {
    // Demo mode — return a helpful placeholder when no API key is set
    const isSwahili = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüý]|habari|shamba|mazao|mkulima|mvua|hali|bei|malipo/i.test(message);
    const demoReply = isSwahili
      ? `Habari! Mimi ni Shamba AI, msaidizi wako wa kilimo. 🌱\n\nSwali lako: "${message}"\n\nKatika toleo la uzalishaji, nitajibu kwa kutumia Google Gemini AI na data ya hali ya hewa ya kweli. Kwa sasa, tafadhali weka GEMINI_API_KEY katika .env ya backend.\n\nJe, una swali lingine?`
      : `Hello! I'm Shamba AI, your farm assistant. 🌱\n\nYour question: "${message}"\n\nIn production, I'll answer using Google Gemini AI with real-time weather and farm data. Please add GEMINI_API_KEY to your backend .env to enable live responses.\n\nAny other questions?`;
    return res.json({ reply: demoReply, model: 'demo-mode', county, crop });
  }

  // Build conversation history for Gemini
  const contents = [];

  // Add farm context if provided
  let contextMessage = SYSTEM_CONTEXT;
  if (county) contextMessage += `\n\nCurrent context: The farmer is in ${county} county.`;
  if (crop)   contextMessage += ` Their primary crop is ${crop}.`;

  contents.push({ role: 'user', parts: [{ text: contextMessage }] });
  contents.push({ role: 'model', parts: [{ text: 'Understood. I am ready to assist Kenyan farmers as Shamba AI.' }] });

  // Add conversation history
  for (const h of history.slice(-8)) { // last 8 turns
    contents.push({ role: h.role, parts: [{ text: h.text }] });
  }

  // Add current message
  contents.push({ role: 'user', parts: [{ text: message }] });

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
          topP: 0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[Gemini Error]', err);
      return res.status(502).json({ error: 'AI service unavailable', detail: err });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Samahani, sijapata jibu. Jaribu tena. / Sorry, no response. Please try again.';

    res.json({
      reply,
      model: 'gemini-1.5-flash',
      usage: data.usageMetadata,
      county,
      crop,
    });
  } catch (err) {
    console.error('[AI Route Error]', err);
    res.status(500).json({ error: 'Internal AI error', detail: err.message });
  }
});

// GET /api/ai/suggestions — context-aware quick questions
router.get('/suggestions', (req, res) => {
  const { lang = 'en', county, crop } = req.query;
  const sw = lang === 'sw';

  const suggestions = sw ? [
    `Je, ni wakati gani mzuri wa kumwagilia ${crop || 'mazao'} yangu?`,
    `Maana ya alama ya hatari ya ukame ni nini?`,
    `Jinsi ya kupata mnunuzi kwa ${crop || 'mazao'} yangu?`,
    `Hali ya hewa ${county || 'kaunti yangu'} wiki ijayo?`,
    `Jinsi ya kusajili mavuno yangu kwenye ShambaPoint?`,
    `Alama ya NDVI 0.45 inamaanisha nini?`,
    `Jinsi malipo ya M-Pesa yanafanywa baada ya uwasilishaji?`,
  ] : [
    `When should I irrigate my ${crop || 'crops'} this week?`,
    `What does a dry-spell risk score of 65 mean?`,
    `How do I find a buyer for my ${crop || 'harvest'}?`,
    `What's the ${county || 'county'} forecast for the next 7 days?`,
    `How do I register my yield on ShambaPoint?`,
    `My NDVI score is 0.45 — should I be worried?`,
    `How does M-Pesa escrow work for deliveries?`,
  ];

  res.json({ suggestions });
});

module.exports = router;
