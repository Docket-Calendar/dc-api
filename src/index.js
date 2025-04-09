const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const config = require('./config/server');
const { testConnection } = require('./config/database');
const routes = require('./routes');
const swaggerSetup = require('./utils/swagger');
const { notFound, errorHandler } = require('./middleware/error.middleware');

// Initialize express app
const app = express();

// Test database connection
testConnection();

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
swaggerSetup(app);

// Routes
app.use(routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Only start the server if this file is run directly (not imported in tests)
if (require.main === module) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server running in ${config.environment} mode on port ${port}`);
    
    // Show appropriate documentation URL based on environment
    if (config.environment === 'production') {
      console.log(`API documentation available at https://api.docketcalendar.com/api-docs`);
    } else {
      console.log(`API documentation available at http://localhost:${port}/api-docs`);
    }
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server
});

module.exports = app; 