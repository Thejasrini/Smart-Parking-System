const History = require('../models/History');
const Booking = require('../models/Booking');

// ✅ Get peak hours for a parking
const getPeakHours = async (parkingId) => {
  try {
    // Group bookings by timeSlot and count
    const result = await History.aggregate([
      { $match: { parkingId: new require('mongoose').Types.ObjectId(parkingId) } },
      { $group: { _id: '$timeSlot', total: { $sum: '$bookingsCount' } } },
      { $sort: { total: -1 } }  // highest first
    ]);

    if (result.length === 0) {
      return { peakHours: [], message: 'Not enough data yet' };
    }

    // Top 3 busiest slots
    const peakHours = result.slice(0, 3).map(r => ({
      timeSlot: r._id,
      bookings: r.total,
      label: r.total > 10 ? '🔴 Very Busy' : '🟡 Moderate'
    }));

    // Best time = least busy slot
    const bestTime = result[result.length - 1];

    return {
      peakHours,
      bestTime: {
        timeSlot: bestTime._id,
        label: '🟢 Best time to park'
      }
    };

  } catch (err) {
    return { error: err.message };
  }
};

// ✅ Get busy areas (which parkings have most bookings)
const getBusyAreas = async () => {
  try {
    const result = await Booking.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$parking', totalBookings: { $sum: 1 } } },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 }
    ]);

    return result;

  } catch (err) {
    return { error: err.message };
  }
};

module.exports = { getPeakHours, getBusyAreas };