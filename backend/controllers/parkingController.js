const Parking = require('../models/Parking');
const User = require('../models/User');

// ✅ OWNER - Add a new parking spot
const addParking = async (req, res) => {
  try {
    const {
      name,
      address,
      lat,
      lng,
      totalSlots,
      price,
      pricePerHour,
      pricePerDay,
      images = [],
      features = {}
    } = req.body;

    const hourlyPrice = Number(pricePerHour ?? price ?? 0);
    const slots = Number(totalSlots);

    const parking = await Parking.create({
      owner: req.user.id,   // comes from JWT token
      name,
      location: { address, lat, lng },
      images: Array.isArray(images) ? images : [],
      totalSlots: slots,
      availableSlots: slots,  // at start, all slots are free
      price: hourlyPrice,
      pricePerHour: hourlyPrice,
      pricePerDay: Number(pricePerDay) || 0,
      features: {
        cctvAvailable: Boolean(features.cctvAvailable),
        coveredParking: Boolean(features.coveredParking),
        evCharging: Boolean(features.evCharging),
        security: Boolean(features.security)
      },
      status: 'pending',
      isApproved: false    // admin must approve first
    });

    res.status(201).json({ message: '✅ Parking added, waiting for admin approval', parking });

  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// ✅ ADMIN - Get all parkings (approved + unapproved)
const getAllParkings = async (req, res) => {
  try {
    const parkings = await Parking.find().populate('owner', 'name email');
    res.status(200).json(parkings);
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// ✅ ADMIN - Approve a parking spot
const approveParking = async (req, res) => {
  try {
    const parking = await Parking.findByIdAndUpdate(
      req.params.id,
      { isApproved: true, isRejected: false, status: 'approved' },
      { new: true }
    );

    if (!parking) {
      return res.status(404).json({ message: 'Parking not found' });
    }

    res.status(200).json({ message: '✅ Parking approved!', parking });

  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// ✅ ADMIN - Reject a parking spot
const rejectParking = async (req, res) => {
  try {
    const parking = await Parking.findByIdAndUpdate(
      req.params.id,
      { isApproved: false, isRejected: true, status: 'rejected' },
      { new: true }
    );

    if (!parking) {
      return res.status(404).json({ message: 'Parking not found' });
    }

    try {
      await User.findByIdAndUpdate(parking.owner, {
        $push: {
          notifications: {
            notificationType: 'parking-rejected',
            title: 'Parking rejected',
            message: `Your parking "${parking.name}" was rejected by admin.`,
            read: false,
            createdAt: new Date()
          }
        }
      });
    } catch (notificationErr) {
      console.error('Failed to save rejection notification:', notificationErr);
    }

    res.status(200).json({ message: '✅ Parking rejected!', parking });
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// ✅ USER - Search nearby parkings (approved only)
const searchParkings = async (req, res) => {
  try {
    // Get all approved parkings
    const parkings = await Parking.find({
      $or: [
        { status: 'approved' },
        { status: { $exists: false }, isApproved: true }
      ]
    })
      .populate('owner', 'name');

    // If user sends lat/lng, sort by distance
    const { lat, lng } = req.query;

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);

      // Calculate distance for each parking (simple formula)
      const withDistance = parkings.map((p) => {
        const distance = getDistance(userLat, userLng, p.location.lat, p.location.lng);
        return { ...p._doc, distance };
      });

      // Sort by nearest first
      withDistance.sort((a, b) => a.distance - b.distance);

      return res.status(200).json(withDistance);
    }

    res.status(200).json(parkings);

  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// ✅ OWNER - Get my parkings
const getMyParkings = async (req, res) => {
  try {
    const parkings = await Parking.find({ owner: req.user.id });
    res.status(200).json(parkings);
  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// ✅ OWNER - Update available slots
const updateSlots = async (req, res) => {
  try {
    const { availableSlots } = req.body;

    const parking = await Parking.findByIdAndUpdate(
      req.params.id,
      { availableSlots },
      { new: true }
    );

    res.status(200).json({ message: '✅ Slots updated', parking });

  } catch (err) {
    res.status(500).json({ message: '❌ Server error', error: err.message });
  }
};

// 📏 Helper: Calculate distance between 2 coordinates (in km)
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in km
};

module.exports = {
  addParking,
  getAllParkings,
  approveParking,
  rejectParking,
  searchParkings,
  getMyParkings,
  updateSlots
};