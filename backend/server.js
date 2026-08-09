const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// CORS configuration (allow all origins in development / production or configured origin)
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Smart Parking System API is running' });
});
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Smart Parking System API is running' });
});

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const aiRoutes = require('./routes/aiRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Mount routes under both /api/... and /... for maximum frontend compatibility
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/parking', parkingRoutes);
app.use('/parking', parkingRoutes);

app.use('/api/booking', bookingRoutes);
app.use('/booking', bookingRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

app.use('/api/reviews', reviewRoutes);
app.use('/reviews', reviewRoutes);

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

// Connect to MongoDB (Atlas with Local fallback)
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smartparking';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(async (err) => {
    console.error('⚠️ Primary DB Connection Note:', err.message);
    if (mongoUri !== 'mongodb://localhost:27017/smartparking') {
      console.log('🔄 Attempting connection to local MongoDB...');
      try {
        await mongoose.connect('mongodb://localhost:27017/smartparking');
        console.log('✅ Local MongoDB Connected');
      } catch (localErr) {
        console.error('❌ Local DB Error:', localErr.message);
      }
    }
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));