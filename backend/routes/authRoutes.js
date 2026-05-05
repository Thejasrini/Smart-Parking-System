const express = require('express');
const router = express.Router();
const {
	register,
	login,
	getMyProfile,
	updateMyProfile,
	changePassword
} = require('../controllers/authController');
const { protect, allowRoles } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile
router.get('/profile', protect, allowRoles('user', 'owner'), getMyProfile);

// PUT /api/auth/profile
router.put('/profile', protect, allowRoles('user', 'owner'), updateMyProfile);

// PUT /api/auth/change-password
router.put('/change-password', protect, allowRoles('user', 'owner'), changePassword);

module.exports = router;