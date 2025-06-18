const express = require('express');
const EventController = require('../controllers/event.controller');
const { validateToken } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique event identifier
 *           example: 789
 *         event_name:
 *           type: string
 *           description: Name or description of the event
 *           example: "Discovery Document Review Preparation"
 *         date:
 *           type: string
 *           format: date
 *           description: Date when the event occurs
 *           example: "2024-03-10"
 *         time:
 *           type: string
 *           description: Time when the event occurs
 *           example: "10:00"
 *         appointment_length:
 *           type: integer
 *           description: Duration of the event in minutes
 *           example: 120
 *         trigger_name:
 *           type: string
 *           description: Name of the trigger that generated this event
 *           example: "Discovery Deadline - Document Production"
 *         trigger_date:
 *           type: string
 *           format: date
 *           description: Date of the trigger that generated this event
 *           example: "2024-03-15"
 *         trigger_time:
 *           type: string
 *           description: Time of the trigger that generated this event
 *           example: "14:30"
 *         service_type:
 *           type: string
 *           description: Type of legal service or action
 *           example: "Discovery"
 *         jurisdiction:
 *           type: string
 *           description: Legal jurisdiction for this event
 *           example: "California Superior Court"
 *         created_on:
 *           type: string
 *           format: date-time
 *           description: When this event was created
 *           example: "2024-01-22T11:30:00.000Z"
 *         court_rule:
 *           type: string
 *           description: Applicable court rule for this event
 *           example: "FRCP 26(f)"
 *         date_rule:
 *           type: string
 *           description: Date calculation rule used to generate this event
 *           example: "5 days before trigger date"
 *         event_type:
 *           type: string
 *           description: Category or type of event
 *           example: "Preparation Task"
 *         color:
 *           type: integer
 *           description: Color ID for event display (0=No Color, 1=Lavender, 2=Light Green, 3=Purple, 4=Pink, 5=Yellow, 6=Orange, 7=Blue, 8=Grey, 9=Indigo, 10=Green, 11=Red)
 *           example: 11
 *           minimum: 0
 *           maximum: 11
 *         category:
 *           type: string
 *           description: Event category classification
 *           example: "Filing Deadline"
 *         custom_details:
 *           type: object
 *           description: Custom event information
 *           properties:
 *             title:
 *               type: string
 *               example: "Document Review Session"
 *             location:
 *               type: string
 *               example: "Conference Room A - 3rd Floor"
 *             description:
 *               type: string
 *               example: "Review and organize all discovery documents before production deadline"
 *         assignees:
 *           type: array
 *           description: Users assigned to this event
 *           items:
 *             type: object
 *             properties:
 *               assignee_email:
 *                 type: string
 *                 example: "paralegal@lawfirm.com"
 *               assignee_name:
 *                 type: string
 *                 example: "Sarah Williams"
 *           example: [{"assignee_email": "paralegal@lawfirm.com", "assignee_name": "Sarah Williams"}]
 *         calendars:
 *           type: array
 *           description: Calendar integrations for this event
 *           items:
 *             type: object
 *             properties:
 *               calendar_email:
 *                 type: string
 *               calendar_name:
 *                 type: string
 *           example: [{"calendar_email": "team-calendar@lawfirm.com", "calendar_name": "Team Calendar"}]
 *         dashboards:
 *           type: array
 *           description: Dashboard owners for this event
 *           items:
 *             type: object
 *             properties:
 *               dashboard_email:
 *                 type: string
 *               dashboard_name:
 *                 type: string
 *           example: [{"dashboard_email": "task-manager@lawfirm.com", "dashboard_name": "Task Manager"}]
 *     EventListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Events retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Event'
 *         count:
 *           type: integer
 *           example: 12
 *     EventResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Event retrieved successfully"
 *         data:
 *           $ref: '#/components/schemas/Event'
 */

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     summary: Get all events for authenticated user
 *     description: |
 *       Retrieves all events that the authenticated user has access to. Events are specific tasks or appointments 
 *       that are generated from triggers and represent actionable items in the legal workflow.
 *       
 *       ## Implementation Examples:
 *       
 *       ### JavaScript/Fetch Example - Basic List:
 *       ```javascript
 *       const response = await fetch('/api/v1/events', {
 *         headers: {
 *           'Authorization': 'Bearer YOUR_JWT_TOKEN'
 *         }
 *       });
 *       const data = await response.json();
 *       
 *       console.log(`Found ${data.count} events`);
 *       data.data.forEach(event => {
 *         console.log(`${event.event_name} - ${event.date} at ${event.time}`);
 *         console.log(`  Duration: ${event.appointment_length} minutes`);
 *         console.log(`  Generated by: ${event.trigger_name}`);
 *       });
 *       ```
 *       
 *       ### JavaScript Example - Filter Events by Date Range:
 *       ```javascript
 *       const response = await fetch('/api/v1/events', {
 *         headers: { 'Authorization': 'Bearer YOUR_JWT_TOKEN' }
 *       });
 *       const data = await response.json();
 *       
 *       // Get events for this week
 *       const today = new Date();
 *       const nextWeek = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
 *       
 *       const thisWeekEvents = data.data.filter(event => {
 *         const eventDate = new Date(event.date);
 *         return eventDate >= today && eventDate <= nextWeek;
 *       });
 *       
 *       console.log(`${thisWeekEvents.length} events this week`);
 *       ```
 *       
 *       ### JavaScript Example - Find Events from a Specific Trigger:
 *       ```javascript
 *       const triggerName = "Discovery Deadline - Document Production";
 *       const response = await fetch('/api/v1/events', {
 *         headers: { 'Authorization': 'Bearer YOUR_JWT_TOKEN' }
 *       });
 *       const data = await response.json();
 *       
 *       const eventsFromTrigger = data.data.filter(event => 
 *         event.trigger_name === triggerName
 *       );
 *       
 *       console.log(`Found ${eventsFromTrigger.length} events from trigger: ${triggerName}`);
 *       eventsFromTrigger.forEach(event => {
 *         console.log(`  - ${event.event_name} on ${event.date}`);
 *       });
 *       ```
 *       
 *       ### cURL Example:
 *       ```bash
 *       curl -X GET "/api/v1/events" \
 *         -H "Authorization: Bearer YOUR_JWT_TOKEN"
 *       ```
 *       
 *       ### Use Cases:
 *       - **Task Management**: View all upcoming tasks and appointments
 *       - **Calendar Integration**: Sync events with external calendar systems
 *       - **Workflow Tracking**: Monitor progress on trigger-generated tasks
 *       - **Assignment Overview**: Review event assignments across team members
 *       - **Deadline Preparation**: Plan for upcoming deadlines with related events
 *       
 *       ### Finding Events Related to Cases or Triggers:
 *       Events can be correlated with cases and triggers through various methods:
 *       
 *       #### Method 1: By Trigger Name
 *       ```javascript
 *       // Get events generated by a specific trigger
 *       const triggerResponse = await fetch(`/api/v1/triggers/${triggerId}`, { headers: authHeaders });
 *       const trigger = await triggerResponse.json();
 *       
 *       const eventsResponse = await fetch('/api/v1/events', { headers: authHeaders });
 *       const events = await eventsResponse.json();
 *       
 *       const triggerEvents = events.data.filter(event => 
 *         event.trigger_name === trigger.data.trigger_name
 *       );
 *       ```
 *       
 *       #### Method 2: By Jurisdiction and Assignees (Case Correlation)
 *       ```javascript
 *       // Find events related to a case by matching jurisdiction and assignees
 *       const caseResponse = await fetch(`/api/v1/cases/${caseId}`, { headers: authHeaders });
 *       const caseData = await caseResponse.json();
 *       
 *       const eventsResponse = await fetch('/api/v1/events', { headers: authHeaders });
 *       const eventsData = await eventsResponse.json();
 *       
 *       const caseRelatedEvents = eventsData.data.filter(event =>
 *         event.jurisdiction === caseData.data.jurisdiction &&
 *         event.assignees.some(ea => 
 *           caseData.data.assignees.some(ca => ca.assignee === ea.assignee_email)
 *         )
 *       );
 *       ```
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventListResponse'
 *             example:
 *               status: "success"
 *               message: "Events retrieved successfully"
 *               count: 4
 *               data:
 *                 - id: 789
 *                   event_name: "Discovery Document Review Preparation"
 *                   date: "2024-03-10"
 *                   time: "10:00"
 *                   appointment_length: 120
 *                   trigger_name: "Discovery Deadline - Document Production"
 *                   trigger_date: "2024-03-15"
 *                   trigger_time: "14:30"
 *                   service_type: "Discovery"
 *                   jurisdiction: "California Superior Court"
 *                   created_on: "2024-01-22T11:30:00.000Z"
 *                   court_rule: "FRCP 26(f)"
 *                   date_rule: "5 days before trigger date"
 *                   event_type: "Preparation Task"
 *                   color: 5
 *                   category: "Discovery Preparation"
 *                   custom_details:
 *                     title: "Document Review Session"
 *                     location: "Conference Room A - 3rd Floor"
 *                     description: "Review and organize all discovery documents before production deadline"
 *                   assignees:
 *                     - assignee_email: "paralegal@lawfirm.com"
 *                       assignee_name: "Sarah Williams"
 *                     - assignee_email: "john.doe@lawfirm.com"
 *                       assignee_name: "John Doe"
 *                   calendars:
 *                     - calendar_email: "team-calendar@lawfirm.com"
 *                       calendar_name: "Team Calendar"
 *                   dashboards:
 *                     - dashboard_email: "task-manager@lawfirm.com"
 *                       dashboard_name: "Task Manager"
 *                 - id: 790
 *                   event_name: "Final Document Compilation"
 *                   date: "2024-03-14"
 *                   time: "09:00"
 *                   appointment_length: 180
 *                   trigger_name: "Discovery Deadline - Document Production"
 *                   trigger_date: "2024-03-15"
 *                   trigger_time: "14:30"
 *                   service_type: "Discovery"
 *                   jurisdiction: "California Superior Court"
 *                   created_on: "2024-01-22T11:32:00.000Z"
 *                   court_rule: "FRCP 26(f)"
 *                   date_rule: "1 day before trigger date"
 *                   event_type: "Final Preparation"
 *                   custom_details:
 *                     title: "Document Production Finalization"
 *                     location: "Main Office - Document Room"
 *                     description: "Final compilation and quality check of all discovery documents"
 *                   assignees:
 *                     - assignee_email: "paralegal@lawfirm.com"
 *                       assignee_name: "Sarah Williams"
 *                     - assignee_email: "discovery.specialist@lawfirm.com"
 *                       assignee_name: "Michael Rodriguez"
 *                   calendars:
 *                     - calendar_email: "discovery-team@lawfirm.com"
 *                       calendar_name: "Discovery Calendar"
 *                   dashboards:
 *                     - dashboard_email: "case-manager@lawfirm.com"
 *                       dashboard_name: "Case Manager Dashboard"
 *                 - id: 791
 *                   event_name: "Pre-Hearing Brief Review"
 *                   date: "2024-03-30"
 *                   time: "14:00"
 *                   appointment_length: 90
 *                   trigger_name: "Court Hearing - Summary Judgment Motion"
 *                   trigger_date: "2024-04-02"
 *                   trigger_time: "09:00"
 *                   service_type: "Court Appearance"
 *                   jurisdiction: "California Superior Court"
 *                   created_on: "2024-01-25T10:15:00.000Z"
 *                   court_rule: "Local Rule 7.3"
 *                   date_rule: "3 days before hearing"
 *                   event_type: "Brief Review"
 *                   custom_details:
 *                     title: "Summary Judgment Brief Review"
 *                     location: "Partner Office"
 *                     description: "Final review of summary judgment motion brief and supporting documents"
 *                   assignees:
 *                     - assignee_email: "lead.counsel@lawfirm.com"
 *                       assignee_name: "Alexandra Thompson"
 *                     - assignee_email: "senior.associate@lawfirm.com"
 *                       assignee_name: "David Kim"
 *                   calendars:
 *                     - calendar_email: "court-prep@lawfirm.com"
 *                       calendar_name: "Court Preparation"
 *                   dashboards:
 *                     - dashboard_email: "partner@lawfirm.com"
 *                       dashboard_name: "Partner Dashboard"
 *                 - id: 792
 *                   event_name: "Mediation Preparation Meeting"
 *                   date: "2024-02-26"
 *                   time: "16:00"
 *                   appointment_length: 60
 *                   trigger_name: "Mediation Session"
 *                   trigger_date: "2024-02-28"
 *                   trigger_time: "13:00"
 *                   service_type: "ADR"
 *                   jurisdiction: "Private Mediation"
 *                   created_on: "2024-01-18T17:00:00.000Z"
 *                   court_rule: "Mediation Rule 3.1"
 *                   date_rule: "2 days before mediation"
 *                   event_type: "Preparation Meeting"
 *                   custom_details:
 *                     title: "Mediation Strategy Session"
 *                     location: "Conference Room B"
 *                     description: "Prepare strategy and materials for upcoming mediation session"
 *                   assignees:
 *                     - assignee_email: "mediator.lead@lawfirm.com"
 *                       assignee_name: "Robert Chen"
 *                     - assignee_email: "client.relations@lawfirm.com"
 *                       assignee_name: "Lisa Anderson"
 *                   calendars: []
 *                   dashboards: []
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Invalid or missing authorization token"
 */
