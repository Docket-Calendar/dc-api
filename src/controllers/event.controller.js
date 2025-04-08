const Event = require('../models/event.model');

// Get all events with pagination
const getAllEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await Event.findAll(page, limit);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific event by ID
const getEventById = async (req, res, next) => {
  try {
    const eventId = req.params.id;
    const result = await Event.findById(eventId);
    
    if (!result) {
      res.status(404);
      throw new Error(`Event not found with id ${eventId}`);
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Get all events for a specific case
const getEventsByCaseId = async (req, res, next) => {
  try {
    const caseId = req.params.caseId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await Event.findByCaseId(caseId, page, limit);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// Search events by various parameters
const searchEvents = async (req, res, next) => {
  try {
    const searchParams = {
      caseId: req.query.caseId,
      eventName: req.query.eventName,
      eventType: req.query.eventType,
      jurisdiction: req.query.jurisdiction,
      triggerName: req.query.triggerName,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };
    
    const result = await Event.search(searchParams);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  getEventsByCaseId,
  searchEvents
}; 