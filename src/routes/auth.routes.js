const express = require('express');
const { validateToken } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /auth/validate-token:
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
    tokenData: {
      ...req.tokenData,
      // Remove sensitive information if any
    }
  });
});

module.exports = router; 