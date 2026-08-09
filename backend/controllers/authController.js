const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'smartparking_secret_key_2026';

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phoneNumber: user.phoneNumber,
  profileImage: user.profileImage,
  vehicleType: user.vehicleType,
  vehicleNumber: user.vehicleNumber,
  location: user.location,
  defaultLocation: user.defaultLocation,
  vehicleDetails: user.vehicleDetails,
  ownerBusiness: user.ownerBusiness,
  bankDetails: user.bankDetails,
  verification: user.verification,
  isProfileComplete: user.isProfileComplete
});

// ✅ REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      name: name || 'User',
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'user'
    });

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '✅ Registered successfully',
      token,
      user: buildUserPayload(user)
    });

  } catch (err) {
    console.error('❌ Register Error:', err);
    res.status(500).json({ message: '❌ Server error: ' + err.message });
  }
};

// ✅ LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: '✅ Login successful',
      token,
      user: buildUserPayload(user)
    });

  } catch (err) {
    console.error('❌ Login Error:', err);
    res.status(500).json({ message: '❌ Server error: ' + err.message });
  }
};

// ✅ USER - Get my profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('❌ Profile Error:', err);
    res.status(500).json({ message: '❌ Server error: ' + err.message });
  }
};

// ✅ USER - Update profile details
const updateMyProfile = async (req, res) => {
  try {
    const {
      name,
      phoneNumber = '',
      profileImage = '',
      vehicleType = '',
      vehicleNumber = '',
      location = '',
      defaultLocation,
      ownerBusiness,
      bankDetails
    } = req.body;

    const cleanPhone = String(phoneNumber).trim();
    const cleanVehicleType = String(vehicleType).trim();
    const cleanVehicleNumber = String(vehicleNumber).trim();
    const cleanLocation = String(location).trim();
    const cleanName = typeof name === 'string' ? name.trim() : undefined;
    const cleanProfileImage = String(profileImage || '').trim();

    const nextDefaultLocation = {
      lat: Number(defaultLocation?.lat) || null,
      lng: Number(defaultLocation?.lng) || null,
      address: String(defaultLocation?.address || '').trim()
    };

    const nextOwnerBusiness = {
      parkingName: String(ownerBusiness?.parkingName || '').trim(),
      ownerAddress: String(ownerBusiness?.ownerAddress || '').trim(),
      idProofUrl: String(ownerBusiness?.idProofUrl || '').trim(),
      gstNumber: String(ownerBusiness?.gstNumber || '').trim()
    };

    const nextBankDetails = {
      accountHolderName: String(bankDetails?.accountHolderName || '').trim(),
      accountNumber: String(bankDetails?.accountNumber || '').trim(),
      ifscCode: String(bankDetails?.ifscCode || '').trim().toUpperCase()
    };

    const isProfileComplete = Boolean(
      cleanPhone && cleanVehicleType && cleanVehicleNumber && cleanLocation
    );

    const updates = {
      phoneNumber: cleanPhone,
      profileImage: cleanProfileImage,
      vehicleType: cleanVehicleType,
      vehicleNumber: cleanVehicleNumber,
      vehicleDetails: {
        type: cleanVehicleType.toLowerCase(),
        number: cleanVehicleNumber
      },
      location: cleanLocation,
      defaultLocation: nextDefaultLocation,
      isProfileComplete
    };

    if (cleanName) {
      updates.name = cleanName;
    }

    if (req.user.role === 'owner') {
      updates.ownerBusiness = nextOwnerBusiness;
      updates.bankDetails = nextBankDetails;
      updates.verification = {
        isVerified: false,
        submittedAt: new Date(),
        approvedBy: null
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: '✅ Profile updated', user });
  } catch (err) {
    console.error('❌ Update Profile Error:', err);
    res.status(500).json({ message: '❌ Server error: ' + err.message });
  }
};

// ✅ USER - Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: '✅ Password changed successfully' });
  } catch (err) {
    console.error('❌ Change Password Error:', err);
    res.status(500).json({ message: '❌ Server error: ' + err.message });
  }
};

module.exports = {
  register,
  login,
  getMyProfile,
  updateMyProfile,
  changePassword
};