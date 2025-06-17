const express = require('express');
const { validateToken } = require('../middleware/auth.middleware');
const { generateToken } = require('../utils/token');

const router = express.Router();

/**
 * @swagger
 * /api/v1/auth/validate-token:
 *   get:
 *     summary: Validate API token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Token is valid
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *                 tokenData:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: token-identifier
 *                     iat:
 *                       type: integer
 *                       example: 1617984000
 *                     exp:
 *                       type: integer
 *                       example: 1617987600
 *       401:
 *         description: Invalid token or token expired
 */
router.get('/validate-token', validateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    user: req.user,
    tokenData: {
      ...req.tokenData,
      // Remove sensitive information if any
    }
  });
});

/**
 * @swagger
 * /api/v1/auth/generate-test-token:
 *   post:
 *     summary: Generate a test token (Development only)
 *     tags: [Auth]
 *     description: |
 *       **⚠️ Development Only**: This endpoint is only available in development mode.
 *       Generates a JWT token for testing purposes.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *                 description: User ID for the token
 *               email:
 *                 type: string
 *                 example: test@example.com
 *                 description: Email for the token
 *               name:
 *                 type: string
 *                 example: Test User
 *                 description: Name for the token
 *     responses:
 *       200:
 *         description: Test token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Test token generated successfully
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 authHeader:
 *                   type: string
 *                   example: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       403:
 *         description: Not available in production
 *       400:
 *         description: Invalid request data
 */
if (process.env.NODE_ENV !== 'production') {
  router.post('/generate-test-token', (req, res) => {
    try {
      // Default test user data
      const defaultUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      };

      // Use provided data or defaults
      const userData = {
        id: req.body.id || defaultUser.id,
        email: req.body.email || defaultUser.email,
        name: req.body.name || defaultUser.name
      };

      // Generate token with 24 hour expiration
      const token = generateToken(userData, '24h');

      res.status(200).json({
        success: true,
        message: 'Test token generated successfully',
        token: token,
        authHeader: `Bearer ${token}`,
        user: userData,
        expiresIn: '24 hours',
        note: 'Use the authHeader value in the Authorization header or Swagger Authorize button'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to generate test token',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Token generation failed'
      });
    }
  });
}

module.exports = router; 