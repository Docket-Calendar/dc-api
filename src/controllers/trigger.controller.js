const Trigger = require('../models/trigger.model');

class TriggerController {
  // Get all triggers for authenticated user
  static async getAllTriggers(req, res) {
    try {
      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
      });

      // Get the authenticated user's ID from the token
      const userId = req.user?.id || 1; // Fallback for testing
      
      const triggersPromise = Trigger.findAll(userId);
      const triggers = await Promise.race([triggersPromise, timeoutPromise]);

      res.json({
        status: 'success',
        message: 'Triggers retrieved successfully',
        data: triggers,
        count: triggers.length
      });
    } catch (error) {
      console.error('Error in getAllTriggers:', error.message);
      console.error('Full error:', error);
      
      // Return appropriate error based on error type
      if (error.message.includes('timeout')) {
        return res.status(408).json({
          status: 'error',
          message: 'Request timeout - please try again',
          error: 'Request took too long to process'
        });
      }
      
      if (error.message.includes('ER_NO_SUCH_TABLE')) {
        return res.status(500).json({
          status: 'error',
          message: 'Database schema issue - triggers table not found',
          error: 'Database configuration error'
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve triggers',
        error: error.message
      });
    }
  }

  // Get a specific trigger by ID for authenticated user
  static async getTriggerById(req, res) {
    try {
      const triggerId = req.params.id;
      if (!triggerId) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid trigger ID is required'
        });
      }

      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
      });

      // Get the authenticated user's ID from the token
      const userId = req.user?.id || 1; // Fallback for testing
      
      const triggerPromise = Trigger.findById(triggerId, userId);
      const triggerData = await Promise.race([triggerPromise, timeoutPromise]);
      
      if (!triggerData) {
        return res.status(404).json({
          status: 'error',
          message: 'Trigger not found or you do not have access to this trigger'
        });
      }

      res.json({
        status: 'success',
        message: 'Trigger retrieved successfully',
        data: triggerData
      });
    } catch (error) {
      console.error('Error in getTriggerById:', error.message);
      console.error('Full error:', error);
      
      // Return appropriate error based on error type
      if (error.message.includes('timeout')) {
        return res.status(408).json({
          status: 'error',
          message: 'Request timeout - please try again',
          error: 'Request took too long to process'
        });
      }
      
      if (error.message.includes('ER_NO_SUCH_TABLE')) {
        return res.status(500).json({
          status: 'error',
          message: 'Database schema issue - triggers table not found',
          error: 'Database configuration error'
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve trigger',
        error: error.message
      });
    }
  }

  // Get all events generated by a specific trigger
  static async getTriggerEvents(req, res) {
    try {
      const triggerId = req.params.id;
      if (!triggerId) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid trigger ID is required'
        });
      }

      // Add timeout protection
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
      });

      // Get the authenticated user's ID from the token
      const userId = req.user?.id || 1; // Fallback for testing
      
      // First verify the trigger exists and user has access
      const triggerPromise = Trigger.findById(triggerId, userId);
      const triggerData = await Promise.race([triggerPromise, timeoutPromise]);
      
      if (!triggerData) {
        return res.status(404).json({
          status: 'error',
          message: 'Trigger not found or you do not have access to this trigger'
        });
      }

      // Get events directly linked to this trigger through import_docket_id
      // Use the proper database relationship instead of string matching
      const eventsQuery = `
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
        WHERE idc.import_docket_id = ? AND dc.user_id = ?
        ORDER BY ce.event_date DESC
      `;

      const { pool } = require('../config/database');
      const eventsPromise = pool.execute(eventsQuery, [triggerId, userId]);
      const [eventRows] = await Promise.race([eventsPromise, timeoutPromise]);

      // Get additional details for each event if any exist
      const Event = require('../models/event.model');
      const eventsWithDetails = await Promise.all(eventRows.map(async (eventRow) => {
        const [assignees, calendars, dashboards, categories] = await Promise.all([
          Event.getEventAssignees(eventRow.case_event_id),
          Event.getEventCalendars(eventRow.case_event_id),
          Event.getEventDashboards(eventRow.case_event_id, userId),
          Event.getEventCategories(eventRow.case_event_id, userId)
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

      res.json({
        status: 'success',
        message: 'Events for trigger retrieved successfully',
        data: eventsWithDetails,
        count: eventsWithDetails.length
      });
    } catch (error) {
      console.error('Error in getTriggerEvents:', error.message);
      console.error('Full error:', error);
      
      // Return appropriate error based on error type
      if (error.message.includes('timeout')) {
        return res.status(408).json({
          status: 'error',
          message: 'Request timeout - please try again',
          error: 'Request took too long to process'
        });
      }
      
      if (error.message.includes('ER_NO_SUCH_TABLE')) {
        return res.status(500).json({
          status: 'error',
          message: 'Database schema issue - events table not found',
          error: 'Database configuration error'
        });
      }

      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve events for trigger',
        error: error.message
      });
    }
  }
}

module.exports = TriggerController; 