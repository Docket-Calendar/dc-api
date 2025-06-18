const express = require('express');
const CaseController = require('../controllers/case.controller');
const { validateToken } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Case:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique case identifier
 *           example: 123
 *         case_name:
 *           type: string
 *           description: Name or matter description for the case
 *           example: "Smith v. Johnson Contract Dispute"
 *         jurisdiction:
 *           type: string
 *           description: Legal jurisdiction for the case
 *           example: "California Superior Court"
 *         created_on:
 *           type: string
 *           format: date-time
 *           description: When the case was created
 *           example: "2024-01-15T09:30:00.000Z"
 *         timezone:
 *           type: string
 *           description: Timezone for case scheduling
 *           example: "America/Los_Angeles"
 *         case_note:
 *           type: string
 *           description: Additional notes about the case
 *           example: "High priority corporate litigation case"
 *         initiation_date:
 *           type: string
 *           format: date
 *           description: Date when the case was initiated
 *           example: "2024-01-10"
 *         case_number:
 *           type: string
 *           description: Official case number from court
 *           example: "CV-2024-001234"
 *         color:
 *           type: integer
 *           description: Color ID for case display (0=No Color, 1=Lavender, 2=Light Green, 3=Purple, 4=Pink, 5=Yellow, 6=Orange, 7=Blue, 8=Grey, 9=Indigo, 10=Green, 11=Red)
 *           example: 11
 *           minimum: 0
 *           maximum: 11
 *         category:
 *           type: string
 *           description: Case category classification
 *           example: "Personal Injury"
 *         custom_details:
 *           type: object
 *           description: Custom case information
 *           properties:
 *             title:
 *               type: string
 *               example: "Contract Breach Litigation"
 *             location:
 *               type: string
 *               example: "Los Angeles Downtown Courthouse"
 *             description:
 *               type: string
 *               example: "Multi-million dollar contract dispute involving software licensing"
 *         assignees:
 *           type: array
 *           description: Users assigned to this case
 *           items:
 *             type: object
 *             properties:
 *               assignee:
 *                 type: string
 *                 example: "john.doe@lawfirm.com"
 *           example: [{"assignee": "john.doe@lawfirm.com"}, {"assignee": "jane.smith@lawfirm.com"}]
 *         calendars:
 *           type: array
 *           description: Calendar integrations for this case
 *           items:
 *             type: object
 *             properties:
 *               calendar_email:
 *                 type: string
 *               calendar_name:
 *                 type: string
 *           example: [{"calendar_email": "legal-team@lawfirm.com", "calendar_name": "Legal Team Calendar"}]
 *         dashboards:
 *           type: array
 *           description: Dashboard owners for this case
 *           items:
 *             type: object
 *             properties:
 *               dashboard_email:
 *                 type: string
 *               dashboard_name:
 *                 type: string
 *           example: [{"dashboard_email": "admin@lawfirm.com", "dashboard_name": "Case Admin"}]
 *     CaseListResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Cases retrieved successfully"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Case'
 *         count:
 *           type: integer
 *           example: 5
 *     CaseResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "Case retrieved successfully"
 *         data:
 *           $ref: '#/components/schemas/Case'
 */

