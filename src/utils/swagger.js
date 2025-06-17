const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { apiPrefix, environment } = require('../config/server');

// Determine server URL based on environment
const serverUrl = environment === 'production' 
  ? process.env.WEBSITE_HOSTNAME 
    ? `https://${process.env.WEBSITE_HOSTNAME}` 
    : 'https://docketcalendar-api-dev.azurewebsites.net'
  : '/';

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DocketCalendar API - Simplified',
      version: '2.0.0',
      description: `Streamlined legal case management API focused on Cases, Triggers, and Events

## API Token Authentication

This API uses JWT tokens for authentication. To access protected endpoints:

1. **Get your API token** from the DocketCalendar API page
2. **Using the token in Swagger**:
   - Click the "Authorize" button at the top of this page
   - Enter your token (without "Bearer") in the Value field
   - Click "Authorize" and close the modal
   - Your requests will now include the authorization header
3. **Test your token** using the \`/auth/validate-token\` endpoint

### Simplified API v2.0.0
This version focuses exclusively on **Cases**, **Triggers**, and **Events** management.`,
      contact: {
        name: 'API Support',
        email: 'support@docketcalendar.com'
      }
    },
    servers: [
      {
        url: serverUrl,
        description: environment === 'production' ? 'Production Server' : 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  // Only include the simplified API routes (exclude dashboard and calendar)
  apis: [
    './src/routes/auth.routes.js',
    './src/routes/case.routes.js', 
    './src/routes/trigger.routes.js',
    './src/routes/event.routes.js',
    './src/routes/test.routes.js'
  ]
};

let swaggerDocs;
try {
  swaggerDocs = swaggerJsdoc(swaggerOptions);
} catch (error) {
  console.error('Error generating Swagger docs:', error);
  // Fallback to just showing the error
  swaggerDocs = {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation Error',
      version: '1.0.0',
      description: `Error generating documentation: ${error.message}`
    },
    paths: {}
  };
}

// Custom CSS for better styling and hiding topbar
const customCss = `
  .swagger-ui .topbar { display: none }
  
  .swagger-ui .info {
    margin: 20px 0;
  }
  
  .swagger-ui .info .title {
    color: #3b4151;
    font-family: sans-serif;
  }
  
  .swagger-ui .info .description {
    margin: 15px 0;
    color: #3b4151;
  }
  
  .swagger-ui .info .description h2 {
    color: #3b4151;
    margin-top: 30px;
    margin-bottom: 15px;
    font-size: 1.5em;
  }
  
  .swagger-ui .info .description h3 {
    color: #3b4151;
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 1.3em;
  }
  
  .swagger-ui .info .description ol {
    margin: 10px 0;
    padding-left: 20px;
  }
  
  .swagger-ui .info .description li {
    margin-bottom: 8px;
    line-height: 1.5;
  }
  
  .swagger-ui .info .description code {
    background: #f7f7f7;
    border: 1px solid #e1e1e1;
    border-radius: 4px;
    padding: 2px 4px;
    font-family: monospace;
    font-size: 0.9em;
  }
  
  .swagger-ui .scheme-container {
    margin: 20px 0;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #e9ecef;
  }
`;

// Swagger setup
const swaggerSetup = (app) => {
  try {
    // Serve Swagger UI with improved configuration
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
      customCss,
      customSiteTitle: 'DocketCalendar API v2.0 - Simplified Documentation',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        deepLinking: true,
        displayOperationId: false,
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        defaultModelRendering: 'example',
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: false,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true
      }
    }));
  } catch (error) {
    console.error('Error setting up Swagger UI:', error);
    // Provide a fallback route
    app.get('/api-docs', (req, res) => {
      res.status(500).send(`
        <h1>API Documentation Error</h1>
        <p>There was an error loading the API documentation.</p>
        <p>Error: ${error.message}</p>
      `);
    });
  }
};

module.exports = swaggerSetup; 