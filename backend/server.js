const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (we'll add these one by one)
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/parking',  require('./routes/parkingRoutes'));
app.use('/api/booking',  require('./routes/bookingRoutes'));
app.use('/api/ai',       require('./routes/aiRoutes'));
app.use('/api/reviews',  require('./routes/reviewRoutes'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.log('❌ DB Error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));