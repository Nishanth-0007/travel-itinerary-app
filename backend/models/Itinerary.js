const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    time: { type: String, default: '' },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    type: {
      type: String,
      enum: ['flight', 'hotel', 'food', 'activity', 'transport', 'other'],
      default: 'activity',
    },
    notes: { type: String, default: '' },
  },
  { _id: true }
);

const daySchema = new mongoose.Schema(
  {
    date: { type: String, default: '' },
    dayLabel: { type: String, default: '' },
    activities: [activitySchema],
  },
  { _id: true }
);

const itinerarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Itinerary title is required'],
      trim: true,
      maxlength: [120, 'Title too long'],
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    coverImage: {
      type: String,
      default: null,
    },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    days: [daySchema],
    rawText: { type: String, default: '' },
    documentUrl: { type: String, default: null },
    documentKey: { type: String, default: null }, // S3 key or local filename
    status: {
      type: String,
      enum: ['pending', 'processing', 'ready', 'error'],
      default: 'ready',
    },
    errorMessage: { type: String, default: null },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Exclude soft-deleted docs by default
itinerarySchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
