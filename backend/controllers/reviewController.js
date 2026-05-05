const Review = require('../models/Review');
const Parking = require('../models/Parking');

const syncParkingRating = async (parkingId) => {
  const stats = await Review.aggregate([
    { $match: { parking: parkingId } },
    {
      $group: {
        _id: '$parking',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  const avg = stats[0]?.averageRating || 0;
  const count = stats[0]?.reviewCount || 0;

  await Parking.findByIdAndUpdate(parkingId, {
    averageRating: Number(avg.toFixed(2)),
    reviewCount: count
  });
};

// ✅ USER - Create or update rating/review
const upsertReview = async (req, res) => {
  try {
    const { parkingId, rating, comment = '' } = req.body;

    if (!parkingId || !rating) {
      return res.status(400).json({ message: 'parkingId and rating are required' });
    }

    const score = Number(rating);
    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const review = await Review.findOneAndUpdate(
      { user: req.user.id, parking: parkingId },
      {
        $set: {
          rating: score,
          comment: String(comment || '').trim()
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await syncParkingRating(review.parking);

    res.status(200).json({ message: '✅ Review saved', review });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// ✅ PUBLIC - Get reviews for a parking
const getParkingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ parking: req.params.parkingId })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

module.exports = {
  upsertReview,
  getParkingReviews
};
