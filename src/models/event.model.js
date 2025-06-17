const { pool } = require('../config/database');

class Event {
  constructor(data) {
    // Map API fields to actual database fields
    this.id = data.id;
    this.casename = data.casename;
    this.trigger_name = data.trigger_name;
    this.event_name = data.event_name;
    this.event_date = data.event_date;
    this.event_type = data.event_type;
    this.trigger_date = data.trigger_date;
    this.trigger_time = data.trigger_time;
    this.service_type = data.service_type;
    this.jurisdiction = data.jurisdiction;
    this.created_date = data.created_date;
  }

  // Get all events for a specific user
  static async findAll(userId) {
    try {
      // Main Event Information - using real case_events table with complex joins
      const query = `
        SELECT 
          ce.case_event_id,
          ce.eventName as event_subject,
          ce.event_date,
          ce.appointmentlength as appointment_length,
          ce.eventtype as event_type,
          ce.eventComment as custom_details_description,
          ce.eventSubject as custom_details_title,
          ce.eventLocation as custom_details_location,
          ce.courtRule as court_rule,
          ce.dateRule as date_rule,
          ce.eventTimezone,
          e.eventColor as color,
          idc.triggerItem as trigger_name,
          idc.trigger_date as trigger_date_time,
          idc.service_type,
          idc.serviceType as service_type_description,
          idc.jurisdiction,
          idc.created_on,
          dc.case_matter as case_name
        FROM case_events ce
        INNER JOIN events e ON e.eventIdvalue = ce.case_event_id
        INNER JOIN import_events ie ON ce.case_event_id = ie.import_event_id
        INNER JOIN import_docket_calculator idc ON ie.import_docket_id = idc.import_docket_id
        INNER JOIN docket_cases dc ON idc.case_id = dc.case_id
        WHERE dc.user_id = ?
        ORDER BY ce.event_date DESC
        LIMIT 50
      `;

      const [rows] = await pool.execute(query, [userId]);

      // Get assignees, calendars, dashboards, and categories for each event
      const eventsWithDetails = await Promise.all(rows.map(async (eventRow) => {
        const [assignees, calendars, dashboards, categories] = await Promise.all([
          this.getEventAssignees(eventRow.case_event_id),
          this.getEventCalendars(eventRow.case_event_id),
          this.getEventDashboards(eventRow.case_event_id, userId),
          this.getEventCategories(eventRow.case_event_id, userId)
        ]);

        return {
          id: eventRow.case_event_id,
          event_subject: eventRow.event_subject,
          event_date: eventRow.event_date,
          appointment_length: eventRow.appointment_length,
          event_type: eventRow.event_type,
          custom_details: {
            title: eventRow.custom_details_title,
            location: eventRow.custom_details_location,
            description: eventRow.custom_details_description
          },
          court_rule: eventRow.court_rule,
          date_rule: eventRow.date_rule,
          event_timezone: eventRow.eventTimezone,
          color: eventRow.color,
          trigger_name: eventRow.trigger_name,
          trigger_date_time: eventRow.trigger_date_time,
          service_type: eventRow.service_type,
          service_type_description: eventRow.service_type_description,
          jurisdiction: eventRow.jurisdiction,
          created_on: eventRow.created_on,
          case_name: eventRow.case_name,
          assignees: assignees,
          calendars: calendars,
          dashboards: dashboards,
          categories: categories
        };
      }));

      return eventsWithDetails;

    } catch (error) {
      console.error('Error finding events:', error);
      throw new Error(`Error finding events: ${error.message}`);
    }
  }

