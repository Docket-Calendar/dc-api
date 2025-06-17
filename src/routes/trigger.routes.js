const express = require('express');
const TriggerController = require('../controllers/trigger.controller');
const { validateToken } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Trigger:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         time:
 *           type: string
 *         service_type:
 *           type: string
 *         jurisdiction:
 *           type: string
 *         created_on:
 *           type: string
 *           format: date-time
 *         number_of_events:
 *           type: integer
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
 * /api/v1/triggers:
 *   get:
 *     summary: Get all triggers for authenticated user
 *     tags: [Triggers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's triggers retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/', validateToken, TriggerController.getAllTriggers);

/**
 * @swagger
 * /api/v1/triggers/{id}:
 *   get:
 *     summary: Get trigger by ID for authenticated user
 *     tags: [Triggers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trigger retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Trigger not found or not owned by user
 */
router.get('/:id', validateToken, TriggerController.getTriggerById);

module.exports = router; 