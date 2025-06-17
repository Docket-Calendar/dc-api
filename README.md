# DocketCalendar API - Simplified Version

A streamlined legal case management API focused on three core entities: **Cases**, **Triggers**, and **Events**.

## Overview

This simplified version of the DocketCalendar API provides a clean, focused interface for managing legal cases and their associated triggers and events. The API has been streamlined to include only the essential functionality needed for case management.

## Core Entities

### 1. Cases
Manage legal cases with the following fields:
- **Case Name** - Name of the case
- **Jurisdiction** - Legal jurisdiction
- **Created On** - When the case was created
- **Assignees** - Users assigned to the case
- **Calendars** - Calendar associations
- **Dashboards** - Dashboard associations
- **Timezone** - Case timezone
- **Custom Details Fields** - Title, location, description
- **Case Note** - Notes about the case
- **Initiation Date** - When the case was initiated
- **Case Number** - Unique case identifier

### 2. Triggers
Manage trigger events with the following fields:
- **Name** - Trigger name
- **Date and Time** - When the trigger fires
- **Service Type** - email, sms, push, personal
- **Jurisdiction** - Legal jurisdiction
- **Created On** - When the trigger was created
- **Number of Events** - Count of events created by this trigger
- **Custom Details Fields** - Title, location, description
- **Assignees** - Users assigned to the trigger
- **Calendars** - Calendar associations
- **Dashboards** - Dashboard associations

### 3. Events
Manage calendar events with the following fields:
- **Event Name/Subject** - Name of the event
- **Date and Time** - When the event occurs
- **Appointment Length** - Duration in minutes
- **Trigger Name, Date and Time** - Associated trigger information
- **Service Type** - email, sms, push, personal
- **Jurisdiction** - Legal jurisdiction
- **Created On** - When the event was created
- **Custom Details Fields** - Title, location, description
- **Assignees** - Users assigned to the event
- **Calendars** - Calendar associations
- **Dashboards** - Dashboard associations
- **Court Rule** - Applicable court rule
- **Date Rule** - Date calculation rule
- **Event Type** - Type of event

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration

### Cases
- `GET /api/cases` - List all cases
- `GET /api/cases/:id` - Get specific case
- `POST /api/cases` - Create new case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case (soft delete)

### Triggers
- `GET /api/triggers` - List all triggers
- `GET /api/triggers/:id` - Get specific trigger
- `POST /api/triggers` - Create new trigger
- `PUT /api/triggers/:id` - Update trigger
- `DELETE /api/triggers/:id` - Delete trigger (soft delete)
- `GET /api/triggers/:id/events` - Get events created by trigger

### Events
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get specific event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event (soft delete)
- `GET /api/events/case/:caseId` - Get events for a specific case

## Example API Requests

### Create a Case
```json
POST /api/cases
{
  "case_name": "Smith v. Jones",
  "jurisdiction": "New York",
  "timezone": "America/New_York",
  "case_note": "Personal injury case - car accident",
  "initiation_date": "2023-01-15",
  "case_number": "NY-2023-001",
  "custom_details": {
    "title": "Motor Vehicle Accident Case",
    "location": "123 Main St, New York, NY",
    "description": "Rear-end collision with significant injuries"
  },
  "assignees": [2, 3],
  "calendars": [1, 2],
  "dashboards": [1]
}
```

### Create a Trigger
```json
POST /api/triggers
{
  "name": "30-Day Filing Deadline",
  "trigger_date": "2023-07-15",
  "trigger_time": "09:00:00",
  "service_type": "email",
  "jurisdiction": "New York",
  "custom_details": {
    "title": "Critical Filing Deadline",
    "location": "New York Supreme Court",
    "description": "Must file response within 30 days or face default"
  },
  "assignees": [2],
  "calendars": [2],
  "dashboards": [2]
}
```

### Create an Event
```json
POST /api/events
{
  "case_id": 1,
  "trigger_id": 1,
  "event_name": "Response Filing Due",
  "event_date": "2023-08-15",
  "event_time": "17:00:00",
  "appointment_length": 30,
  "service_type": "email",
  "jurisdiction": "New York",
  "court_rule": "CPLR 3012",
  "date_rule": "30 days from service",
  "event_type": "Deadline",
  "custom_details": {
    "title": "Answer Filing Deadline",
    "location": "Court Clerk Office",
    "description": "Final deadline to file answer to complaint"
  },
  "assignees": [2],
  "calendars": [2],
  "dashboards": [2]
}
```

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up the database using `database-new-schema.sql`
4. Configure environment variables
5. Start the server: `npm start`

## Database Schema

The simplified schema focuses on the three core entities with proper relationships:
- Clean, normalized tables for Cases, Triggers, and Events
- Flexible custom details system for title, location, description
- Many-to-many relationships for assignees, calendars, and dashboards
- Soft delete functionality to preserve data integrity

## Features Removed for Simplification

- Standalone calendar management endpoints
- Standalone dashboard management endpoints
- Complex reporting and analytics
- Advanced search and filtering (simplified to basic queries)
- Legacy data migration tools

The calendar and dashboard functionality is still available through relationships with Cases, Triggers, and Events, but they no longer have their own management endpoints.

## Version

**v2.0.0** - Simplified API focusing on core entities 