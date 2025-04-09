# DocketCalendar API

A RESTful API for the DocketCalendar application that provides case information and related events.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Examples](#examples)
- [Rate Limits](#rate-limits)
- [Error Handling](#error-handling)
- [Support](#support)

## Overview

The DocketCalendar API provides access to case information and calendar events. This API allows you to:

- Retrieve case information
- Access case-related events
- Search for cases and events using various parameters
- Validate authentication tokens

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### How to Use API Tokens:

1. Obtain an API token from the DocketCalendar admin interface
   
2. Include the token in the Authorization header of your API requests:
   ```
   Authorization: Bearer <your-token>
   ```

3. You can verify if your token is valid using the `/api/v1/auth/validate-token` endpoint

### Token Format

Tokens contain a payload with:
- A unique identifier 
- Token expiration time (default: 1 day)

## API Endpoints

### Authentication
- `GET /api/v1/auth/validate-token` - Validate API token

### Cases
- `GET /api/v1/cases` - Get all cases (paginated)
- `GET /api/v1/cases/:id` - Get a specific case by ID
- `GET /api/v1/cases/search` - Search cases by various parameters

### Events
- `GET /api/v1/events` - Get all events (paginated)
- `GET /api/v1/events/:id` - Get a specific event by ID
- `GET /api/v1/events/case/:caseId` - Get all events for a specific case
- `GET /api/v1/events/search` - Search events by various parameters

## Examples

### Retrieving Cases

```
GET /api/v1/cases?page=1&limit=10
Authorization: Bearer <your-token>
```

### Searching for Events

```
GET /api/v1/events/search?event_type=hearing&start_date=2023-01-01
Authorization: Bearer <your-token>
```

### Retrieving a Specific Case

```
GET /api/v1/cases/123
Authorization: Bearer <your-token>
```

## Rate Limits

To ensure service stability and fair usage, the API implements rate limiting:

- 100 requests per minute per IP address
- 1000 requests per day per token

If you exceed these limits, you will receive a 429 (Too Many Requests) response.

## Error Handling

The API uses standard HTTP status codes:

- 200: Success
- 400: Bad Request - Invalid parameters
- 401: Unauthorized - Invalid or missing token
- 403: Forbidden - Valid token but insufficient permissions
- 404: Not Found - Resource doesn't exist
- 429: Too Many Requests - Rate limit exceeded
- 500: Internal Server Error - Something went wrong on our end

Error responses include a JSON body with details:

```json
{
  "error": true,
  "message": "Description of the error",
  "status": 400
}
```

## Documentation

Interactive API documentation is available at:

- Swagger UI: [https://api.docketcalendar.com/api-docs](https://api.docketcalendar.com/api-docs)
- Swagger JSON: [https://api.docketcalendar.com/api-docs.json](https://api.docketcalendar.com/api-docs.json)

## Support

For questions or issues with the API, please contact support at [support@docketcalendar.com](mailto:support@docketcalendar.com). 