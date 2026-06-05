const Itinerary = require('../models/Itinerary');
const { parseDocumentToItinerary } = require('../utils/aiParser');
const { storageMode } = require('../config/s3');
const path = require('path');

// POST /api/upload  (protected)
const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Determine public URL for the document
  let documentUrl = null;
  let documentKey = null;

  if (storageMode === 's3') {
    // multer-s3 provides location and key
    documentUrl = req.file.location;
    documentKey = req.file.key;
  } else {
    // local disk: serve via /uploads/<filename>
    documentKey = req.file.filename;
    documentUrl = `/uploads/${req.file.filename}`;
  }

  // Create a placeholder itinerary immediately (status = processing)
  const itinerary = await Itinerary.create({
    userId: req.user._id,
    title: 'Processing document...',
    destination: 'Unknown',
    documentUrl,
    documentKey,
    status: 'processing',
    days: [],
  });

  // Fire-and-forget AI parsing (non-blocking response)
  parseDocumentToItinerary(itinerary._id, req.file, storageMode)
    .then(() => console.log(`✅ AI parsing complete for itinerary ${itinerary._id}`))
    .catch((err) => console.error(`❌ AI parsing error: ${err.message}`));

  res.status(202).json({
    message: 'Document uploaded. AI is generating your itinerary...',
    itineraryId: itinerary._id,
  });
};

module.exports = { uploadDocument };
