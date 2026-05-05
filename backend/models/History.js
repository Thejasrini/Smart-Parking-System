const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  parkingId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Parking' },
  date:          { type: String },
  timeSlot:      { type: String },
  bookingsCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('History', historySchema);