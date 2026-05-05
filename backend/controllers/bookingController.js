const Booking = require('../models/Booking');
const Parking = require('../models/Parking');
const User = require('../models/User');
const History = require('../models/History');

const computeAmount = (parking, bookingStart, bookingEnd) => {
  const hourlyPrice = Number(parking.pricePerHour ?? parking.price ?? 0);

  if (!bookingStart || !bookingEnd || Number.isNaN(bookingStart.getTime()) || Number.isNaN(bookingEnd.getTime())) {
    return hourlyPrice;
  }

  const diffMs = bookingEnd.getTime() - bookingStart.getTime();
  if (diffMs <= 0) {
    return hourlyPrice;
  }

  const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
  return hourlyPrice * hours;
};

// ✅ USER - Send booking request
const createBooking = async (req, res) => {
  try {
    const { parkingId, date, timeSlot, vehicleNumber, bookingStart, bookingEnd } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ── Fraud Check ──────────────────────────────────────
    if (user.isSuspicious) {
      return res.status(403).json({ message: '🚨 Your account is flagged. Contact admin.' });
    }

    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);

    const recentRequests = await Booking.countDocuments({
      user: userId,
      createdAt: { $gte: tenMinsAgo }
    });

    if (recentRequests >= 5) {
      await User.findByIdAndUpdate(userId, { isSuspicious: true });
      return res.status(429).json({ message: '🚨 Too many requests! Account flagged.' });
    }
    // ─────────────────────────────────────────────────────

    const parking = await Parking.findById(parkingId);
    const parkingApproved = parking && (parking.status === 'approved' || parking.isApproved);

    if (!parking || !parkingApproved) {
      return res.status(404).json({ message: 'Parking not found or not approved' });
    }

    if (Number(parking.availableSlots || 0) <= 0) {
      return res.status(400).json({ message: '❌ No slots available' });
    }

    const parsedStart = bookingStart ? new Date(bookingStart) : null;
    const parsedEnd = bookingEnd ? new Date(bookingEnd) : null;

    const booking = await Booking.create({
      user: userId,
      parking: parkingId,
      owner: parking.owner,
      vehicleNumber: String(vehicleNumber || user.vehicleDetails?.number || user.vehicleNumber || '').trim(),
      bookingStart: parsedStart,
      bookingEnd: parsedEnd,
      totalAmount: computeAmount(parking, parsedStart, parsedEnd),
      date,
      timeSlot,
      status: 'pending'
    });

    res.status(201).json({ message: '✅ Booking request sent! Waiting for owner approval.', booking });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// ✅ OWNER - Get all bookings for my parkings
const getOwnerBookings = async (req, res) => {
  try {
    const myParkings = await Parking.find({ owner: req.user.id });
    const myParkingIds = myParkings.map((parking) => parking._id);

    const bookings = await Booking.find({ parking: { $in: myParkingIds } })
      .populate('user', 'name email phoneNumber vehicleNumber vehicleDetails')
      .populate('parking', 'name location price pricePerHour')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// ✅ OWNER - Approve, reject, or complete booking
const updateBookingStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const bookingId = req.params.id;
    const normalizedReason = typeof rejectionReason === 'string' ? rejectionReason.trim() : '';
    let responseMessage = '✅ Booking updated!';

    const booking = await Booking.findById(bookingId).populate('parking');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.parking.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: '❌ Not your parking!' });
    }

    if (status && !['approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: '❌ Invalid status' });
    }

    if (status === 'approved') {
      if (booking.status === 'pending') {
        const parkingSlots = Number(booking.parking.availableSlots ?? 0);
        if (parkingSlots <= 0) {
          return res.status(400).json({ message: '❌ No slots available' });
        }

        await Parking.findByIdAndUpdate(booking.parking._id, {
          $inc: { availableSlots: -1 }
        });
      }

      booking.status = 'approved';
      booking.rejectionReason = '';
      responseMessage = '✅ Booking approved!';

      if (booking.date && booking.timeSlot) {
        await updateHistory(booking.parking._id, booking.date, booking.timeSlot);
      }
    }

    if (status === 'completed') {
      if (booking.status !== 'approved' && booking.status !== 'completed') {
        return res.status(400).json({ message: '❌ Only approved bookings can be completed' });
      }

      booking.status = 'completed';
      booking.rejectionReason = '';
      responseMessage = '✅ Booking marked as completed!';
    }

    if (status === 'rejected') {
      if (!normalizedReason) {
        return res.status(400).json({ message: '❌ Rejection reason is required' });
      }

      booking.status = 'rejected';
      booking.rejectionReason = normalizedReason;
      responseMessage = '✅ Booking rejected!';
    }

    if (!status && normalizedReason) {
      if (booking.status !== 'rejected') {
        return res.status(400).json({ message: '❌ Rejection reason can only be updated for rejected bookings' });
      }

      booking.rejectionReason = normalizedReason;
      responseMessage = '✅ Rejection reason updated!';
    }

    if (!status && !normalizedReason) {
      return res.status(400).json({ message: '❌ No update data provided' });
    }

    await booking.save();

    res.status(200).json({ message: responseMessage, booking });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// ✅ USER - Get my bookings
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('parking', 'name location price pricePerHour')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// ✅ ADMIN - Get all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('owner', 'name email')
      .populate('parking', 'name location')
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// ✅ OWNER / ADMIN - Booking analytics
const getBookingAnalytics = async (req, res) => {
  try {
    const filter = req.user.role === 'owner' ? { owner: req.user.id } : {};
    const bookings = await Booking.find(filter).select('status totalAmount timeSlot bookingStart createdAt');

    const totalBookings = bookings.length;
    const pending = bookings.filter((entry) => entry.status === 'pending').length;
    const approved = bookings.filter((entry) => entry.status === 'approved').length;
    const rejected = bookings.filter((entry) => entry.status === 'rejected').length;
    const completed = bookings.filter((entry) => entry.status === 'completed').length;

    const revenue = bookings.reduce((sum, entry) => {
      if (entry.status === 'approved' || entry.status === 'completed') {
        return sum + Number(entry.totalAmount || 0);
      }
      return sum;
    }, 0);

    const peakHourCounts = {};
    bookings.forEach((entry) => {
      const peakKey = entry.timeSlot || (entry.bookingStart
        ? `${new Date(entry.bookingStart).getHours().toString().padStart(2, '0')}:00`
        : 'unknown');
      peakHourCounts[peakKey] = (peakHourCounts[peakKey] || 0) + 1;
    });

    const peakHours = Object.entries(peakHourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour, count }));

    res.status(200).json({
      totalBookings,
      pending,
      approved,
      rejected,
      completed,
      revenue,
      peakHours
    });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// 📊 Helper - Save booking to history for AI
const updateHistory = async (parkingId, date, timeSlot) => {
  const existing = await History.findOne({ parkingId, date, timeSlot });

  if (existing) {
    existing.bookingsCount += 1;
    await existing.save();
  } else {
    await History.create({ parkingId, date, timeSlot, bookingsCount: 1 });
  }
};

module.exports = {
  createBooking,
  getOwnerBookings,
  updateBookingStatus,
  getUserBookings,
  getAllBookings,
  getBookingAnalytics
};
