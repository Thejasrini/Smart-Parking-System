const History = require('../models/History');
const Parking = require('../models/Parking');

// ✅ Predict if a parking will be available at a given time
const predictAvailability = async (parkingId, date, timeSlot) => {
  try {
    const parking = await Parking.findById(parkingId);
    if (!parking) return { status: 'unknown', message: 'Parking not found' };

    // Get history for this parking + timeslot
    const history = await History.findOne({ parkingId, timeSlot });

    // Threshold = 70% of total slots booked = likely full
    const threshold = parking.totalSlots * 0.7;

    if (!history) {
      // No history yet → assume available
      return {
        status: 'available',
        label: '🟢 Likely Available',
        message: 'No past data. Probably free!'
      };
    }

    if (history.bookingsCount >= threshold) {
      return {
        status: 'full',
        label: '🔴 Likely Full',
        message: 'This slot is usually very busy!'
      };
    } else if (history.bookingsCount >= threshold * 0.5) {
      return {
        status: 'moderate',
        label: '🟡 Moderate Demand',
        message: 'Might fill up. Book early!'
      };
    } else {
      return {
        status: 'available',
        label: '🟢 Likely Available',
        message: 'Usually free at this time.'
      };
    }

  } catch (err) {
    return { status: 'error', message: err.message };
  }
};

module.exports = { predictAvailability };