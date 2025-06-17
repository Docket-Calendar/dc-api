/**
 * Authentication middleware
 */
const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/server');
const { pool } = require('../config/database');
const { verifyToken } = require('../utils/token');

/**
 * Maximum token age check (even if not expired by JWT standards)
 * @type {number} Time in seconds (30 days)
 */
const MAX_TOKEN_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Middleware to validate API token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateToken = async (req, res, next) => {
  try {
    // Get the token from the request headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - No token provided' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      // Verify the token signature first
      const decoded = verifyToken(token);
      
      // Additional security check - limit token absolute age
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.iat && (currentTime - decoded.iat > MAX_TOKEN_AGE)) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - Token too old, please request a new one'
        });
      }
      
      // CRITICAL SECURITY: Check if token exists in database and hasn't been revoked
      if (!decoded.userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - Invalid token payload'
        });
      }

      try {
        // Query database to verify token is still valid
        const query = 'SELECT api_access_token FROM users WHERE id = ?';
        const [rows] = await pool.execute(query, [decoded.userId]);
        
        if (!rows || rows.length === 0) {
          return res.status(401).json({
            success: false,
            error: 'Unauthorized - User not found'
          });
        }
        
        const dbToken = rows[0].api_access_token;
        
        // Check if token has been revoked (empty) or doesn't match
        if (!dbToken || dbToken.trim() === '' || dbToken !== token) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`🔒 Token revoked or invalid for user ${decoded.userId}`);
          }
          return res.status(401).json({
            success: false,
            error: 'Unauthorized - Token has been revoked or is invalid'
          });
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Token validated against database for user ${decoded.userId}`);
        }
        
      } catch (dbError) {
        console.error('Database token validation error:', dbError);
        // In case of database error, reject the token for security
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - Unable to validate token'
        });
      }
      
      // Create user object from token payload
      req.user = {
        id: decoded.userId,
        username: decoded.username,
        firstname: decoded.firstname,
        lastname: decoded.lastname
      };
      
      req.tokenData = decoded;
      
      // Add short response delay to prevent timing attacks (0-100ms random delay)
      setTimeout(next, Math.floor(Math.random() * 100));
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        error: error.message || 'Unauthorized - Invalid token' 
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error during authentication' 
    });
  }
};

/**
 * Role-based authorization middleware
 * @param {string[]} roles - Array of allowed roles
 * @returns {Function} Express middleware function
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - Insufficient permissions'
      });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - Insufficient permissions for this resource'
      });
    }
    
    next();
  };
};

// Export middleware functions
module.exports = {
  validateToken,
  authorize
}; 