const Joi = require('joi');

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  // Auth schemas
  login: Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  }),
  
  register: Joi.object({
    firstname: Joi.string().min(1).max(250).required(),
    lastname: Joi.string().min(1).max(250).required(),
    username: Joi.string().min(3).max(200).required(),
    password: Joi.string().min(6).required(),
    api_access: Joi.string().valid('yes', 'no').default('no')
  }),
  
  updateApiAccess: Joi.object({
    userId: Joi.number().integer().required(),
    access: Joi.string().valid('yes', 'no').required()
  }),
  
  // Case search schema
  caseSearch: Joi.object({
    caseName: Joi.string(),
    jurisdiction: Joi.string(),
    assignee: Joi.string(),
    timezone: Joi.string(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100)
  }),
  
  // Event search schema
  eventSearch: Joi.object({
    caseId: Joi.string(),
    eventName: Joi.string(),
    eventType: Joi.string(),
    jurisdiction: Joi.string(),
    triggerName: Joi.string(),
    fromDate: Joi.date().iso(),
    toDate: Joi.date().iso().min(Joi.ref('fromDate')),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100)
  })
};

module.exports = {
  validate,
  schemas
}; 