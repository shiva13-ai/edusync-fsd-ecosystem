// edusync-node-backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Protects routes — verifies Bearer JWT in Authorization header.
 * Attaches decoded payload to req.user.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, name, email, role, iat, exp }
    next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Session expired. Please log in again.'
      : 'Invalid token. Access denied.';
    res.status(401).json({ message });
  }
};

/**
 * Restricts access to specific roles.
 * Usage: router.get('/admin', protect, restrictTo('admin', 'teacher'), handler)
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ message: `Access denied. Requires role: ${roles.join(' or ')}` });
  }
  next();
};

module.exports = { protect, restrictTo };