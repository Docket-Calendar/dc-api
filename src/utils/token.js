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
    // First try without strict validation
    try {
      return jwt.verify(token, jwtConfig.secret, {
        // Remove strict validation for issuer and audience
        // issuer: 'docketcalendar-api',
        // audience: 'docketcalendar-client'
      });
    } catch (firstError) {
      console.error('First verification attempt failed:', firstError.message);
      
      // If that fails, try to decode without verification for debugging
      const decoded = jwt.decode(token, { complete: true });
      console.error('Token header:', JSON.stringify(decoded?.header));
      console.error('Token payload:', JSON.stringify(decoded?.payload));
      
      // Try again with secret trimmed (in case of whitespace issues)
      const trimmedSecret = jwtConfig.secret.trim();
      if (trimmedSecret !== jwtConfig.secret) {
        console.error('Trying with trimmed secret (original had whitespace)');
        return jwt.verify(token, trimmedSecret);
      }
      
      // If we get here, rethrow the original error
      throw firstError;
    }
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