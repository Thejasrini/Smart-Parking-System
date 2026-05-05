const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { predictAvailability } = require('../ai/availabilityPrediction');
const { getPeakHours, getBusyAreas } = require('../ai/demandPrediction');
const { handleChat } = require('../ai/chatbot');

// 🧠 Predict availability for a parking
// GET /api/ai/predict/:parkingId?date=2025-04-25&timeSlot=10:00 AM
router.get('/predict/:parkingId', protect, async (req, res) => {
  const { date, timeSlot } = req.query;
  const result = await predictAvailability(req.params.parkingId, date, timeSlot);
  res.json(result);
});

// 📊 Get peak hours for a parking
// GET /api/ai/demand/:parkingId
router.get('/demand/:parkingId', protect, async (req, res) => {
  const result = await getPeakHours(req.params.parkingId);
  res.json(result);
});

// 📊 Get busiest areas
// GET /api/ai/busy-areas
router.get('/busy-areas', protect, async (req, res) => {
  const result = await getBusyAreas();
  res.json(result);
});

// 🤖 Chatbot
// POST /api/ai/chat
router.post('/chat', protect, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ message: 'Please send a message' });
  }
  const result = await handleChat(message);
  res.json(result);
});

module.exports = router;