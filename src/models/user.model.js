const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Find user by username
  static async findByUsername(username) {
    console.log('Finding user with username:', username);
    const [rows] = await pool.execute(
      'SELECT id, username, userpassword, firstname, lastname, email FROM users WHERE username = ?',
      [username]
    );
    const user = rows[0];
    if (user) {
      console.log('Found user:', {
        ...user,
        userpassword: user.userpassword ? 'exists' : 'missing'
      });
    } else {
      console.log('No user found with username:', username);
    }
    return user;
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, firstname, lastname, email FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Create a new user
  static async create(userData) {
    const { firstname, lastname, username, password } = userData;
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const [result] = await pool.execute(
      'INSERT INTO users (firstname, lastname, username, userpassword) VALUES (?, ?, ?, ?)',
      [firstname, lastname, username, hashedPassword]
    );
    
    return {
      id: result.insertId,
      firstname,
      lastname,
      username
    };
  }

  // Validate user password
  static async validatePassword(user, password) {
    console.log('Validating password...');
    console.log('User object keys:', Object.keys(user));
    console.log('Password field exists:', !!user.userpassword);
    console.log('Stored password hash:', user.userpassword);
    console.log('Attempting to validate password:', password);
    
    if (!user.userpassword) {
      console.log('WARNING: userpassword field is missing or null');
      return false;
    }
    
    // Check if the stored password is already hashed
    const isHashed = user.userpassword.startsWith('$2b$') || user.userpassword.startsWith('$2a$');
    console.log('Is password hash in bcrypt format?', isHashed);

    try {
      if (!isHashed) {
        // If password is not hashed, compare directly
        console.log('WARNING: Stored password is not hashed, comparing directly');
        return password === user.userpassword;
      }

      // If password is hashed, use bcrypt
      const isValid = await bcrypt.compare(password, user.userpassword);
      console.log('bcrypt comparison result:', isValid);
      return isValid;
    } catch (error) {
      console.error('Password validation error:', error.message);
      console.error('Error details:', error);
      return false;
    }
  }
}

module.exports = User; 