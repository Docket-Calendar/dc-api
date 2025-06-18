const express = require('express');
const TriggerController = require('../controllers/trigger.controller');
const { validateToken } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Trigger:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique trigger identifier
 *           example: 45678
 *         trigger_name:
 *           type: string
 *           description: Name or description of the trigger event
 *           example: "Discovery Deadline - Document Production"
 *         trigger_date:
 *           type: string
 *           format: date
 *           description: Date when the trigger event occurs
 *           example: "2024-03-15"
 *         trigger_time:
 *           type: string
 *           description: Time when the trigger event occurs
 *           example: "14:30"
 *         meridiem:
 *           type: string
 *           description: AM/PM indicator for trigger time
 *           example: "PM"
 *         service_type:
 *           type: string
 *           description: Type of legal service or action
 *           example: "Discovery"
 *         service_type_description:
 *           type: string
 *           description: Detailed description of the service type
 *           example: "Document Discovery and Production"
 *         jurisdiction:
 *           type: string
 *           description: Legal jurisdiction for this trigger
 *           example: "California Superior Court"
 *         jurisdiction_description:
 *           type: string
 *           description: Detailed description of the jurisdiction
 *           example: "California Superior Court - Los Angeles County"
 *         created_on:
 *           type: string
 *           format: date-time
 *           description: When this trigger was created
 *           example: "2024-01-20T10:15:00.000Z"
 *         color:
 *           type: integer
 *           description: Color ID for trigger display (0=No Color, 1=Lavender, 2=Light Green, 3=Purple, 4=Pink, 5=Yellow, 6=Orange, 7=Blue, 8=Grey, 9=Indigo, 10=Green, 11=Red)
 *           example: 11
 *           minimum: 0
 *           maximum: 11
 *         category:
 *           type: string
 *           description: Trigger category classification
 *           example: "Filing Deadline"
 *         number_of_events:
 *           type: integer
 *           description: Number of events generated from this trigger
 *           example: 3
 *         custom_details:
 *           type: object
 *           description: Custom trigger information
 *           properties:
 *             title:
 *               type: string
 *               example: "Document Discovery Deadline"
 *             location:
 *               type: string
 *               example: "Los Angeles Superior Court - Department 23"
 *             description:
 *               type: string
 *               example: "Final deadline for production of all requested documents"
 *         assignees:
 *           type: array
 *           description: Users assigned to handle this trigger
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
 *           description: Calendar integrations for this trigger
 *           items:
 *             type: object
 *             properties:
 *               calendar_email:
 *                 type: string
 *               calendar_name:
 *                 type: string
 *           example: [{"calendar_email": "discovery-team@lawfirm.com", "calendar_name": "Discovery Calendar"}]
 *         dashboards:
 *           type: array
 *           description: Dashboard owners for this trigger
 *           items:
 *             type: object
 *             properties:
 *               dashboard_email:
 *                 type: string
 *               dashboard_name:
 *                 type: string
 *           example: [{"dashboard_email": "case-manager@lawfirm.com", "dashboard_name": "Case Manager Dashboard"}]
 *     TriggerListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Triggers retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Trigger'
 *         count:
 *           type: integer
 *           example: 8
 *     TriggerResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Trigger retrieved successfully"
 *         data:
 *           $ref: '#/components/schemas/Trigger'
 */

