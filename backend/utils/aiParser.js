const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const Itinerary = require('../models/Itinerary');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ── Prompt template ────────────────────────────────────────────────────────
const buildPrompt = (rawText) => `
You are a travel itinerary parser. Given the following text extracted from a travel document, extract and structure a complete travel itinerary.

Return ONLY a valid JSON object — no markdown, no explanation — with this exact shape:
{
  "title": "string (e.g. 'Tokyo Adventure 2025')",
  "destination": "string (primary destination city/country)",
  "startDate": "YYYY-MM-DD or null",
  "endDate": "YYYY-MM-DD or null",
  "days": [
    {
      "date": "YYYY-MM-DD or descriptive label like 'Day 1'",
      "dayLabel": "string (e.g. 'Arrival in Tokyo')",
      "activities": [
        {
          "time": "HH:MM or '' if unknown",
          "title": "string (brief activity name)",
          "description": "string (details)",
          "location": "string (venue or address, '' if unknown)",
          "type": "flight|hotel|food|activity|transport|other",
          "notes": "string (any extra info, '' if none)"
        }
      ]
    }
  ]
}

Rules:
- If a field cannot be determined, use null for dates and "" for strings.
- Infer activity types from context (e.g. "check-in" → "hotel", "dinner" → "food", "flight" → "flight").
- Create at least one day entry even if the document is sparse.
- Do NOT wrap the JSON in markdown code fences.

Document text:
---
${rawText.slice(0, 12000)}
---
`;

// ── Extract text from PDF ─────────────────────────────────────────────────
const extractPdfText = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
};

// ── Extract text from image via Gemini vision ─────────────────────────────
const extractImageText = async (filePath, mimeType) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const imageData = fs.readFileSync(filePath);
  const base64 = imageData.toString('base64');

  const result = await model.generateContent([
    {
      inlineData: { data: base64, mimeType },
    },
    'Please extract all text content from this travel document image. Return the raw text only.',
  ]);

  return result.response.text();
};

// ── Parse raw text into structured itinerary via Gemini ───────────────────
const generateStructuredItinerary = async (rawText) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(buildPrompt(rawText));
  const responseText = result.response.text().trim();

  // Strip potential markdown code fences
  const cleaned = responseText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return JSON.parse(cleaned);
};

// ── Main pipeline ─────────────────────────────────────────────────────────
const parseDocumentToItinerary = async (itineraryId, file, storageMode) => {
  try {
    let rawText = '';
    const mimeType = file.mimetype;
    const isPDF = mimeType === 'application/pdf';
    const isImage = mimeType.startsWith('image/');

    // Determine file path for local storage; for S3 we fetch via URL
    let filePath = null;
    if (storageMode === 'local') {
      filePath = file.path; // multer diskStorage populates this
    }

    if (isPDF) {
      if (!filePath) {
        // S3: we can't read directly — use Gemini vision on a fallback text extraction
        rawText = `[PDF uploaded to S3: ${file.location}. Full extraction requires server-side download.]`;
      } else {
        rawText = await extractPdfText(filePath);
      }
    } else if (isImage) {
      if (!filePath) {
        rawText = `[Image uploaded to S3: ${file.location}]`;
      } else {
        rawText = await extractImageText(filePath, mimeType);
      }
    } else {
      rawText = '[Unsupported file type for text extraction]';
    }

    // Generate structured itinerary from raw text
    const structured = await generateStructuredItinerary(rawText);

    // Validate minimal shape
    if (!structured || typeof structured !== 'object') {
      throw new Error('AI returned invalid JSON structure');
    }

    await Itinerary.findByIdAndUpdate(itineraryId, {
      title: structured.title || 'My Travel Itinerary',
      destination: structured.destination || 'Unknown Destination',
      startDate: structured.startDate ? new Date(structured.startDate) : null,
      endDate: structured.endDate ? new Date(structured.endDate) : null,
      days: structured.days || [],
      rawText,
      status: 'ready',
      errorMessage: null,
    });
  } catch (err) {
    console.error('AI Parser error:', err.message);
    await Itinerary.findByIdAndUpdate(itineraryId, {
      status: 'error',
      errorMessage: err.message,
      title: 'Parsing Failed',
    });
  }
};

module.exports = { parseDocumentToItinerary };
