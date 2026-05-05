const express = require('express');
const router = express.Router();
const { protect, allowRoles } = require('../middleware/authMiddleware');
const {
  addParking,
  getAllParkings,
  approveParking,
  rejectParking,
  searchParkings,
  getMyParkings,
  updateSlots
} = require('../controllers/parkingController');

// 🔍 USER - Search approved parkings (public)
router.get('/search', searchParkings);

// 🅿️ OWNER - Add parking
router.post('/add', protect, allowRoles('owner'), addParking);

// 🅿️ OWNER - Get my parkings
router.get('/mine', protect, allowRoles('owner'), getMyParkings);

// 🅿️ OWNER - Update slots
router.put('/slots/:id', protect, allowRoles('owner'), updateSlots);

// 👨‍💼 ADMIN - Get all parkings
router.get('/all', protect, allowRoles('admin'), getAllParkings);

// 👨‍💼 ADMIN - Approve parking
router.put('/approve/:id', protect, allowRoles('admin'), approveParking);

// 👨‍💼 ADMIN - Reject parking
router.put('/reject/:id', protect, allowRoles('admin'), rejectParking);

module.exports = router;