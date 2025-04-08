const Case = require('../models/case.model');

// Get all cases with pagination
const getAllCases = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await Case.findAll(page, limit);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific case by ID
const getCaseById = async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const result = await Case.findById(caseId);
    
    if (!result) {
      res.status(404);
      throw new Error(`Case not found with id ${caseId}`);
    }
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Search cases by various parameters
const searchCases = async (req, res, next) => {
  try {
    const searchParams = {
      caseName: req.query.caseName,
      jurisdiction: req.query.jurisdiction,
      assignee: req.query.assignee,
      timezone: req.query.timezone,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };
    
    const result = await Case.search(searchParams);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCases,
  getCaseById,
  searchCases
}; 