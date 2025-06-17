const express = require('express');
const CaseController = require('../controllers/case.controller');
const { validateToken } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Case:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         case_name:
 *           type: string
 *         jurisdiction:
 *           type: string
 *         created_on:
 *           type: string
 *           format: date-time
 *         timezone:
 *           type: string
 *         case_note:
 *           type: string
 *         initiation_date:
 *           type: string
 *           format: date
 *         case_number:
 *           type: string
 *         custom_details:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             location:
 *               type: string
 *             description:
 *               type: string
 *         assignees:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *         calendars:
 *           type: array
 *         dashboards:
 *           type: array
 */

/**
 * @swagger
 * /api/v1/cases:
 *   get:
 *     summary: Get all cases for authenticated user
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's cases retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/', validateToken, CaseController.getAllCases);

/**
 * @swagger
 * /api/v1/cases/{id}:
 *   get:
 *     summary: Get case by ID for authenticated user
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Case retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Case not found or not owned by user
 */
router.get('/:id', validateToken, CaseController.getCaseById);

module.exports = router; 