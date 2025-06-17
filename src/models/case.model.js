const { pool } = require('../config/database');

class Case {
  constructor(data) {
    // Map API fields to actual database fields
    this.id = data.id;
    this.case_name = data.case_name;
    this.jurisdiction = data.jurisdiction;
    this.case_assignees = data.case_assignees;
    this.timezone = data.timezone;
    this.created_at = data.created_at;
  }

  // Find all cases for a specific user
  static async findAll(userId) {
    try {
      // Main Cases Query - using real docket_cases table
      const query = `
        SELECT 
          dc.case_id,
          dc.case_matter as case_name,
          dc.case_jurisdiction as jurisdiction,
          dc.created_on,
          dc.case_customtext as custom_details_description,
          dc.case_subjecttext as custom_details_title,
          dc.case_location as custom_details_location,
          dc.note_field as case_note,
          dc.initiation_date,
          dc.case_number,
          dc.casetimezone as timezone
        FROM docket_cases dc 
        WHERE dc.user_id = ?
        ORDER BY dc.created_on DESC
        LIMIT 50
      `;

      const [rows] = await pool.execute(query, [userId]);

      // Get assignees, calendars, and dashboards for each case
      const casesWithDetails = await Promise.all(rows.map(async (caseRow) => {
        const [assignees, calendars, dashboards] = await Promise.all([
          this.getCaseAssignees(caseRow.case_id),
          this.getCaseCalendars(caseRow.case_id),
          this.getCaseDashboards(caseRow.case_id, userId)
        ]);

        return {
          id: caseRow.case_id,
          case_name: caseRow.case_name,
          jurisdiction: caseRow.jurisdiction,
          created_on: caseRow.created_on,
          assignees: assignees,
          calendars: calendars,
          dashboards: dashboards,
          timezone: caseRow.timezone,
          custom_details: {
            title: caseRow.custom_details_title,
            location: caseRow.custom_details_location,
            description: caseRow.custom_details_description
          },
          case_note: caseRow.case_note,
          initiation_date: caseRow.initiation_date,
          case_number: caseRow.case_number
        };
      }));

      return casesWithDetails;

    } catch (error) {
      console.error('Error finding cases:', error);
      throw new Error(`Error finding cases: ${error.message}`);
    }
  }

  // Find case by ID for a specific user
  static async findById(id, userId) {
    try {
      // Main Case Information
      const query = `
        SELECT 
          dc.case_id,
          dc.case_matter as case_name,
          dc.case_jurisdiction as jurisdiction,
          dc.created_on,
          dc.case_customtext as custom_details_description,
          dc.case_subjecttext as custom_details_title,
          dc.case_location as custom_details_location,
          dc.note_field as case_note,
          dc.initiation_date,
          dc.case_number,
          dc.casetimezone as timezone
        FROM docket_cases dc 
        WHERE dc.case_id = ? AND dc.user_id = ?
      `;

      const [rows] = await pool.execute(query, [id, userId]);

      if (rows.length === 0) {
        return null;
      }

      const caseRow = rows[0];

      // Get assignees, calendars, and dashboards
      const [assignees, calendars, dashboards] = await Promise.all([
        this.getCaseAssignees(id),
        this.getCaseCalendars(id),
        this.getCaseDashboards(id, userId)
      ]);

      return {
        id: caseRow.case_id,
        case_name: caseRow.case_name,
        jurisdiction: caseRow.jurisdiction,
        created_on: caseRow.created_on,
        assignees: assignees,
        calendars: calendars,
        dashboards: dashboards,
        timezone: caseRow.timezone,
        custom_details: {
          title: caseRow.custom_details_title,
          location: caseRow.custom_details_location,
          description: caseRow.custom_details_description
        },
        case_note: caseRow.case_note,
        initiation_date: caseRow.initiation_date,
        case_number: caseRow.case_number
      };

    } catch (error) {
      console.error('Error finding case by ID:', error);
      throw new Error(`Error finding case by ID: ${error.message}`);
    }
  }

  // Get case assignees
  static async getCaseAssignees(caseId) {
    try {
      const query = `
        SELECT DISTINCT TRIM(dcu.user) as assignee
        FROM docket_cases_users dcu 
        WHERE dcu.case_id = ?
        GROUP BY TRIM(dcu.user)
      `;

      const [rows] = await pool.execute(query, [caseId]);
      
      // Additional deduplication in JavaScript
      const uniqueAssignees = [];
      const seen = new Set();
      
      for (const row of rows) {
        const assignee = row.assignee;
        if (!seen.has(assignee.toLowerCase())) {
          seen.add(assignee.toLowerCase());
          uniqueAssignees.push({ assignee: assignee });
        }
      }
      
      return uniqueAssignees;
    } catch (error) {
      console.error('Error getting case assignees:', error);
      return [];
    }
  }

  // Get case calendars
  static async getCaseCalendars(caseId) {
    try {
      const query = `
        SELECT DISTINCT 
          TRIM(dca.attendee) as calendar_email,
          TRIM(uc.userContactName) as calendar_name
        FROM docket_cases_attendees dca
        INNER JOIN usercontactupdate uc ON TRIM(uc.userContactEmail) = TRIM(dca.attendee)  
        WHERE dca.case_id = ? 
          AND dca.caselevel = 1 
          AND dca.triggerlevel IS NULL 
          AND dca.eventlevel IS NULL
        GROUP BY TRIM(dca.attendee), TRIM(uc.userContactName)
      `;

      const [rows] = await pool.execute(query, [caseId]);
      
      // Additional deduplication in JavaScript
      const uniqueCalendars = [];
      const seen = new Set();
      
      for (const row of rows) {
        const key = `${row.calendar_email.toLowerCase()}|${row.calendar_name.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueCalendars.push({
            calendar_email: row.calendar_email,
            calendar_name: row.calendar_name
          });
        }
      }
      
      return uniqueCalendars;
    } catch (error) {
      console.error('Error getting case calendars:', error);
      return [];
    }
  }

  // Get case dashboards (owners)
  static async getCaseDashboards(caseId, userId) {
    try {
      const query = `
        SELECT DISTINCT 
          TRIM(o.ownerdata) as dashboard_email,
          TRIM(uc.userContactName) as dashboard_name
        FROM owners o
        INNER JOIN usercontactupdate uc ON TRIM(uc.userContactEmail) = TRIM(o.ownerdata)
        WHERE o.case_id = ? 
          AND o.caselevel = 1 
          AND o.user_id = ?
        GROUP BY TRIM(o.ownerdata), TRIM(uc.userContactName)
      `;

      const [rows] = await pool.execute(query, [caseId, userId]);
      
      // Additional deduplication in JavaScript to ensure no duplicates
      const uniqueDashboards = [];
      const seen = new Set();
      
      for (const row of rows) {
        const key = `${row.dashboard_email.toLowerCase()}|${row.dashboard_name.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueDashboards.push({
            dashboard_email: row.dashboard_email,
            dashboard_name: row.dashboard_name
          });
        }
      }
      
      return uniqueDashboards;
    } catch (error) {
      console.error('Error getting case dashboards:', error);
      return [];
    }
  }
}

module.exports = Case; 