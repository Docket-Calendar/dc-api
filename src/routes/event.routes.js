const express = require('express');
const EventController = require('../controllers/event.controller');
const { validateToken } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         event_name:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *         time:
 *           type: string
 *         appointment_length:
 *           type: integer
 *         trigger_name:
 *           type: string
 *         trigger_date:
 *           type: string
 *           format: date
 *         trigger_time:
 *           type: string
 *         service_type:
 *           type: string
 *         jurisdiction:
 *           type: string
 *         created_on:
 *           type: string
 *           format: date-time
 *         court_rule:
 *           type: string
 *         date_rule:
 *           type: string
 *         event_type:
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
 * /api/v1/events:
 *   get:
 *     summary: Get all events for authenticated user
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's events retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
router.get('/', validateToken, EventController.getAllEvents);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   get:
 *     summary: Get event by ID for authenticated user
 *     tags: [Events]
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
 *         description: Event retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Event not found or not owned by user
 */
router.get('/:id', validateToken, EventController.getEventById);

module.exports = router; 