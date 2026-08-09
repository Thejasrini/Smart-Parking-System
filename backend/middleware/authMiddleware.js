const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'smartparking_secret_key_2026';

// ✅ Check if user is logged in
const protect = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }

    next();

  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ✅ Check if user has a specific role
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '❌ Access denied for your role' });
    }
    next();
  };
};

module.exports = { protect, allowRoles };