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

      if (rows.length === 0) {
        return [];
      }

      // Extract all trigger IDs for batch queries
      const triggerIds = rows.map(row => row.import_docket_id);

      // Batch fetch all related data instead of individual queries
      const [assigneesData, calendarsData, dashboardsData] = await Promise.all([
        this.getBatchTriggerAssignees(triggerIds),
        this.getBatchTriggerCalendars(triggerIds),
        this.getBatchTriggerDashboards(triggerIds, userId)
      ]);

      // Group related data by trigger ID
      const assigneesByTrigger = this.groupByTriggerId(assigneesData);
      const calendarsByTrigger = this.groupByTriggerId(calendarsData);
      const dashboardsByTrigger = this.groupByTriggerId(dashboardsData);

      // Build final result
      return rows.map(triggerRow => ({
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
        assignees: assigneesByTrigger[triggerRow.import_docket_id] || [],
        calendars: calendarsByTrigger[triggerRow.import_docket_id] || [],
        dashboards: dashboardsByTrigger[triggerRow.import_docket_id] || []
      }));

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

  // Batch get trigger assignees for multiple triggers
  static async getBatchTriggerAssignees(triggerIds) {
    if (triggerIds.length === 0) return [];
    
    try {
      const placeholders = triggerIds.map(() => '?').join(',');
      const query = `
        SELECT dca.import_docket_id,
               dca.attendee as assignee_email,
               uc.userContactName as assignee_name
        FROM docket_cases_attendees dca
        INNER JOIN usercontactupdate uc ON uc.userContactEmail = dca.attendee
        WHERE dca.import_docket_id IN (${placeholders})
          AND dca.triggerlevel = 1 
          AND dca.eventlevel IS NULL
      `;

      const [rows] = await pool.execute(query, triggerIds);
      return rows;
    } catch (error) {
      console.error('Error getting batch trigger assignees:', error);
      return [];
    }
  }

  // Batch get trigger calendars for multiple triggers
  static async getBatchTriggerCalendars(triggerIds) {
    if (triggerIds.length === 0) return [];
    
    try {
      const placeholders = triggerIds.map(() => '?').join(',');
      const query = `
        SELECT dca.import_docket_id,
               dca.attendee as calendar_email,
               uc.userContactName as calendar_name
        FROM docket_cases_attendees dca
        INNER JOIN usercontactupdate uc ON uc.userContactEmail = dca.attendee
        WHERE dca.import_docket_id IN (${placeholders})
          AND dca.triggerlevel = 1
      `;

      const [rows] = await pool.execute(query, triggerIds);
      return rows;
    } catch (error) {
      console.error('Error getting batch trigger calendars:', error);
      return [];
    }
  }

  // Batch get trigger dashboards for multiple triggers
  static async getBatchTriggerDashboards(triggerIds, userId) {
    if (triggerIds.length === 0) return [];
    
    try {
      const placeholders = triggerIds.map(() => '?').join(',');
      const query = `
        SELECT o.importdocketid as import_docket_id,
               o.ownerdata as dashboard_email,
               uc.userContactName as dashboard_name
        FROM owners o
        INNER JOIN usercontactupdate uc ON uc.userContactEmail = o.ownerdata
        WHERE o.importdocketid IN (${placeholders})
          AND o.triggerlevel = 1 
          AND o.user_id = ?
      `;

      const [rows] = await pool.execute(query, [...triggerIds, userId]);
      return rows;
    } catch (error) {
      console.error('Error getting batch trigger dashboards:', error);
      return [];
    }
  }

  // Helper function to group results by trigger ID
  static groupByTriggerId(data) {
    const grouped = {};
    data.forEach(item => {
      const triggerId = item.import_docket_id;
      if (!grouped[triggerId]) {
        grouped[triggerId] = [];
      }
      // Remove the import_docket_id from the item before adding to group
      const { import_docket_id, ...itemData } = item;
      grouped[triggerId].push(itemData);
    });
    return grouped;
  }

  // Find triggers by case - much more efficient for case-specific queries
  static async findByCaseId(caseId, userId) {
    try {
      // Get case information first to get jurisdiction and assignees for matching
      const Case = require('./case.model');
      const caseData = await Case.findById(caseId, userId);
      
      if (!caseData) {
        return [];
      }

      // Build assignee emails list for matching
      const caseAssigneeEmails = caseData.assignees ? 
        caseData.assignees.map(a => a.assignee) : [];

      // Query triggers that match the case jurisdiction and have common assignees
      let query = `
        SELECT DISTINCT
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
        LEFT JOIN docket_cases_attendees dca ON idc.import_docket_id = dca.import_docket_id
        WHERE idc.user_id = ? 
          AND idc.jurisdiction = ?
      `;

      let queryParams = [userId, caseData.jurisdiction];

      // Add assignee matching if case has assignees
      if (caseAssigneeEmails.length > 0) {
        const placeholders = caseAssigneeEmails.map(() => '?').join(',');
        query += ` AND dca.attendee IN (${placeholders}) AND dca.triggerlevel = 1`;
        queryParams = queryParams.concat(caseAssigneeEmails);
      }

      query += `
        GROUP BY idc.import_docket_id, idc.triggerItem, idc.trigger_date, idc.trigger_time, 
                 idc.meridiem, idc.service_type, idc.serviceType, idc.jurisdiction, 
                 idc.jurisdesc, idc.created_on, dct.trigger_customtext, 
                 dct.case_subjecttext, dct.location
        ORDER BY idc.trigger_date DESC
        LIMIT 20
      `;

      const [rows] = await pool.execute(query, queryParams);

      if (rows.length === 0) {
        return [];
      }

      // Get related data efficiently
      const triggerIds = rows.map(row => row.import_docket_id);
      const [assigneesData, calendarsData, dashboardsData] = await Promise.all([
        this.getBatchTriggerAssignees(triggerIds),
        this.getBatchTriggerCalendars(triggerIds),
        this.getBatchTriggerDashboards(triggerIds, userId)
      ]);

      // Group related data by trigger ID
      const assigneesByTrigger = this.groupByTriggerId(assigneesData);
      const calendarsByTrigger = this.groupByTriggerId(calendarsData);
      const dashboardsByTrigger = this.groupByTriggerId(dashboardsData);

      // Build final result
      return rows.map(triggerRow => ({
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
        assignees: assigneesByTrigger[triggerRow.import_docket_id] || [],
        calendars: calendarsByTrigger[triggerRow.import_docket_id] || [],
        dashboards: dashboardsByTrigger[triggerRow.import_docket_id] || []
      }));

    } catch (error) {
      console.error('Error finding triggers by case ID:', error);
      throw new Error(`Error finding triggers by case ID: ${error.message}`);
    }
  }
}

module.exports = Trigger; 