/**
 * Utility script to update a user's API token
 * 
 * Usage:
 * node src/utils/update-api-token.js <userId> [options]
 * 
 * Options:
 *   --generate   Generate a new token (default)
 *   --remove     Remove the token
 */

const { pool } = require('../config/database');
const { generateToken } = require('./token');

async function updateUserAPIToken(userId, options = { generate: true }) {
  try {
    // First check if the user exists
    const [userRows] = await pool.execute(
      'SELECT id, username FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      console.error(`User with ID ${userId} not found.`);
      return false;
    }

    const user = userRows[0];
    let token = null;
    let successMessage = '';

    if (options.generate) {
      // Generate a new token with user info
      token = generateToken({ 
        userId: user.id,
        username: user.username,
        type: 'api_access'
      }, '365d'); // 1 year expiration

      successMessage = `API token generated for user ${user.username} (ID: ${userId})`;
    } else if (options.remove) {
      // Token will remain null
      successMessage = `API token removed for user ${user.username} (ID: ${userId})`;
    }

    // Update the user's API token in the database
    await pool.execute(
      'UPDATE users SET api_access_token = ? WHERE id = ?',
      [token, userId]
    );

    console.log(successMessage);
    if (token) {
      console.log(`Token: ${token}`);
    }
    return true;
  } catch (error) {
    console.error('Error updating API token:', error.message);
    return false;
  } finally {
    // Close pool connection
    pool.end();
  }
}

// If script is run directly (not imported)
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node update-api-token.js <userId> [options]');
    console.error('Options:');
    console.error('  --generate   Generate a new token (default)');
    console.error('  --remove     Remove the token');
    process.exit(1);
  }

  const userId = args[0];
  const options = {
    generate: !args.includes('--remove'),
    remove: args.includes('--remove')
  };

  updateUserAPIToken(userId, options).then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { updateUserAPIToken }; 