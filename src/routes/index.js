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

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is up and running',
    timestamp: new Date()
  });
});

module.exports = router; 