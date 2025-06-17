const Event = require('../models/event.model');

class EventController {
  // Get all events for authenticated user
  static async getAllEvents(req, res) {
    try {
      // Get the authenticated user's ID from the token
      const userId = req.user.id;
      const events = await Event.findAll(userId);

      res.json({
        status: 'success',
        message: 'Events retrieved successfully',
        data: events,
        count: events.length
      });
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in getAllEvents:', error.message);
      }
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve events',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get a specific event by ID for authenticated user
  static async getEventById(req, res) {
    try {
      const eventId = parseInt(req.params.id);
      if (!eventId) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid event ID is required'
        });
      }

      // Get the authenticated user's ID from the token
      const userId = req.user.id;
      const eventData = await Event.findById(eventId, userId);
      
      if (!eventData) {
        return res.status(404).json({
          status: 'error',
          message: 'Event not found or you do not have access to this event'
        });
      }

      res.json({
        status: 'success',
        message: 'Event retrieved successfully',
        data: eventData
      });
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in getEventById:', error.message);
      }
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve event',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = EventController; 