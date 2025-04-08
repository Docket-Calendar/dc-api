const express = require('express');
const { getAllEvents, getEventById, getEventsByCaseId, searchEvents } = require('../controllers/event.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events with pagination
 *     tags: [Events]
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
 *         description: A list of events
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getAllEvents);

/**
 * @swagger
 * /events/search:
 *   get:
 *     summary: Search events by various parameters
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: caseId
 *         schema:
 *           type: string
 *         description: Case ID
 *       - in: query
 *         name: eventName
 *         schema:
 *           type: string
 *         description: Event name
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Event type
 *       - in: query
 *         name: jurisdiction
 *         schema:
 *           type: string
 *         description: Jurisdiction
 *       - in: query
 *         name: triggerName
 *         schema:
 *           type: string
 *         description: Trigger name
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *         description: From date (ISO format)
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *         description: To date (ISO format)
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
 *         description: A list of events matching the search criteria
 *       401:
 *         description: Unauthorized
 */
router.get('/search', authenticate, searchEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get a specific event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticate, getEventById);

/**
 * @swagger
 * /events/case/{caseId}:
 *   get:
 *     summary: Get all events for a specific case
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         schema:
 *           type: string
 *         required: true
 *         description: Case ID
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
 *         description: A list of events for the specified case
 *       401:
 *         description: Unauthorized
 */
router.get('/case/:caseId', authenticate, getEventsByCaseId);

module.exports = router; 