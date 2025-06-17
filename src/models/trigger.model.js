const { pool } = require('../config/database');

class Trigger {
  constructor(data) {
    // Map extracted trigger data
    this.id = data.id;
    this.name = data.name;
    this.date_time = data.date_time;
    this.service_type = data.service_type;
    this.jurisdiction = data.jurisdiction;
    this.created_on = data.created_on;
    this.number_of_events = data.number_of_events || 0;
    this.custom_details = data.custom_details || {};
    this.assignees = data.assignees || [];
    this.calendars = data.calendars || [];
    this.dashboards = data.dashboards || [];
  }

  // Get all triggers for a specific user
  static async findAll(userId) {
    try {
      // Main Trigger Information - using real import_docket_calculator table
      const query = `
        SELECT 
          idc.import_docket_id,
          idc.triggerItem as trigger_name,
          idc.trigger_date,
          idc.trigger_time,
          idc.meridiem,
          idc.service_type,
          idc.serviceType as service_type_description,
          idc.jurisdiction,
          idc.jurisdesc as jurisdiction_description,
          idc.created_on,
          COUNT(ie.import_event_id) as number_of_events,
          dct.trigger_customtext as custom_details_description,
          dct.case_subjecttext as custom_details_title,
          dct.location as custom_details_location
        FROM import_docket_calculator idc
        LEFT JOIN import_events ie ON idc.import_docket_id = ie.import_docket_id
        LEFT JOIN docket_customtext dct ON idc.import_docket_id = dct.import_docket_id
        WHERE idc.user_id = ?
        GROUP BY idc.import_docket_id, idc.triggerItem, idc.trigger_date, idc.trigger_time, 
                 idc.meridiem, idc.service_type, idc.serviceType, idc.jurisdiction, 
                 idc.jurisdesc, idc.created_on, dct.trigger_customtext, 
                 dct.case_subjecttext, dct.location
        ORDER BY idc.trigger_date DESC
        LIMIT 50
      `;

      const [rows] = await pool.execute(query, [userId]);

      // Get assignees, calendars, and dashboards for each trigger
      const triggersWithDetails = await Promise.all(rows.map(async (triggerRow) => {
        const [assignees, calendars, dashboards] = await Promise.all([
          this.getTriggerAssignees(triggerRow.import_docket_id),
          this.getTriggerCalendars(triggerRow.import_docket_id),
          this.getTriggerDashboards(triggerRow.import_docket_id, userId)
        ]);

        return {
          id: triggerRow.import_docket_id,
          trigger_name: triggerRow.trigger_name,
          trigger_date: triggerRow.trigger_date,
          trigger_time: triggerRow.trigger_time,
          meridiem: triggerRow.meridiem,
          service_type: triggerRow.service_type,
          service_type_description: triggerRow.service_type_description,
          jurisdiction: triggerRow.jurisdiction,
          jurisdiction_description: triggerRow.jurisdiction_description,
          created_on: triggerRow.created_on,
          number_of_events: triggerRow.number_of_events,
          custom_details: {
            title: triggerRow.custom_details_title,
            location: triggerRow.custom_details_location,
            description: triggerRow.custom_details_description
          },
          assignees: assignees,
          calendars: calendars,
          dashboards: dashboards
        };
      }));

      return triggersWithDetails;

    } catch (error) {
      console.error('Error finding triggers:', error);
      throw new Error(`Error finding triggers: ${error.message}`);
    }
  }

