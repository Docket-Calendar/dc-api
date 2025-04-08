const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/server');

// Token validation middleware
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
    
    // Verify the token
    const decoded = jwt.verify(token, jwtConfig.secret);
    
    // Attach the decoded token payload to the request
    req.tokenData = decoded;
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

// Export middleware functions
module.exports = {
  validateToken
}; 