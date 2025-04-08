const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { jwt: jwtConfig } = require('../config/server');

// Authentication middleware
const authenticate = async (req, res, next) => {
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
    
    // Verify the token
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - Invalid token' 
      });
    }

    // Check if user has API access
    if (user.api_access !== 'yes') {
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden - You do not have API access' 
      });
    }

    // Attach the user to the request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - Token expired' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      error: 'Unauthorized - Invalid token' 
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - No user found' 
      });
    }
    
    if (!roles.includes(req.user.user_level)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden - Not authorized to access this resource' 
      });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize
}; 