  // Find event by ID
  static async findById(id, userId) {
    try {
      // Main Event Information
      const query = `
        SELECT 
          ce.case_event_id,
          ce.eventName as event_subject,
          ce.event_date,
          ce.appointmentlength as appointment_length,
          ce.eventtype as event_type,
          ce.eventComment as custom_details_description,
          ce.eventSubject as custom_details_title,
          ce.eventLocation as custom_details_location,
          ce.courtRule as court_rule,
          ce.dateRule as date_rule,
          ce.eventTimezone,
          e.eventColor as color,
          idc.triggerItem as trigger_name,
          idc.trigger_date as trigger_date_time,
          idc.service_type,
          idc.serviceType as service_type_description,
          idc.jurisdiction,
          idc.created_on,
          dc.case_matter as case_name
        FROM case_events ce
        INNER JOIN events e ON e.eventIdvalue = ce.case_event_id
        INNER JOIN import_events ie ON ce.case_event_id = ie.import_event_id
        INNER JOIN import_docket_calculator idc ON ie.import_docket_id = idc.import_docket_id
        INNER JOIN docket_cases dc ON idc.case_id = dc.case_id
        WHERE ce.case_event_id = ? AND dc.user_id = ?
      `;

      const [rows] = await pool.execute(query, [id, userId]);

      if (rows.length === 0) {
        return null;
      }

      const eventRow = rows[0];

      // Get assignees, calendars, dashboards, and categories
      const [assignees, calendars, dashboards, categories] = await Promise.all([
        this.getEventAssignees(id),
        this.getEventCalendars(id),
        this.getEventDashboards(id, userId),
        this.getEventCategories(id, userId)
      ]);

      return {
        id: eventRow.case_event_id,
        event_subject: eventRow.event_subject,
        event_date: eventRow.event_date,
        appointment_length: eventRow.appointment_length,
        event_type: eventRow.event_type,
        custom_details: {
          title: eventRow.custom_details_title,
          location: eventRow.custom_details_location,
          description: eventRow.custom_details_description
        },
        court_rule: eventRow.court_rule,
        date_rule: eventRow.date_rule,
        event_timezone: eventRow.eventTimezone,
        color: eventRow.color,
        trigger_name: eventRow.trigger_name,
        trigger_date_time: eventRow.trigger_date_time,
        service_type: eventRow.service_type,
        service_type_description: eventRow.service_type_description,
        jurisdiction: eventRow.jurisdiction,
        created_on: eventRow.created_on,
        case_name: eventRow.case_name,
        assignees: assignees,
        calendars: calendars,
        dashboards: dashboards,
        categories: categories
      };

    } catch (error) {
      console.error('Error finding event by ID:', error);
      throw new Error(`Error finding event by ID: ${error.message}`);
    }
  }

  // Find events by case ID
  static async findByCaseId(caseId, userId) {
    try {
      // Events for a specific case
      const query = `
        SELECT 
          ce.case_event_id,
          ce.eventName as event_subject,
          ce.event_date,
          ce.appointmentlength as appointment_length,
          ce.eventtype as event_type,
          ce.eventComment as custom_details_description,
          ce.eventSubject as custom_details_title,
          ce.eventLocation as custom_details_location,
          ce.courtRule as court_rule,
          ce.dateRule as date_rule,
          ce.eventTimezone,
          e.eventColor as color,
          idc.triggerItem as trigger_name,
          idc.trigger_date as trigger_date_time,
          idc.service_type,
          idc.serviceType as service_type_description,
          idc.jurisdiction,
          idc.created_on,
          dc.case_matter as case_name
        FROM case_events ce
        INNER JOIN events e ON e.eventIdvalue = ce.case_event_id
        INNER JOIN import_events ie ON ce.case_event_id = ie.import_event_id
        INNER JOIN import_docket_calculator idc ON ie.import_docket_id = idc.import_docket_id
        INNER JOIN docket_cases dc ON idc.case_id = dc.case_id
        WHERE dc.case_id = ? AND dc.user_id = ?
        ORDER BY ce.event_date DESC
      `;

      const [rows] = await pool.execute(query, [caseId, userId]);

      // Get assignees, calendars, dashboards, and categories for each event
      const eventsWithDetails = await Promise.all(rows.map(async (eventRow) => {
        const [assignees, calendars, dashboards, categories] = await Promise.all([
          this.getEventAssignees(eventRow.case_event_id),
          this.getEventCalendars(eventRow.case_event_id),
          this.getEventDashboards(eventRow.case_event_id, userId),
          this.getEventCategories(eventRow.case_event_id, userId)
        ]);

        return {
          id: eventRow.case_event_id,
          event_subject: eventRow.event_subject,
          event_date: eventRow.event_date,
          appointment_length: eventRow.appointment_length,
          event_type: eventRow.event_type,
          custom_details: {
            title: eventRow.custom_details_title,
            location: eventRow.custom_details_location,
            description: eventRow.custom_details_description
          },
          court_rule: eventRow.court_rule,
          date_rule: eventRow.date_rule,
          event_timezone: eventRow.eventTimezone,
          color: eventRow.color,
          trigger_name: eventRow.trigger_name,
          trigger_date_time: eventRow.trigger_date_time,
          service_type: eventRow.service_type,
          service_type_description: eventRow.service_type_description,
          jurisdiction: eventRow.jurisdiction,
          created_on: eventRow.created_on,
          case_name: eventRow.case_name,
          assignees: assignees,
          calendars: calendars,
          dashboards: dashboards,
          categories: categories
        };
      }));

      return eventsWithDetails;

    } catch (error) {
      console.error('Error finding events by case ID:', error);
      throw new Error(`Error finding events by case ID: ${error.message}`);
    }
  }

