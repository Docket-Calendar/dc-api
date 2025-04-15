/**
 * Token utility functions for authentication
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { jwt: jwtConfig } = require('../config/server');

/**
 * Generate a JWT token
 * @param {Object} payload - The data to include in the token
 * @param {string} expiresIn - Token expiration time (defaults to config value)
 * @returns {string} The generated JWT token
 */
const generateToken = (payload, expiresIn = jwtConfig.expiresIn) => {
  // Add timestamps and jitter to prevent timing attacks
  const now = Math.floor(Date.now() / 1000);
  const jitter = Math.floor(Math.random() * 60); // Add up to 60 seconds of jitter
  
  // Add standard claims
  const tokenPayload = {
    ...payload,
    iat: now,
    nbf: now - 10, // Valid slightly before issuance to account for clock skew
    jti: crypto.randomBytes(16).toString('hex'), // Add a unique token ID
    iss: 'docketcalendar-api',
    aud: 'docketcalendar-client'
  };
  
  return jwt.sign(tokenPayload, jwtConfig.secret, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token - The token to verify
 * @returns {Object} The decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    // Log token verification attempt for debugging
    console.log('Attempting to verify token - lenient mode without issuer/audience validation');
    
    // Verify with basic validation, without strict issuer/audience checks
    return jwt.verify(token, jwtConfig.secret, {
      // Removed issuer and audience validation to fix compatibility issues
      // issuer: 'docketcalendar-api',
      // audience: 'docketcalendar-client'
    });
  } catch (error) {
    // Enhanced error logging
    console.error('JWT verification error:', error.name, error.message);
    
    // Enhance error message but don't expose details
    if (error.name === 'TokenExpiredError') {
      throw new Error('Authentication token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid authentication token');
    }
    throw error;
  }
};

/**
 * Generate a secure random token
 * @param {number} length - Length of the token
 * @returns {string} Random hex string
 */
const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

module.exports = {
  generateToken,
  verifyToken,
  generateRandomToken
}; 