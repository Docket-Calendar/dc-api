const express = require('express');
const { getAllCases, getCaseById, searchCases } = require('../controllers/case.controller');
const { validateToken } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /cases:
 *   get:
 *     summary: Get all cases with pagination
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of cases
 *       401:
 *         description: Unauthorized
 */
router.get('/', validateToken, getAllCases);

/**
 * @swagger
 * /cases/search:
 *   get:
 *     summary: Search cases by various parameters
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: caseName
 *         schema:
 *           type: string
 *         description: Case name
 *       - in: query
 *         name: jurisdiction
 *         schema:
 *           type: string
 *         description: Jurisdiction
 *       - in: query
 *         name: assignee
 *         schema:
 *           type: string
 *         description: Case assignee
 *       - in: query
 *         name: timezone
 *         schema:
 *           type: string
 *         description: Timezone
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of cases matching the search criteria
 *       401:
 *         description: Unauthorized
 */
router.get('/search', validateToken, searchCases);

/**
 * @swagger
 * /cases/{id}:
 *   get:
 *     summary: Get a specific case by ID
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Case ID
 *     responses:
 *       200:
 *         description: Case details
 *       404:
 *         description: Case not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', validateToken, getCaseById);

module.exports = router; 