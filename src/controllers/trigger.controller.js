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
}

module.exports = TriggerController; 