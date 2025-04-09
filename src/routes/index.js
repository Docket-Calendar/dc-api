const express = require('express');
const authRoutes = require('./auth.routes');
const caseRoutes = require('./case.routes');
const eventRoutes = require('./event.routes');
const { apiPrefix } = require('../config/server');

const router = express.Router();

// API Routes
router.use(`${apiPrefix}/auth`, authRoutes);
router.use(`${apiPrefix}/cases`, caseRoutes);
router.use(`${apiPrefix}/events`, eventRoutes);

// Root route for basic diagnostics
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DocketCalendar API server is running',
    version: '1.0.0',
    documentation: '/api-docs',
    environment: process.env.NODE_ENV || 'not set',
    timestamp: new Date()
  });
});

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is up and running',
    timestamp: new Date()
  });
});

module.exports = router; 