/**
 * @swagger
 * /api/v1/cases:
 *   get:
 *     summary: Get all cases for authenticated user
 *     description: |
 *       Retrieves all cases that the authenticated user has access to.
 *       
 *       ## Implementation Examples:
 *       
 *       ### Basic JavaScript/Fetch Example:
 *       ```javascript
 *       const response = await fetch('/api/v1/cases', {
 *         headers: {
 *           'Authorization': 'Bearer YOUR_JWT_TOKEN'
 *         }
 *       });
 *       const data = await response.json();
 *       console.log(`Found ${data.count} cases:`, data.data);
 *       ```
 *       
 *       ### cURL Example:
 *       ```bash
 *       curl -X GET "/api/v1/cases" \
 *         -H "Authorization: Bearer YOUR_JWT_TOKEN"
 *       ```
 *       
 *       ### Use Cases:
 *       - **Dashboard Overview**: Display all cases for a user's main dashboard
 *       - **Case Selection**: Populate dropdown menus for case selection
 *       - **Reporting**: Generate case lists for reports and analytics
 *       - **Assignment Review**: Check which cases are assigned to the current user
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's cases retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CaseListResponse'
 *             example:
 *               status: "success"
 *               message: "Cases retrieved successfully"
 *               count: 2
 *               data:
 *                 - id: 123
 *                   case_name: "Smith v. Johnson Contract Dispute"
 *                   jurisdiction: "California Superior Court"
 *                   created_on: "2024-01-15T09:30:00.000Z"
 *                   timezone: "America/Los_Angeles"
 *                   case_note: "High priority corporate litigation"
 *                   initiation_date: "2024-01-10"
 *                   case_number: "CV-2024-001234"
 *                   color: 11
 *                   category: "Personal Injury"
 *                   custom_details:
 *                     title: "Contract Breach Litigation"
 *                     location: "Los Angeles Downtown Courthouse"
 *                     description: "Multi-million dollar contract dispute"
 *                   assignees:
 *                     - assignee: "john.doe@lawfirm.com"
 *                     - assignee: "jane.smith@lawfirm.com"
 *                   calendars:
 *                     - calendar_email: "legal-team@lawfirm.com"
 *                       calendar_name: "Legal Team Calendar"
 *                   dashboards:
 *                     - dashboard_email: "admin@lawfirm.com"
 *                       dashboard_name: "Case Admin"
 *                 - id: 124
 *                   case_name: "Property Acquisition - Downtown Plaza"
 *                   jurisdiction: "New York State Court"
 *                   created_on: "2024-01-20T14:15:00.000Z"
 *                   timezone: "America/New_York"
 *                   case_note: "Real estate transaction"
 *                   initiation_date: "2024-01-18"
 *                   case_number: "RE-2024-567890"
 *                   color: 7
 *                   category: "Real Estate"
 *                   custom_details:
 *                     title: "Commercial Real Estate"
 *                     location: "Manhattan District Court"
 *                     description: "Large commercial property acquisition"
 *                   assignees:
 *                     - assignee: "real.estate@lawfirm.com"
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
router.get('/', validateToken, CaseController.getAllCases);

/**
 * @swagger
 * /api/v1/cases/{id}:
 *   get:
 *     summary: Get case by ID for authenticated user
 *     description: |
 *       Retrieves detailed information for a specific case by ID. Only returns cases that the authenticated user has access to.
 *       
 *       ## Implementation Examples:
 *       
 *       ### JavaScript/Fetch Example:
 *       ```javascript
 *       const caseId = 123;
 *       const response = await fetch(`/api/v1/cases/${caseId}`, {
 *         headers: {
 *           'Authorization': 'Bearer YOUR_JWT_TOKEN'
 *         }
 *       });
 *       
 *       if (response.ok) {
 *         const caseData = await response.json();
 *         console.log('Case details:', caseData.data);
 *         console.log('Assignees:', caseData.data.assignees);
 *       } else {
 *         console.error('Case not found or access denied');
 *       }
 *       ```
 *       
 *       ### cURL Example:
 *       ```bash
 *       curl -X GET "/api/v1/cases/123" \
 *         -H "Authorization: Bearer YOUR_JWT_TOKEN"
 *       ```
 *       
 *       ### Use Cases:
 *       - **Case Detail View**: Display comprehensive case information
 *       - **Assignment Check**: Verify who is assigned to a specific case
 *       - **Calendar Integration**: Get calendar details for case scheduling
 *       - **Dashboard Setup**: Configure dashboards for case management
 *       - **Related Data Lookup**: Use case details to find related triggers and events
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique case identifier
 *         example: 123
 *     responses:
 *       200:
 *         description: Case retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CaseResponse'
 *             example:
 *               status: "success"
 *               message: "Case retrieved successfully"
 *               data:
 *                 id: 123
 *                 case_name: "Smith v. Johnson Contract Dispute"
 *                 jurisdiction: "California Superior Court"
 *                 created_on: "2024-01-15T09:30:00.000Z"
 *                 timezone: "America/Los_Angeles"
 *                 case_note: "High priority corporate litigation case requiring immediate attention"
 *                 initiation_date: "2024-01-10"
 *                 case_number: "CV-2024-001234"
 *                 color: 11
 *                 category: "Personal Injury"
 *                 custom_details:
 *                   title: "Contract Breach Litigation"
 *                   location: "Los Angeles Downtown Courthouse, Room 302"
 *                   description: "Multi-million dollar contract dispute involving software licensing agreements and intellectual property rights"
 *                 assignees:
 *                   - assignee: "john.doe@lawfirm.com"
 *                   - assignee: "jane.smith@lawfirm.com"
 *                   - assignee: "lead.counsel@lawfirm.com"
 *                 calendars:
 *                   - calendar_email: "legal-team@lawfirm.com"
 *                     calendar_name: "Legal Team Calendar"
 *                   - calendar_email: "court-calendar@lawfirm.com"
 *                     calendar_name: "Court Appearances"
 *                 dashboards:
 *                   - dashboard_email: "admin@lawfirm.com"
 *                     dashboard_name: "Case Admin"
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
 *         description: Case not found or not owned by user
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
 *                   example: "Case not found or you do not have access to this case"
 */
