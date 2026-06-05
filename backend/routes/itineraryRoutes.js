const express = require('express');
const {
  createItinerary,
  getUserItineraries,
  getItinerary,
  updateItinerary,
  deleteItinerary,
  getItineraryStatus,
} = require('../controllers/itineraryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // all itinerary routes require auth

router.route('/').get(getUserItineraries).post(createItinerary);

router.route('/:id').get(getItinerary).put(updateItinerary).delete(deleteItinerary);

router.get('/:id/status', getItineraryStatus);

module.exports = router;
