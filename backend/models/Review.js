const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parking: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '' }
}, { timestamps: true });

reviewSchema.index({ user: 1, parking: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
