const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parking:   { type: mongoose.Schema.Types.ObjectId, ref: 'Parking' },
  owner:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleNumber: { type: String, default: '' },
  bookingStart: { type: Date, default: null },
  bookingEnd: { type: Date, default: null },
  totalAmount: { type: Number, default: 0 },
  status:    { type: String, enum: ['pending', 'approved', 'rejected', 'completed'], default: 'pending' },
  rejectionReason: { type: String, default: '' },
  date:      { type: String },  // "2025-04-24"
  timeSlot:  { type: String }   // "10:00 AM"
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);