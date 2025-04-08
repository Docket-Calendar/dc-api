const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { apiPrefix } = require('../config/server');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DocketCalendar API',
      version: '1.0.0',
      description: 'RESTful API for DocketCalendar application',
      contact: {
        name: 'API Support',
        email: 'support@docketcalendar.com'
      }
    },
    servers: [
      {
        url: apiPrefix,
        description: 'API Server'
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
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Custom CSS for the API token info
const customCss = `
  .swagger-ui .topbar { display: none }
  
  .api-token-info {
    margin: 1em 0;
    padding: 1em;
    background: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #e9ecef;
  }

  .api-token-info h2 {
    margin-top: 0;
    color: #3b4151;
  }

  .api-token-info p {
    margin-bottom: 0.5em;
  }

  .api-token-info code {
    background: #e9ecef;
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
  }

  .api-token-steps {
    margin-top: 1em;
    padding-left: 1.5em;
  }

  .api-token-steps li {
    margin-bottom: 0.5em;
  }
`;

// Custom JavaScript for token info
const customJs = `
window.onload = function() {
  const wrapper = document.createElement('div');
  wrapper.className = 'api-token-info';
  wrapper.innerHTML = \`
    <h2>API Token Authentication</h2>
    <p>This API uses JWT tokens for authentication. To access protected endpoints:</p>
    <ol class="api-token-steps">
      <li>Obtain an API token from your DocketCalendar admin interface</li>
      <li>Click the "Authorize" button at the top of this page</li>
      <li>Enter your token in the format: <code>Bearer YOUR_TOKEN_HERE</code></li>
      <li>Click "Authorize" and close the modal</li>
      <li>Your requests will now include the authorization header</li>
    </ol>
    <p>You can test your token using the <code>/auth/validate-token</code> endpoint.</p>
  \`;

  // Insert before the swagger-ui div
  const swaggerUI = document.querySelector('.swagger-ui');
  swaggerUI.parentNode.insertBefore(wrapper, swaggerUI);
};
`;

// Swagger setup
const swaggerSetup = (app) => {
  // Serve Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    customCss,
    customSiteTitle: 'DocketCalendar API Documentation',
    customfavIcon: '/favicon.ico',
    customJs
  }));
};

module.exports = swaggerSetup; 