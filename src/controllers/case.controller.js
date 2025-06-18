const Case = require('../models/case.model');

class CaseController {
  // Get all cases for authenticated user
  static async getAllCases(req, res) {
    try {
      // Get the authenticated user's ID from the token
      const userId = req.user.id;
      const cases = await Case.findAll(userId);

      res.json({
        status: 'success',
        message: 'Cases retrieved successfully',
        data: cases,
        count: cases.length
      });
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in getAllCases:', error.message);
      }
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve cases',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get a specific case by ID for authenticated user
  static async getCaseById(req, res) {
    try {
      const caseId = parseInt(req.params.id);
      if (!caseId) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid case ID is required'
        });
      }

      // Get the authenticated user's ID from the token
      const userId = req.user.id;
      const caseData = await Case.findById(caseId, userId);
      
      if (!caseData) {
        return res.status(404).json({
          status: 'error',
          message: 'Case not found or you do not have access to this case'
        });
      }

      res.json({
        status: 'success',
        message: 'Case retrieved successfully',
        data: caseData
      });
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in getCaseById:', error.message);
      }
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve case',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get all triggers for a specific case
  static async getCaseTriggers(req, res) {
    try {
      const caseId = parseInt(req.params.id);
      if (!caseId) {
        return res.status(400).json({
          status: 'error',
          message: 'Valid case ID is required'
        });
      }

      // Get the authenticated user's ID from the token
      const userId = req.user.id;
      
      // Use the optimized method to get triggers directly related to the case
      const Trigger = require('../models/trigger.model');
      const caseTriggers = await Trigger.findByCaseId(caseId, userId);

      // If no triggers found, it could mean case doesn't exist or no related triggers
      if (caseTriggers.length === 0) {
        // Check if case exists to provide better error message
        const Case = require('../models/case.model');
        const caseData = await Case.findById(caseId, userId);
        
        if (!caseData) {
          return res.status(404).json({
            status: 'error',
            message: 'Case not found or you do not have access to this case'
          });
        }
      }

      res.json({
        status: 'success',
        message: 'Triggers for case retrieved successfully',
        data: caseTriggers,
        count: caseTriggers.length
      });
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in getCaseTriggers:', error.message);
      }
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve triggers for case',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = CaseController; 