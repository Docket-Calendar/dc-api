const { pool } = require('../config/database');

class Event {
  // Get all events with pagination
  static async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.execute(
      'SELECT * FROM case_events LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    // Get total count for pagination
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM case_events');
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

  // Get a specific event by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM case_events WHERE case_event_id = ?',
      [id]
    );
    return rows[0];
  }

  // Get all events for a specific case
  static async findByCaseId(caseId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [rows] = await pool.execute(
      'SELECT * FROM case_events WHERE case_id = ? LIMIT ? OFFSET ?',
      [caseId, limit, offset]
    );
    
    // Get total count for pagination
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM case_events WHERE case_id = ?',
      [caseId]
    );
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

  // Search events by various parameters
  static async search(params) {
    let query = 'SELECT * FROM case_events WHERE 1=1';
    const queryParams = [];

    if (params.caseId) {
      query += ' AND case_id = ?';
      queryParams.push(params.caseId);
    }

    if (params.eventName) {
      query += ' AND (eventName LIKE ? OR short_name LIKE ?)';
      queryParams.push(`%${params.eventName}%`, `%${params.eventName}%`);
    }

    if (params.eventType) {
      query += ' AND eventType = ?';
      queryParams.push(params.eventType);
    }

    if (params.jurisdiction) {
      query += ' AND case_id IN (SELECT case_id FROM docket_cases WHERE case_jurisdiction = ?)';
      queryParams.push(params.jurisdiction);
    }

    if (params.triggerName) {
      query += ' AND triggerType LIKE ?';
      queryParams.push(`%${params.triggerName}%`);
    }

    if (params.fromDate) {
      query += ' AND event_date >= ?';
      queryParams.push(params.fromDate);
    }

    if (params.toDate) {
      query += ' AND event_date <= ?';
      queryParams.push(params.toDate);
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

module.exports = Event; 