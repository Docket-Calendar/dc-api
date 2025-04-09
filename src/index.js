const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Log environment info immediately on startup
console.log('Application starting...');
console.log('Node version:', process.version);
console.log('Environment:', process.env.NODE_ENV);
console.log('Port from env:', process.env.PORT);

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
      console.error('Error testing database connection:', error.message);
    }
  })();

  // Middleware
  app.use(helmet()); // Security headers
  app.use(cors()); // Enable CORS
  app.use(express.json()); // Parse JSON bodies
  app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimiting.windowMs,
    max: config.rateLimiting.max,
    message: {
      success: false,
      error: 'Too many requests from this IP, please try again later.'
    }
  });
  app.use(limiter);

  // Swagger documentation
  try {
    swaggerSetup(app);
    console.log('Swagger documentation setup complete');
  } catch (error) {
    console.error('Error setting up Swagger:', error.message);
  }

  // Routes
  app.use(routes);

  // Add a simple diagnostic endpoint that doesn't depend on other components
  app.get('/debug', (req, res) => {
    res.status(200).send({
      uptime: process.uptime(),
      timestamp: Date.now(),
      environment: process.env.NODE_ENV,
      port: process.env.PORT,
      nodeVersion: process.version
    });
  });

  // Error handling
  app.use(notFound);
  app.use(errorHandler);

  // Only start the server if this file is run directly (not imported in tests)
  if (require.main === module) {
    const port = process.env.PORT || 3001;
    console.log(`Attempting to start server on port ${port}...`);
    
    const server = app.listen(port, () => {
      console.log(`Server running in ${config.environment} mode on port ${port}`);
      
      // Show appropriate documentation URL based on environment
      if (config.environment === 'production') {
        console.log(`API documentation available at ${process.env.WEBSITE_HOSTNAME ? `https://${process.env.WEBSITE_HOSTNAME}` : 'https://docketcalendar-api-chejaeg9a4bggbfe.centralus-01.azurewebsites.net'}/api-docs`);
      } else {
        console.log(`API documentation available at http://localhost:${port}/api-docs`);
      }
    });
    
    // Add error handler for the server
    server.on('error', (error) => {
      console.error('Server error occurred:', error.message);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Try using a different port.`);
      }
    });
  }

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Don't crash the server
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
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
  emergencyApp.get('/debug', (req, res) => {
    res.status(500).send({
      error: error.message,
      stack: error.stack,
      environment: process.env.NODE_ENV,
      port: process.env.PORT,
      nodeVersion: process.version
    });
  });
  
  // Start emergency server
  if (require.main === module) {
    const port = process.env.PORT || 3001;
    emergencyApp.listen(port, () => {
      console.log(`EMERGENCY SERVER running on port ${port} due to initialization failure`);
    });
  }
  
  module.exports = emergencyApp;
} 