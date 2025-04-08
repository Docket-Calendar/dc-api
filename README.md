# DocketCalendar API

A RESTful API for the DocketCalendar application that provides case information and related events.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Documentation](#documentation)
- [Testing](#testing)
- [Deployment](#deployment)

## Features

- RESTful API built with Node.js and Express
- MySQL database connection (Azure)
- JWT authentication
- Pagination
- Search functionality
- API documentation with Swagger/OpenAPI
- Error handling
- Rate limiting
- Security headers with Helmet
- CORS support

## Project Structure

```
docket-calendar-api/
├── node_modules/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── server.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── case.controller.js
│   │   └── event.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   ├── models/
│   │   ├── case.model.js
│   │   ├── event.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── case.routes.js
│   │   ├── event.routes.js
│   │   └── index.js
│   ├── utils/
│   │   └── swagger.js
│   └── index.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MySQL database (Azure)
- npm or yarn

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd docket-calendar-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see Environment Variables section)

4. Create the database tables:
   You'll need to create the following tables in your MySQL database:

   - `users` table:
     ```sql
     CREATE TABLE users (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(100) UNIQUE NOT NULL,
       password VARCHAR(100) NOT NULL,
       role ENUM('user', 'admin') DEFAULT 'user',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     ```

   - `cases` table:
     ```sql
     CREATE TABLE cases (
       id INT PRIMARY KEY AUTO_INCREMENT,
       case_name VARCHAR(255) NOT NULL,
       jurisdiction VARCHAR(100),
       case_assignees TEXT,
       timezone VARCHAR(50),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     ```

   - `events` table:
     ```sql
     CREATE TABLE events (
       id INT PRIMARY KEY AUTO_INCREMENT,
       casename VARCHAR(255) NOT NULL,
       trigger_name VARCHAR(255),
       event_name VARCHAR(255) NOT NULL,
       event_date DATE,
       event_type VARCHAR(100),
       trigger_date DATE,
       trigger_time TIME,
       service_type VARCHAR(100),
       jurisdiction VARCHAR(100),
       created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     );
     ```

5. Run the application:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=dcmain.mysql.database.azure.com
DB_PORT=3306
DB_USER=crg_admin
DB_PASSWORD=F22Raptor123**
DB_NAME=docket_calendar

# Authentication
JWT_SECRET=your-strong-jwt-secret-key-should-be-changed-in-production
JWT_EXPIRATION=1d

# API Configuration
API_PREFIX=/api/v1
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Cases
- `GET /api/v1/cases` - Get all cases (paginated)
- `GET /api/v1/cases/:id` - Get a specific case by ID
- `GET /api/v1/cases/search` - Search cases by various parameters

### Events
- `GET /api/v1/events` - Get all events (paginated)
- `GET /api/v1/events/:id` - Get a specific event by ID
- `GET /api/v1/events/case/:caseId` - Get all events for a specific case
- `GET /api/v1/events/search` - Search events by various parameters

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Register or login to get a JWT token
2. Include the token in the Authorization header of your requests:
   ```
   Authorization: Bearer <your-token>
   ```

## Documentation

API documentation is available using Swagger UI:

- Access Swagger UI at: `http://localhost:3000/api-docs`
- Swagger JSON at: `http://localhost:3000/api-docs.json`

## Testing

The API can be tested using:

### Jest Testing
Run tests with:
```bash
npm test
```

### Postman
A Postman collection is available in the `postman` directory for testing the API endpoints.

Import the collection into Postman and update the environment variables as needed.

## Deployment

### Node.js Deployment
1. Set `NODE_ENV=production` in your .env file
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name docket-calendar-api
   ```

### Docker Deployment
1. Create a Dockerfile:
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 3000
   CMD ["node", "src/index.js"]
   ```

2. Build and run Docker container:
   ```bash
   docker build -t docket-calendar-api .
   docker run -p 3000:3000 -d docket-calendar-api
   ```

### Cloud Deployment
For Azure deployment:
1. Create an Azure App Service
2. Use Azure DevOps or GitHub Actions for CI/CD
3. Configure environment variables in Azure App Service settings 