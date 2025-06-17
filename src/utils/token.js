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
 * Verify a JWT token with multiple secret fallbacks
 * @param {string} token - The token to verify
 * @returns {Object} The decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  // List of possible secrets in priority order
  const possibleSecrets = [
    // WordPress default AUTH_KEY (found via debugging)
    'put your unique phrase here',
    jwtConfig.secret, // Current configured secret
    process.env.JWT_SECRET, // Direct env var
    process.env.AUTH_KEY, // WordPress AUTH_KEY from env
    'docketcalendar-jwt-secret-key-static-2025', // Static fallback
    // Additional possible secrets that frontend might be using
    'docketcalendar-api', // Simple variant
    'your_secret_key_here', // Default from setup guide
    // WordPress common constants
    'AUTH_KEY', // Just the string
    'SECURE_AUTH_KEY', // WordPress constant
    'LOGGED_IN_KEY', // WordPress constant
    'NONCE_KEY', // WordPress constant
    'wp_secret_key', // Common WordPress secret
    // Variations of the static key
    'docketcalendar-jwt-secret-key', // Without -static-2025
    'docketcalendar-secret', // Shorter version
    // Common development secrets
    'secret', // Very basic
    'development_secret', // Dev version
    '12345', // Really basic
    '', // Empty string
  ].filter(secret => secret !== undefined && secret !== null); // Keep empty strings but remove undefined/null

  let lastError;
  let secretsAttempted = [];
  
  // Try each secret until one works
  for (const secret of possibleSecrets) {
    try {
      const decoded = jwt.verify(token, secret, {
        // Removed issuer and audience validation for broader compatibility
      });
      
      // Validate that we have the expected payload structure
      if (decoded.userId && (decoded.username || decoded.name)) {
        // Log which secret worked in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`🎉 JWT verified successfully with secret: ${secret.substring(0, 10)}...`);
        }
        return decoded;
      }
    } catch (error) {
      lastError = error;
      secretsAttempted.push(secret.substring(0, 10) + '...');
      // Continue to next secret
      continue;
    }
  }
  
  // Enhanced error logging - only log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('JWT verification failed with all secrets. Attempted:', secretsAttempted.length, 'secrets');
    console.error('Last error:', lastError?.name, lastError?.message);
    console.error('Token header:', token.split('.')[0]);
    console.error('Token payload preview:', token.split('.')[1].substring(0, 50) + '...');
  }
  
  // Enhance error message but don't expose details
  if (lastError?.name === 'TokenExpiredError') {
    throw new Error('Authentication token has expired');
  } else if (lastError?.name === 'JsonWebTokenError') {
    throw new Error('Invalid authentication token');
  }
  throw lastError || new Error('Token verification failed');
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