router.get('/:id', validateToken, CaseController.getCaseById);

/**
 * @swagger
 * /api/v1/cases/{id}/triggers:
 *   get:
 *     summary: Get all triggers for a specific case
 *     description: |
 *       Retrieves all triggers related to a specific case. This endpoint correlates triggers 
 *       with cases based on jurisdiction, assignees, and other contextual data.
 *       
 *       ## Implementation Examples:
 *       
 *       ### JavaScript/Fetch Example:
 *       ```javascript
 *       const caseId = 123;
 *       const response = await fetch(`/api/v1/cases/${caseId}/triggers`, {
 *         headers: {
 *           'Authorization': 'Bearer YOUR_JWT_TOKEN'
 *         }
 *       });
 *       
 *       const data = await response.json();
 *       console.log(`Found ${data.count} triggers for case ${caseId}`);
 *       data.data.forEach(trigger => {
 *         console.log(`- ${trigger.trigger_name} on ${trigger.trigger_date}`);
 *       });
 *       ```
 *       
 *       ### cURL Example:
 *       ```bash
 *       curl -X GET "/api/v1/cases/123/triggers" \
 *         -H "Authorization: Bearer YOUR_JWT_TOKEN"
 *       ```
 *       
 *       ### Use Cases:
 *       - **Case Timeline**: See all deadlines and events for a specific case
 *       - **Case Management**: Track triggers associated with case progress
 *       - **Deadline Monitoring**: Monitor upcoming triggers for case planning
 *       - **Workflow Automation**: Build case-specific trigger dashboards
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique case identifier
 *         example: 123
 *     responses:
 *       200:
 *         description: Triggers for the case retrieved successfully
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
 *                   example: "Triggers for case retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trigger'
 *                 count:
 *                   type: integer
 *                   example: 3
 *             example:
 *               status: "success"
 *               message: "Triggers for case retrieved successfully"
 *               count: 3
 *               data:
 *                 - id: 45678
 *                   trigger_name: "Discovery Deadline - Document Production"
 *                   trigger_date: "2024-03-15"
 *                   trigger_time: "14:30"
 *                   meridiem: "PM"
 *                   service_type: "Discovery"
 *                   jurisdiction: "California Superior Court"
 *                   number_of_events: 3
 *                   assignees:
 *                     - assignee_email: "john.doe@lawfirm.com"
 *                       assignee_name: "John Doe"
 *                 - id: 78901
 *                   trigger_name: "Court Hearing - Summary Judgment Motion"
 *                   trigger_date: "2024-04-02"
 *                   trigger_time: "09:00"
 *                   meridiem: "AM"
 *                   service_type: "Court Appearance"
 *                   jurisdiction: "California Superior Court"
 *                   number_of_events: 5
 *                   assignees:
 *                     - assignee_email: "lead.counsel@lawfirm.com"
 *                       assignee_name: "Alexandra Thompson"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Case not found or not owned by user
 */
router.get('/:id/triggers', validateToken, CaseController.getCaseTriggers);

module.exports = router; 