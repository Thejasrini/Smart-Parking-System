const express = require('express');
const router = express.Router();
const { protect, allowRoles } = require('../middleware/authMiddleware');
const {
  createBooking,
  getOwnerBookings,
  updateBookingStatus,
  getUserBookings,
  getAllBookings,
  getBookingAnalytics
} = require('../controllers/bookingController');

// 🚗 USER - Create booking request
router.post('/create', protect, allowRoles('user'), createBooking);

// 🚗 USER - Get my bookings
router.get('/mine', protect, allowRoles('user'), getUserBookings);

// 🅿️ OWNER - See all bookings for my parkings
router.get('/owner', protect, allowRoles('owner'), getOwnerBookings);

// 🅿️ OWNER - Approve or reject
router.put('/status/:id', protect, allowRoles('owner'), updateBookingStatus);

// 👨‍💼 ADMIN - See all bookings
router.get('/all', protect, allowRoles('admin'), getAllBookings);

// 📊 OWNER / ADMIN - Analytics
router.get('/analytics', protect, allowRoles('owner', 'admin'), getBookingAnalytics);

module.exports = router;