  // Find trigger by ID for a specific user
  static async findById(id, userId) {
    try {
      // Main Trigger Information
      const query = `
        SELECT 
          idc.import_docket_id,
          idc.triggerItem as trigger_name,
          idc.trigger_date,
          idc.trigger_time,
          idc.meridiem,
          idc.service_type,
          idc.serviceType as service_type_description,
          idc.jurisdiction,
          idc.jurisdesc as jurisdiction_description,
          idc.created_on,
          COUNT(ie.import_event_id) as number_of_events,
          dct.trigger_customtext as custom_details_description,
          dct.case_subjecttext as custom_details_title,
          dct.location as custom_details_location
        FROM import_docket_calculator idc
        LEFT JOIN import_events ie ON idc.import_docket_id = ie.import_docket_id
        LEFT JOIN docket_customtext dct ON idc.import_docket_id = dct.import_docket_id
        WHERE idc.import_docket_id = ? AND idc.user_id = ?
        GROUP BY idc.import_docket_id, idc.triggerItem, idc.trigger_date, idc.trigger_time, 
                 idc.meridiem, idc.service_type, idc.serviceType, idc.jurisdiction, 
                 idc.jurisdesc, idc.created_on, dct.trigger_customtext, 
                 dct.case_subjecttext, dct.location
      `;

      const [rows] = await pool.execute(query, [id, userId]);

      if (rows.length === 0) {
        return null;
      }

      const triggerRow = rows[0];

      // Get assignees, calendars, and dashboards
      const [assignees, calendars, dashboards] = await Promise.all([
        this.getTriggerAssignees(id),
        this.getTriggerCalendars(id),
        this.getTriggerDashboards(id, userId)
      ]);

      return {
        id: triggerRow.import_docket_id,
        trigger_name: triggerRow.trigger_name,
        trigger_date: triggerRow.trigger_date,
        trigger_time: triggerRow.trigger_time,
        meridiem: triggerRow.meridiem,
        service_type: triggerRow.service_type,
        service_type_description: triggerRow.service_type_description,
        jurisdiction: triggerRow.jurisdiction,
        jurisdiction_description: triggerRow.jurisdiction_description,
        created_on: triggerRow.created_on,
        number_of_events: triggerRow.number_of_events,
        custom_details: {
          title: triggerRow.custom_details_title,
          location: triggerRow.custom_details_location,
          description: triggerRow.custom_details_description
        },
        assignees: assignees,
        calendars: calendars,
        dashboards: dashboards
      };

    } catch (error) {
      console.error('Error finding trigger by ID:', error);
      throw new Error(`Error finding trigger by ID: ${error.message}`);
    }
  }

  // Get trigger assignees
  static async getTriggerAssignees(importDocketId) {
    try {
      const query = `
        SELECT DISTINCT dca.attendee as assignee_email,
               uc.userContactName as assignee_name
        FROM docket_cases_attendees dca
        INNER JOIN usercontactupdate uc ON uc.userContactEmail = dca.attendee
        WHERE dca.import_docket_id = ? 
          AND dca.triggerlevel = 1 
          AND dca.eventlevel IS NULL
      `;

      const [rows] = await pool.execute(query, [importDocketId]);
      return rows.map(row => ({
        assignee_email: row.assignee_email,
        assignee_name: row.assignee_name
      }));
    } catch (error) {
      console.error('Error getting trigger assignees:', error);
      return [];
    }
  }

  // Get trigger calendars
  static async getTriggerCalendars(importDocketId) {
    try {
      const query = `
        SELECT DISTINCT dca.attendee as calendar_email,
               uc.userContactName as calendar_name
        FROM docket_cases_attendees dca
        INNER JOIN usercontactupdate uc ON uc.userContactEmail = dca.attendee
        WHERE dca.import_docket_id = ? 
          AND dca.triggerlevel = 1
      `;

      const [rows] = await pool.execute(query, [importDocketId]);
      return rows.map(row => ({
        calendar_email: row.calendar_email,
        calendar_name: row.calendar_name
      }));
    } catch (error) {
      console.error('Error getting trigger calendars:', error);
      return [];
    }
  }

  // Get trigger dashboards
  static async getTriggerDashboards(importDocketId, userId) {
    try {
      const query = `
        SELECT o.ownerdata as dashboard_email,
               uc.userContactName as dashboard_name
        FROM owners o
        INNER JOIN usercontactupdate uc ON uc.userContactEmail = o.ownerdata
        WHERE o.importdocketid = ? 
          AND o.triggerlevel = 1 
          AND o.user_id = ?
      `;

      const [rows] = await pool.execute(query, [importDocketId, userId]);
      return rows.map(row => ({
        dashboard_email: row.dashboard_email,
        dashboard_name: row.dashboard_name
      }));
    } catch (error) {
      console.error('Error getting trigger dashboards:', error);
      return [];
    }
  }
}

module.exports = Trigger; 