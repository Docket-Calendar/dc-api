const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/server');
const { pool } = require('../config/database');

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
    
    // Check if token exists in the database
    const [rows] = await pool.execute(
      'SELECT id, username, firstname, lastname FROM users WHERE api_access_token = ?',
      [token]
    );

    // If token is not found in the database
    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized - Token not recognized' 
      });
    }

    // Attach user data and token payload to the request
    req.user = rows[0];
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