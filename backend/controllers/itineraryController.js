const Itinerary = require('../models/Itinerary');

// POST /api/itinerary  — manual creation
const createItinerary = async (req, res) => {
  const { title, destination, startDate, endDate, days } = req.body;

  if (!title || !destination) {
    return res.status(400).json({ message: 'Title and destination are required' });
  }

  const itinerary = await Itinerary.create({
    userId: req.user._id,
    title,
    destination,
    startDate: startDate || null,
    endDate: endDate || null,
    days: days || [],
    status: 'ready',
  });

  res.status(201).json({ itinerary });
};

// GET /api/itinerary  — list for current user (paginated)
const getUserItineraries = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 12);
  const skip = (page - 1) * limit;

  const [itineraries, total] = await Promise.all([
    Itinerary.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-rawText -days'),
    Itinerary.countDocuments({ userId: req.user._id }),
  ]);

  res.status(200).json({
    itineraries,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  });
};

// GET /api/itinerary/:id
const getItinerary = async (req, res) => {
  const itinerary = await Itinerary.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!itinerary) {
    return res.status(404).json({ message: 'Itinerary not found' });
  }

  res.status(200).json({ itinerary });
};

// PUT /api/itinerary/:id
const updateItinerary = async (req, res) => {
  const allowed = ['title', 'destination', 'startDate', 'endDate', 'days', 'coverImage'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const itinerary = await Itinerary.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  if (!itinerary) {
    return res.status(404).json({ message: 'Itinerary not found' });
  }

  res.status(200).json({ itinerary });
};

// DELETE /api/itinerary/:id  — soft delete
const deleteItinerary = async (req, res) => {
  const itinerary = await Itinerary.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isDeleted: true },
    { new: true }
  );

  if (!itinerary) {
    return res.status(404).json({ message: 'Itinerary not found' });
  }

  res.status(200).json({ message: 'Itinerary deleted successfully' });
};

// GET /api/itinerary/:id/status  — poll AI processing status
const getItineraryStatus = async (req, res) => {
  const itinerary = await Itinerary.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).select('status title destination errorMessage');

  if (!itinerary) {
    return res.status(404).json({ message: 'Itinerary not found' });
  }

  res.status(200).json({ status: itinerary.status, title: itinerary.title, destination: itinerary.destination, errorMessage: itinerary.errorMessage });
};

module.exports = {
  createItinerary,
  getUserItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  getItineraryStatus,
};
