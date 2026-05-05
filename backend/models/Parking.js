const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
  cctvAvailable: { type: Boolean, default: false },
  coveredParking: { type: Boolean, default: false },
  evCharging: { type: Boolean, default: false },
  security: { type: Boolean, default: false }
}, { _id: false });

const parkingSchema = new mongoose.Schema({
  owner:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:          { type: String, required: true },
  location: {
    address:     { type: String },
    lat:         { type: Number },
    lng:         { type: Number }
  },
  images:        [{ type: String }],
  totalSlots:    { type: Number, required: true },
  availableSlots:{ type: Number },
  price:         { type: Number, required: true }, // per hour
  pricePerHour:  { type: Number },
  pricePerDay:   { type: Number, default: 0 },
  features:      { type: featureSchema, default: () => ({}) },
  demandLevel:   { type: String, default: 'low' }, // low, medium, high
  status:        { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isApproved:    { type: Boolean, default: false },  // admin approves
  isRejected:    { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  reviewCount:   { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Parking', parkingSchema);