router.get('/', validateToken, EventController.getAllEvents);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   get:
 *     summary: Get event by ID for authenticated user
 *     description: |
 *       Retrieves detailed information for a specific event by ID. Only returns events that the authenticated user has access to.
 *       
 *       ## Implementation Examples:
 *       
 *       ### JavaScript/Fetch Example:
 *       ```javascript
 *       const eventId = 789;
 *       const response = await fetch(`/api/v1/events/${eventId}`, {
 *         headers: {
 *           'Authorization': 'Bearer YOUR_JWT_TOKEN'
 *         }
 *       });
 *       
 *       if (response.ok) {
 *         const eventData = await response.json();
 *         const event = eventData.data;
 *         
 *         console.log(`Event: ${event.event_name}`);
 *         console.log(`Date: ${event.date} at ${event.time} (${event.appointment_length} minutes)`);
 *         console.log(`Location: ${event.custom_details.location}`);
 *         console.log(`Generated by trigger: ${event.trigger_name}`);
 *         console.log(`Assigned to: ${event.assignees.map(a => a.assignee_name).join(', ')}`);
 *       } else {
 *         console.error('Event not found or access denied');
 *       }
 *       ```
 *       
 *       ### JavaScript Example - Create Calendar Entry:
 *       ```javascript
 *       const eventResponse = await fetch(`/api/v1/events/${eventId}`, { headers: authHeaders });
 *       const eventData = await eventResponse.json();
 *       const event = eventData.data;
 *       
 *       // Create calendar entry object
 *       const calendarEntry = {
 *         title: event.event_name,
 *         start: `${event.date}T${event.time}:00`,
 *         duration: event.appointment_length,
 *         location: event.custom_details.location,
 *         description: `${event.custom_details.description}\n\nGenerated by: ${event.trigger_name}`,
 *         attendees: event.assignees.map(a => a.assignee_email)
 *       };
 *       
 *       console.log('Calendar entry ready:', calendarEntry);
 *       ```
 *       
 *       ### JavaScript Example - Find Related Trigger:
 *       ```javascript
 *       const eventResponse = await fetch(`/api/v1/events/${eventId}`, { headers: authHeaders });
 *       const eventData = await eventResponse.json();
 *       
 *       // Find the trigger that generated this event
 *       const triggersResponse = await fetch('/api/v1/triggers', { headers: authHeaders });
 *       const triggersData = await triggersResponse.json();
 *       
 *       const parentTrigger = triggersData.data.find(trigger => 
 *         trigger.trigger_name === eventData.data.trigger_name
 *       );
 *       
 *       if (parentTrigger) {
 *         console.log(`This event was generated by trigger: ${parentTrigger.id}`);
 *         console.log(`Trigger date: ${parentTrigger.trigger_date}`);
 *       }
 *       ```
 *       
 *       ### cURL Example:
 *       ```bash
 *       curl -X GET "/api/v1/events/789" \
 *         -H "Authorization: Bearer YOUR_JWT_TOKEN"
 *       ```
 *       
 *       ### Use Cases:
 *       - **Event Detail View**: Display comprehensive event information
 *       - **Task Management**: Get specific task details for completion
 *       - **Calendar Integration**: Create calendar entries with full event details
 *       - **Assignment Tracking**: Check who is responsible for this event
 *       - **Context Understanding**: See relationship to parent trigger and case
 *       - **Time Management**: Plan schedule around event duration and requirements
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique event identifier
 *         example: 789
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *             example:
 *               status: "success"
 *               message: "Event retrieved successfully"
 *               data:
 *                 id: 789
 *                 event_name: "Discovery Document Review Preparation"
 *                 date: "2024-03-10"
 *                 time: "10:00"
 *                 appointment_length: 120
 *                 trigger_name: "Discovery Deadline - Document Production"
 *                 trigger_date: "2024-03-15"
 *                 trigger_time: "14:30"
 *                 service_type: "Discovery"
 *                 jurisdiction: "California Superior Court"
 *                 created_on: "2024-01-22T11:30:00.000Z"
 *                 court_rule: "FRCP 26(f)"
 *                 date_rule: "5 days before trigger date"
 *                 event_type: "Preparation Task"
 *                 color: 5
 *                 category: "Discovery Preparation"
 *                 custom_details:
 *                   title: "Document Review Session"
 *                   location: "Conference Room A - 3rd Floor"
 *                   description: "Comprehensive review and organization of all discovery documents before production deadline. Include review of financial records, correspondence, contracts, and supporting documentation. Ensure all privileged materials are identified and properly marked."
 *                 assignees:
 *                   - assignee_email: "paralegal@lawfirm.com"
 *                     assignee_name: "Sarah Williams"
 *                   - assignee_email: "john.doe@lawfirm.com"
 *                     assignee_name: "John Doe"
 *                   - assignee_email: "senior.paralegal@lawfirm.com"
 *                     assignee_name: "Maria Gonzalez"
 *                 calendars:
 *                   - calendar_email: "team-calendar@lawfirm.com"
 *                     calendar_name: "Team Calendar"
 *                   - calendar_email: "discovery-calendar@lawfirm.com"
 *                     calendar_name: "Discovery Tasks"
 *                 dashboards:
 *                   - dashboard_email: "task-manager@lawfirm.com"
 *                     dashboard_name: "Task Manager"
 *                   - dashboard_email: "case-manager@lawfirm.com"
 *                     dashboard_name: "Case Manager Dashboard"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Invalid or missing authorization token"
 *       404:
 *         description: Event not found or not owned by user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Event not found or you do not have access to this event"
 */
router.get('/:id', validateToken, EventController.getEventById);

module.exports = router; 