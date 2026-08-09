const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration
const allowedOrigins = process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:3000'] : '*';
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Health Check Endpoint (useful for cloud platform liveness probes)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Smart Parking System API is running' });
});

// API Routes
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/parking',  require('./routes/parkingRoutes'));
app.use('/api/booking',  require('./routes/bookingRoutes'));
app.use('/api/ai',       require('./routes/aiRoutes'));
app.use('/api/reviews',  require('./routes/reviewRoutes'));

// Serve frontend static assets in production if frontend build folder exists
const frontendBuildPath = path.join(__dirname, '../frontend/build');
const fs = require('fs');
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'Smart Parking System Backend API is active' });
  });
}

// Connect to MongoDB
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smartparking';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ DB Connection Error:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));