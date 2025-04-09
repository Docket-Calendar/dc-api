const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const winston = require('winston');
require('dotenv').config();

// Log environment info immediately on startup
console.log('Application starting...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('Port from env:', process.env.PORT);

// Create logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'docket-calendar-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

try {
  const config = require('./config/server');
  const { testConnection } = require('./config/database');
  const routes = require('./routes');
  const swaggerSetup = require('./utils/swagger');
  const { notFound, errorHandler } = require('./middleware/error.middleware');

  // Initialize express app
  const app = express();

  // Test database connection in the background, don't block startup
  (async () => {
    try {
      await testConnection();
    } catch (error) {
      logger.error('Error testing database connection:', error.message);
    }
  })();

  // Security middleware
  app.use(helmet(config.security)); // Enhanced security headers
  app.use(cors(config.cors)); // Restricted CORS
  app.use(express.json({ limit: '100kb' })); // Parse JSON bodies with size limit
  app.use(express.urlencoded({ extended: true, limit: '100kb' })); // Parse URL-encoded bodies with size limit
  app.use(cookieParser()); // Cookie parser

  // Set secure cookies
  app.use((req, res, next) => {
    res.cookie('sessionId', '', {
      ...config.cookies,
      maxAge: req.cookies.sessionId ? 3600000 : 0 // 1 hour if exists, otherwise delete
    });
    next();
  });

  // Rate limiting
  const limiter = rateLimit(config.rateLimiting);
  app.use(limiter);

  // CSRF protection - only in production and only for state-changing methods
  if (process.env.NODE_ENV === 'production') {
    const csrfProtection = csrf({ cookie: config.cookies });
    app.use((req, res, next) => {
      // Only apply CSRF to state-changing methods
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        csrfProtection(req, res, next);
      } else {
        next();
      }
    });
    
    // Provide CSRF token
    app.get('/csrf-token', csrfProtection, (req, res) => {
      res.json({ csrfToken: req.csrfToken() });
    });
  }

  // Swagger documentation - only in non-production or with authentication
  try {
    if (process.env.NODE_ENV !== 'production') {
      swaggerSetup(app);
      logger.info('Swagger documentation setup complete');
    } else {
      // In production, wrap Swagger with authentication
      const { validateToken } = require('./middleware/auth.middleware');
      app.use('/api-docs', validateToken, (req, res, next) => {
        swaggerSetup(app);
        next();
      });
      logger.info('Swagger documentation secured in production');
    }
  } catch (error) {
    logger.error('Error setting up Swagger:', error.message);
  }

  // Routes
  app.use(routes);

  // Add a simple diagnostic endpoint that doesn't depend on other components - only in non-production
  if (process.env.NODE_ENV !== 'production') {
    app.get('/debug', (req, res) => {
      res.status(200).send({
        uptime: process.uptime(),
        timestamp: Date.now(),
        environment: process.env.NODE_ENV,
        port: process.env.PORT,
        nodeVersion: process.version
      });
    });
  }

  // Error handling
  app.use(notFound);
  app.use(errorHandler);

  // Only start the server if this file is run directly (not imported in tests)
  if (require.main === module) {
    const port = process.env.PORT || 3001;
    logger.info(`Attempting to start server on port ${port}...`);
    
    const server = app.listen(port, () => {
      logger.info(`Server running in ${config.environment} mode on port ${port}`);
      
      // Show appropriate documentation URL based on environment
      if (config.environment === 'production') {
        logger.info(`API documentation available at ${process.env.WEBSITE_HOSTNAME ? `https://${process.env.WEBSITE_HOSTNAME}` : 'https://api.docketcalendar.com'}/api-docs (requires authentication)`);
      } else {
        logger.info(`API documentation available at http://localhost:${port}/api-docs`);
      }
    });
    
    // Add error handler for the server
    server.on('error', (error) => {
      logger.error('Server error occurred:', error.message);
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${port} is already in use. Try using a different port.`);
      }
    });
  }

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    // Don't crash the server
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    // Don't crash the server immediately, give time to log
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  module.exports = app;
  
} catch (error) {
  console.error('Fatal error during app initialization:', error);
  // Export a minimal app that can respond to health checks
  const emergencyApp = express();
  emergencyApp.get('/', (req, res) => {
    res.status(500).send({ error: 'Application failed to initialize', message: error.message });
  });
  emergencyApp.get('/health', (req, res) => {
    res.status(500).send({ status: 'error', message: 'Application failed to initialize' });
  });
  
  // Only include debug endpoint in non-production
  if (process.env.NODE_ENV !== 'production') {
    emergencyApp.get('/debug', (req, res) => {
      res.status(500).send({
        error: error.message,
        stack: error.stack,
        environment: process.env.NODE_ENV,
        port: process.env.PORT,
        nodeVersion: process.version
      });
    });
  }
  
  // Start emergency server
  if (require.main === module) {
    const port = process.env.PORT || 3001;
    emergencyApp.listen(port, () => {
      console.log(`EMERGENCY SERVER running on port ${port} due to initialization failure`);
    });
  }
  
  module.exports = emergencyApp;
} 