/**
 * @swagger
 * /api/v1/triggers:
 *   get:
 *     summary: Get all triggers for authenticated user
 *     description: |
 *       Retrieves all triggers that the authenticated user has access to. Triggers represent important deadlines, 
 *       court dates, and other time-sensitive events that generate follow-up events.
 *       
 *       ## Implementation Examples:
 *       
 *       ### JavaScript/Fetch Example - Basic List:
 *       ```javascript
 *       const response = await fetch('/api/v1/triggers', {
 *         headers: {
 *           'Authorization': 'Bearer YOUR_JWT_TOKEN'
 *         }
 *       });
 *       const data = await response.json();
 *       
 *       console.log(`Found ${data.count} triggers`);
 *       data.data.forEach(trigger => {
 *         console.log(`${trigger.trigger_name} - ${trigger.trigger_date} at ${trigger.trigger_time}${trigger.meridiem}`);
 *         console.log(`  Events generated: ${trigger.number_of_events}`);
 *       });
 *       ```
 *       
 *       ### JavaScript Example - Filter by Date Range:
 *       ```javascript
 *       const response = await fetch('/api/v1/triggers', {
 *         headers: { 'Authorization': 'Bearer YOUR_JWT_TOKEN' }
 *       });
 *       const data = await response.json();
 *       
 *       // Filter triggers for next 30 days
 *       const today = new Date();
 *       const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
 *       
 *       const upcomingTriggers = data.data.filter(trigger => {
 *         const triggerDate = new Date(trigger.trigger_date);
 *         return triggerDate >= today && triggerDate <= thirtyDaysFromNow;
 *       });
 *       
 *       console.log(`${upcomingTriggers.length} triggers in the next 30 days`);
 *       ```
 *       
 *       ### cURL Example:
 *       ```bash
 *       curl -X GET "/api/v1/triggers" \
 *         -H "Authorization: Bearer YOUR_JWT_TOKEN"
 *       ```
 *       
 *       ### Use Cases:
 *       - **Deadline Management**: Track all upcoming deadlines and court dates
 *       - **Event Planning**: See which triggers will generate events
 *       - **Assignment Overview**: Review trigger assignments across team members
 *       - **Calendar Integration**: Sync triggers with external calendar systems
 *       - **Case Correlation**: Cross-reference triggers with cases (requires additional case lookup)
 *       
 *       ### Finding Triggers for a Specific Case:
 *       Since triggers don't directly expose case_id in the current API, you can correlate by:
 *       1. Get case details: `GET /api/v1/cases/{case_id}`
 *       2. Get all triggers: `GET /api/v1/triggers`
 *       3. Match by jurisdiction, assignees, or custom details
 *       
 *       ```javascript
 *       // Example: Find triggers related to a case by jurisdiction and assignees
 *       const caseResponse = await fetch(`/api/v1/cases/${caseId}`, { headers: authHeaders });
 *       const caseData = await caseResponse.json();
 *       
 *       const triggersResponse = await fetch('/api/v1/triggers', { headers: authHeaders });
 *       const triggersData = await triggersResponse.json();
 *       
 *       const relatedTriggers = triggersData.data.filter(trigger => 
 *         trigger.jurisdiction === caseData.data.jurisdiction &&
 *         trigger.assignees.some(ta => 
 *           caseData.data.assignees.some(ca => ca.assignee === ta.assignee_email)
 *         )
 *       );
 *       ```
 *     tags: [Triggers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's triggers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TriggerListResponse'
 *             example:
 *               status: "success"
 *               message: "Triggers retrieved successfully"
 *               count: 3
 *               data:
 *                 - id: 45678
 *                   trigger_name: "Discovery Deadline - Document Production"
 *                   trigger_date: "2024-03-15"
 *                   trigger_time: "14:30"
 *                   meridiem: "PM"
 *                   service_type: "Discovery"
 *                   service_type_description: "Document Discovery and Production"
 *                   jurisdiction: "California Superior Court"
 *                   jurisdiction_description: "California Superior Court - Los Angeles County"
 *                   created_on: "2024-01-20T10:15:00.000Z"
 *                   color: 11
 *                   category: "Filing Deadline"
 *                   number_of_events: 3
 *                   custom_details:
 *                     title: "Document Discovery Deadline"
 *                     location: "Los Angeles Superior Court - Department 23"
 *                     description: "Final deadline for production of all requested documents"
 *                   assignees:
 *                     - assignee_email: "paralegal@lawfirm.com"
 *                       assignee_name: "Sarah Williams"
 *                     - assignee_email: "john.doe@lawfirm.com"
 *                       assignee_name: "John Doe"
 *                   calendars:
 *                     - calendar_email: "discovery-team@lawfirm.com"
 *                       calendar_name: "Discovery Calendar"
 *                   dashboards:
 *                     - dashboard_email: "case-manager@lawfirm.com"
 *                       dashboard_name: "Case Manager Dashboard"
 *                 - id: 78901
 *                   trigger_name: "Court Hearing - Summary Judgment Motion"
 *                   trigger_date: "2024-04-02"
 *                   trigger_time: "09:00"
 *                   meridiem: "AM"
 *                   service_type: "Court Appearance"
 *                   service_type_description: "Motion Hearing"
 *                   jurisdiction: "California Superior Court"
 *                   jurisdiction_description: "California Superior Court - Los Angeles County"
 *                   created_on: "2024-01-25T09:45:00.000Z"
 *                   color: 10
 *                   category: "Court Appearance"
 *                   number_of_events: 5
 *                   custom_details:
 *                     title: "Summary Judgment Motion Hearing"
 *                     location: "Los Angeles Superior Court - Department 15"
 *                     description: "Hearing on defendant's motion for summary judgment"
 *                   assignees:
 *                     - assignee_email: "lead.counsel@lawfirm.com"
 *                       assignee_name: "Alexandra Thompson"
 *                   calendars:
 *                     - calendar_email: "court-calendar@lawfirm.com"
 *                       calendar_name: "Court Appearances"
 *                   dashboards:
 *                     - dashboard_email: "partner@lawfirm.com"
 *                       dashboard_name: "Partner Dashboard"
 *                 - id: 34567
 *                   trigger_name: "Mediation Session"
 *                   trigger_date: "2024-02-28"
 *                   trigger_time: "13:00"
 *                   meridiem: "PM"
 *                   service_type: "ADR"
 *                   service_type_description: "Alternative Dispute Resolution"
 *                   jurisdiction: "Private Mediation"
 *                   jurisdiction_description: "Private Mediation Center"
 *                   created_on: "2024-01-18T16:20:00.000Z"
 *                   color: 7
 *                   category: "Mediation"
 *                   number_of_events: 2
 *                   custom_details:
 *                     title: "Contract Dispute Mediation"
 *                     location: "Downtown Mediation Center - Room B"
 *                     description: "Mandatory mediation session for contract dispute resolution"
 *                   assignees:
 *                     - assignee_email: "mediator.lead@lawfirm.com"
 *                       assignee_name: "Robert Chen"
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
router.get('/', validateToken, TriggerController.getAllTriggers);

/**
 * @swagger
 * /api/v1/triggers/{id}:
 *   get:
 *     summary: Get trigger by ID for authenticated user
 *     description: |
 *       Retrieves detailed information for a specific trigger by ID. Only returns triggers that the authenticated user has access to.
 *       
 *       ## Implementation Examples:
 *       
 *       ### JavaScript/Fetch Example:
 *       ```javascript
 *       const triggerId = 45678;
 *       const response = await fetch(`/api/v1/triggers/${triggerId}`, {
 *         headers: {
 *           'Authorization': 'Bearer YOUR_JWT_TOKEN'
 *         }
 *       });
 *       
 *       if (response.ok) {
 *         const triggerData = await response.json();
 *         const trigger = triggerData.data;
 *         
 *         console.log(`Trigger: ${trigger.trigger_name}`);
 *         console.log(`Date: ${trigger.trigger_date} at ${trigger.trigger_time}${trigger.meridiem}`);
 *         console.log(`Location: ${trigger.custom_details.location}`);
 *         console.log(`Assigned to: ${trigger.assignees.map(a => a.assignee_name).join(', ')}`);
 *         console.log(`Will generate ${trigger.number_of_events} events`);
 *       } else {
 *         console.error('Trigger not found or access denied');
 *       }
 *       ```
 *       
 *       ### JavaScript Example - Check Events Generated:
 *       ```javascript
 *       const triggerResponse = await fetch(`/api/v1/triggers/${triggerId}`, { headers: authHeaders });
 *       const triggerData = await triggerResponse.json();
 *       
 *       if (triggerData.data.number_of_events > 0) {
 *         // This trigger has generated events - you could fetch events to see them
 *         const eventsResponse = await fetch('/api/v1/events', { headers: authHeaders });
 *         const eventsData = await eventsResponse.json();
 *         
 *         // Filter events by trigger name (since events include trigger_name)
 *         const relatedEvents = eventsData.data.filter(event => 
 *           event.trigger_name === triggerData.data.trigger_name
 *         );
 *         
 *         console.log(`Found ${relatedEvents.length} events from this trigger`);
 *       }
 *       ```
 *       
 *       ### cURL Example:
 *       ```bash
 *       curl -X GET "/api/v1/triggers/45678" \
 *         -H "Authorization: Bearer YOUR_JWT_TOKEN"
 *       ```
 *       
 *       ### Use Cases:
 *       - **Trigger Detail View**: Display comprehensive trigger information
 *       - **Assignment Management**: Check who is responsible for this trigger
 *       - **Event Planning**: Understand what events will be generated
 *       - **Calendar Integration**: Get precise timing for calendar entries
 *       - **Case Context**: Use trigger details to understand case timeline
 *       - **Progress Tracking**: Monitor trigger status and related events
 *     tags: [Triggers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique trigger identifier
 *         example: 45678
 *     responses:
 *       200:
 *         description: Trigger retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TriggerResponse'
 *             example:
 *               status: "success"
 *               message: "Trigger retrieved successfully"
 *               data:
 *                 id: 45678
 *                 trigger_name: "Discovery Deadline - Document Production"
 *                 trigger_date: "2024-03-15"
 *                 trigger_time: "14:30"
 *                 meridiem: "PM"
 *                 service_type: "Discovery"
 *                 service_type_description: "Document Discovery and Production"
 *                 jurisdiction: "California Superior Court"
 *                 jurisdiction_description: "California Superior Court - Los Angeles County"
 *                 created_on: "2024-01-20T10:15:00.000Z"
 *                 color: 11
 *                 category: "Filing Deadline"
 *                 number_of_events: 3
 *                 custom_details:
 *                   title: "Document Discovery Deadline"
 *                   location: "Los Angeles Superior Court - Department 23"
 *                   description: "Final deadline for production of all requested documents in discovery phase including financial records, correspondence, and contract documentation"
 *                 assignees:
 *                   - assignee_email: "paralegal@lawfirm.com"
 *                     assignee_name: "Sarah Williams"
 *                   - assignee_email: "john.doe@lawfirm.com"
 *                     assignee_name: "John Doe"
 *                   - assignee_email: "discovery.specialist@lawfirm.com"
 *                     assignee_name: "Michael Rodriguez"
 *                 calendars:
 *                   - calendar_email: "discovery-team@lawfirm.com"
 *                     calendar_name: "Discovery Calendar"
 *                   - calendar_email: "case-deadlines@lawfirm.com"
 *                     calendar_name: "Critical Deadlines"
 *                 dashboards:
 *                   - dashboard_email: "case-manager@lawfirm.com"
 *                     dashboard_name: "Case Manager Dashboard"
 *                   - dashboard_email: "partner@lawfirm.com"
 *                     dashboard_name: "Partner Dashboard"
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
 *         description: Trigger not found or not owned by user
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
 *                   example: "Trigger not found or you do not have access to this trigger"
 */
