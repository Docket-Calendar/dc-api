const express = require('express');
const authRoutes = require('./auth.routes');
const caseRoutes = require('./case.routes');
const eventRoutes = require('./event.routes');
const triggerRoutes = require('./trigger.routes');
const { apiPrefix } = require('../config/server');

const router = express.Router();

// API Routes - Focus on Cases, Triggers, and Events only
router.use(`${apiPrefix}/auth`, authRoutes);
router.use(`${apiPrefix}/cases`, caseRoutes);
router.use(`${apiPrefix}/events`, eventRoutes);
router.use(`${apiPrefix}/triggers`, triggerRoutes);

// Root route for basic diagnostics
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DocketCalendar API server is running - Simplified version',
    version: '2.0.0',
    documentation: '/api-docs',
    environment: process.env.NODE_ENV || 'not set',
    entities: ['Cases', 'Triggers', 'Events'],
    timestamp: new Date()
  });
});

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Simplified API is up and running',
    entities: ['Cases', 'Triggers', 'Events'],
    timestamp: new Date()
  });
});

module.exports = router; 