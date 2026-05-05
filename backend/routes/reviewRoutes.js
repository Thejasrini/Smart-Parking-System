const express = require('express');
const router = express.Router();
const { protect, allowRoles } = require('../middleware/authMiddleware');
const { upsertReview, getParkingReviews } = require('../controllers/reviewController');

// ⭐ USER - Add/Update review
router.post('/', protect, allowRoles('user'), upsertReview);

// ⭐ PUBLIC - View parking reviews
router.get('/:parkingId', getParkingReviews);

module.exports = router;