router.get('/:id', validateToken, TriggerController.getTriggerById);

/**
 * @swagger
 * /api/v1/triggers/{id}/events:
 *   get:
 *     summary: Get all events generated by a specific trigger
 *     description: |
 *       Retrieves all events that were generated from a specific trigger. Events are tasks, 
 *       appointments, or reminders created based on trigger rules and timelines.
 *       
 *       ## Implementation Examples:
 *       
 *       ### JavaScript/Fetch Example:
 *       ```javascript
 *       const triggerId = 45678;
 *       const response = await fetch(`/api/v1/triggers/${triggerId}/events`, {
 *         headers: {
 *           'Authorization': 'Bearer YOUR_JWT_TOKEN'
 *         }
 *       });
 *       
 *       const data = await response.json();
 *       console.log(`Found ${data.count} events from trigger ${triggerId}`);
 *       data.data.forEach(event => {
 *         console.log(`- ${event.event_name} on ${event.date} at ${event.time}`);
 *       });
 *       ```
 *       
 *       ### cURL Example:
 *       ```bash
 *       curl -X GET "/api/v1/triggers/45678/events" \
 *         -H "Authorization: Bearer YOUR_JWT_TOKEN"
 *       ```
 *       
 *       ### Use Cases:
 *       - **Trigger Impact**: See what events a trigger will generate
 *       - **Task Planning**: View all tasks created from a specific deadline
 *       - **Event Management**: Track completion of trigger-generated events
 *       - **Workflow Monitoring**: Monitor trigger effectiveness and outcomes
 *     tags: [Triggers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique trigger identifier
 *         example: 45678
 *     responses:
 *       200:
 *         description: Events generated by the trigger retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Events for trigger retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 count:
 *                   type: integer
 *                   example: 3
 *             example:
 *               status: "success"
 *               message: "Events for trigger retrieved successfully"
 *               count: 3
 *               data:
 *                 - id: 789
 *                   event_name: "Discovery Document Review Preparation"
 *                   date: "2024-03-10"
 *                   time: "10:00"
 *                   appointment_length: 120
 *                   trigger_name: "Discovery Deadline - Document Production"
 *                   trigger_date: "2024-03-15"
 *                   service_type: "Discovery"
 *                   event_type: "Preparation Task"
 *                   assignees:
 *                     - assignee_email: "paralegal@lawfirm.com"
 *                       assignee_name: "Sarah Williams"
 *                 - id: 790
 *                   event_name: "Final Document Compilation"
 *                   date: "2024-03-14"
 *                   time: "09:00"
 *                   appointment_length: 180
 *                   trigger_name: "Discovery Deadline - Document Production"
 *                   trigger_date: "2024-03-15"
 *                   service_type: "Discovery"
 *                   event_type: "Final Preparation"
 *                   assignees:
 *                     - assignee_email: "discovery.specialist@lawfirm.com"
 *                       assignee_name: "Michael Rodriguez"
 *                 - id: 791
 *                   event_name: "Document Delivery Confirmation"
 *                   date: "2024-03-15"
 *                   time: "15:00"
 *                   appointment_length: 30
 *                   trigger_name: "Discovery Deadline - Document Production"
 *                   trigger_date: "2024-03-15"
 *                   service_type: "Discovery"
 *                   event_type: "Confirmation Task"
 *                   assignees:
 *                     - assignee_email: "case.manager@lawfirm.com"
 *                       assignee_name: "Jennifer Brown"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Trigger not found or not owned by user
 */
router.get('/:id/events', validateToken, TriggerController.getTriggerEvents);

module.exports = router; 