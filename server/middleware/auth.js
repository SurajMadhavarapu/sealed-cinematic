const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - no token provided',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const result = await pool.query(
        'SELECT id, email, name FROM users WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      // Attach user to request
      req.user = result.rows[0];
      next();
    } catch (tokenError) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - invalid token',
      });
    }
  } catch (error) {
    next(error);
  }
};
