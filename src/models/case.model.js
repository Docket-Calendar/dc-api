const { pool } = require('../config/database');

class Case {
  // Get all cases with pagination
  static async findAll(page = 1, limit = 10) {
    try {
      console.log('Attempting to fetch cases with pagination:', { page, limit });
      
      // Ensure values are numbers
      const pageNum = Number(page);
      const limitNum = Number(limit);
      const offset = (pageNum - 1) * limitNum;
      
      // Use query directly with a string interpolated statement instead of parametrized query
      // This is generally not recommended due to SQL injection risks, but limit/offset are numeric
      // and we're ensuring they are numbers, so it should be safe in this specific case
      console.log(`Using direct query with LIMIT ${limitNum} OFFSET ${offset}`);
      
      const [rows] = await pool.query(
        `SELECT * FROM docket_cases LIMIT ${limitNum} OFFSET ${offset}`
      );
      
      console.log(`Successfully retrieved ${rows.length} cases`);
      
      // Get total count for pagination
      const [countResult] = await pool.query('SELECT COUNT(*) as total FROM docket_cases');
      const total = countResult[0].total;
      
      return {
        data: rows,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
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
      
      const caseId = Number(id);
      const [rows] = await pool.execute(
        'SELECT * FROM docket_cases WHERE case_id = ?',
        [caseId]
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
        queryParams.push(Number(params.jurisdiction));
      }

      if (params.assignee) {
        query += ' AND case_id IN (SELECT case_id FROM docket_cases_users WHERE user_id = ?)';
        queryParams.push(Number(params.assignee));
      }

      if (params.timezone) {
        query += ' AND casetimezone = ?';
        queryParams.push(Number(params.timezone));
      }

      // Add pagination - but don't use parameters for LIMIT/OFFSET
      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 10;
      const offset = (page - 1) * limit;

      // Get total count for pagination before adding LIMIT
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
      
      // Execute the count query
      const [countResult] = await pool.execute(countQuery, queryParams);
      const total = countResult[0].total;
      
      // Add LIMIT and OFFSET directly to the query string
      query += ` LIMIT ${limit} OFFSET ${offset}`;
      
      console.log('Executing query:', query);
      console.log('Query parameters:', queryParams);

      // Execute the main query
      const [rows] = await pool.execute(query, queryParams);
      
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