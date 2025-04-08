const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/server');

/**
 * Generate an API token
 * 
 * This function is intended to be called from your admin interface
 * in the main DocketCalendar application.
 * 
 * @param {Object} payload - Data to include in the token
 * @param {string} [expiresIn] - Token expiration (default from config)
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = jwtConfig.expiresIn) => {
  return jwt.sign(payload, jwtConfig.secret, { expiresIn });
};

/**
 * Verify a token
 * 
 * @param {string} token - The token to verify
 * @returns {Object|null} Decoded token or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
}; 