  // Get event assignees
  static async getEventAssignees(eventId) {
    try {
      const query = `
        SELECT DISTINCT dca.attendee as assignee_email,
               uc.userContactName as assignee_name
        FROM docket_cases_attendees dca
        INNER JOIN usercontactupdate uc ON uc.userContactEmail = dca.attendee
        WHERE dca.eventid = ? 
          AND dca.eventlevel = 1
      `;

      const [rows] = await pool.execute(query, [eventId]);
      return rows.map(row => ({
        assignee_email: row.assignee_email,
        assignee_name: row.assignee_name
      }));
    } catch (error) {
      console.error('Error getting event assignees:', error);
      return [];
    }
  }

  // Get event calendars
  static async getEventCalendars(eventId) {
    try {
      const query = `
        SELECT sue.attendee as calendar_email,
               uc.userContactName as calendar_name
        FROM secondary_user_events sue
        INNER JOIN usercontactupdate uc ON uc.userContactEmail = sue.attendee
        WHERE sue.event_id = ? AND sue.attendee <> ''
      `;

      const [rows] = await pool.execute(query, [eventId]);
      return rows.map(row => ({
        calendar_email: row.calendar_email,
        calendar_name: row.calendar_name
      }));
    } catch (error) {
      console.error('Error getting event calendars:', error);
      return [];
    }
  }

  // Get event dashboards
  static async getEventDashboards(eventId, userId) {
    try {
      const query = `
        SELECT o.ownerdata as dashboard_email,
               uc.userContactName as dashboard_name
        FROM owners o
        INNER JOIN usercontactupdate uc ON uc.userContactEmail = o.ownerdata
        WHERE o.event_id = ? 
          AND o.eventlevel = 1 
          AND o.user_id = ?
      `;

      const [rows] = await pool.execute(query, [eventId, userId]);
      return rows.map(row => ({
        dashboard_email: row.dashboard_email,
        dashboard_name: row.dashboard_name
      }));
    } catch (error) {
      console.error('Error getting event dashboards:', error);
      return [];
    }
  }

  // Get event categories
  static async getEventCategories(eventId, userId) {
    try {
      const query = `
        SELECT sue.categories
        FROM secondary_user_events sue
        WHERE sue.event_id = ? 
          AND sue.userid = ?
      `;

      const [rows] = await pool.execute(query, [eventId, userId]);
      return rows.map(row => ({ categories: row.categories }));
    } catch (error) {
      console.error('Error getting event categories:', error);
      return [];
    }
  }
}

module.exports = Event; 