const { pool } = require('../config/database');

class Case {
  // Get all cases with pagination
  static async findAll(page = 1, limit = 10) {
    try {
      console.log('Attempting to fetch cases with pagination:', { page, limit });
      
      const offset = (page - 1) * limit;
      const [rows] = await pool.execute(
        'SELECT * FROM docket_cases LIMIT ? OFFSET ?',
        [limit, offset]
      );
      
      console.log(`Successfully retrieved ${rows.length} cases`);
      
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
    } catch (error) {
      console.error('Error in Case.findAll:', error.message);
      console.error('Database connection details:', {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER
      });
      throw error; // Re-throw to be handled by the controller
    }
  }

  // Get a specific case by ID
  static async findById(id) {
    try {
      console.log('Attempting to fetch case by ID:', id);
      
      const [rows] = await pool.execute(
        'SELECT * FROM docket_cases WHERE case_id = ?',
        [id]
      );
      
      console.log(`Case fetch result: ${rows.length ? 'Found' : 'Not found'}`);
      return rows[0];
    } catch (error) {
      console.error(`Error in Case.findById for ID ${id}:`, error.message);
      throw error;
    }
  }

  // Search cases by various parameters
  static async search(params) {
    try {
      console.log('Searching cases with parameters:', params);
      
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

      console.log('Executing query:', query);
      console.log('Query parameters:', queryParams);

      // Get total count for pagination
      let countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
      countQuery = countQuery.substring(0, countQuery.indexOf('LIMIT'));

      const [rows] = await pool.execute(query, queryParams);
      const [countResult] = await pool.execute(countQuery, queryParams.slice(0, -2));
      const total = countResult[0].total;

      console.log(`Search returned ${rows.length} results out of ${total} total`);

      return {
        data: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in Case.search:', error.message);
      throw error;
    }
  }
}

module.exports = Case; 