const { pool } = require('../config/database');

class Case {
  // Get all cases with pagination
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      'SELECT * FROM docket_cases LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    // Get total count for pagination
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM docket_cases');
    const total = countResult[0].total;
    
    return {
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Get a specific case by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM docket_cases WHERE case_id = ?',
      [id]
    );
    return rows[0];
  }

  // Search cases by various parameters
  static async search(params) {
    let query = 'SELECT * FROM docket_cases WHERE 1=1';
    const queryParams = [];

    if (params.caseName) {
      query += ' AND case_matter LIKE ?';
      queryParams.push(`%${params.caseName}%`);
    }

    if (params.jurisdiction) {
      query += ' AND case_jurisdiction = ?';
      queryParams.push(params.jurisdiction);
    }

    if (params.assignee) {
      query += ' AND case_id IN (SELECT case_id FROM docket_cases_users WHERE user_id = ?)';
      queryParams.push(params.assignee);
    }

    if (params.timezone) {
      query += ' AND timezone = ?';
      queryParams.push(params.timezone);
    }

    // Add pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const offset = (page - 1) * limit;

    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    // Get total count for pagination
    let countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    countQuery = countQuery.substring(0, countQuery.indexOf('LIMIT'));

    const [rows] = await pool.execute(query, queryParams);
    const [countResult] = await pool.execute(countQuery, queryParams.slice(0, -2));
    const total = countResult[0].total;

    return {
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = Case; 