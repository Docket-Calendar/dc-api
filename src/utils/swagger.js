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

// Custom CSS for the login form
const customCss = `
  .swagger-ui .topbar { display: none }
  
  .auth-wrapper {
    margin: 1em 0;
    padding: 1em;
    background: #f8f9fa;
    border-radius: 4px;
    border: 1px solid #e9ecef;
  }

  .auth-form {
    display: grid;
    gap: 1em;
    max-width: 400px;
  }

  .auth-form input {
    padding: 8px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    font-size: 14px;
  }

  .auth-form button {
    background: #49cc90;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
  }

  .auth-form button:hover {
    background: #3eb37f;
  }

  .auth-status {
    margin-top: 1em;
    padding: 8px;
    border-radius: 4px;
  }

  .auth-status.success {
    background: #e8f5e9;
    color: #1b5e20;
    border: 1px solid #a5d6a7;
  }

  .auth-status.error {
    background: #ffebee;
    color: #b71c1c;
    border: 1px solid #ef9a9a;
  }
`;

// Custom JavaScript for login functionality
const customJs = `
window.onload = function() {
  const wrapper = document.createElement('div');
  wrapper.className = 'auth-wrapper';
  wrapper.innerHTML = \`
    <h2>API Authentication</h2>
    <form class="auth-form" id="auth-form">
      <input type="text" placeholder="Username" id="auth-username" required>
      <input type="password" placeholder="Password" id="auth-password" required>
      <button type="submit">Login & Authorize</button>
    </form>
    <div class="auth-status" id="auth-status" style="display: none;"></div>
  \`;

  // Insert before the swagger-ui div
  const swaggerUI = document.querySelector('.swagger-ui');
  swaggerUI.parentNode.insertBefore(wrapper, swaggerUI);

  document.getElementById('auth-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const status = document.getElementById('auth-status');
    const username = document.getElementById('auth-username').value;
    const password = document.getElementById('auth-password').value;

    try {
      status.style.display = 'block';
      status.className = 'auth-status';
      status.textContent = 'Authenticating...';

      const response = await fetch('${apiPrefix}/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        const token = data.data.token;
        
        // Auto-fill the authorization
        const authBtn = document.querySelector('.btn.authorize');
        if (authBtn) {
          authBtn.click();
          setTimeout(() => {
            const tokenInput = document.querySelector('input[type="text"][data-component="security-0"]');
            if (tokenInput) {
              tokenInput.value = 'Bearer ' + token;
              const authorizeBtn = document.querySelector('.auth-btn-wrapper button.btn-primary');
              if (authorizeBtn) {
                authorizeBtn.click();
                setTimeout(() => {
                  const closeBtn = document.querySelector('.btn-done');
                  if (closeBtn) closeBtn.click();
                }, 250);
              }
            }
          }, 250);
        }

        status.className = 'auth-status success';
        status.textContent = \`Logged in as \${data.data.first_name} \${data.data.last_name}\`;
      } else {
        status.className = 'auth-status error';
        status.textContent = data.error || 'Login failed';
      }
    } catch (error) {
      status.className = 'auth-status error';
      status.textContent = 'Error: ' + error.message;
    }
  });
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