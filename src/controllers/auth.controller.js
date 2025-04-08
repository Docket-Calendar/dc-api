const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { jwt: jwtConfig } = require('../config/server');

// Register a new user
const register = async (req, res, next) => {
  try {
    const { firstname, lastname, username, password, api_access } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      res.status(400);
      throw new Error('User already exists');
    }
    
    // Create a new user
    const user = await User.create({ firstname, lastname, username, password, api_access });
    
    // Generate JWT token
    const token = generateToken(user.id);
    
    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        api_access: user.api_access,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    // Check if user exists
    const user = await User.findByUsername(username);
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
      res.status(401);
      throw new Error('Invalid credentials (user not found)');
    }

    // Debug password check
    console.log('Attempting password validation...');
    console.log('Password from request exists:', !!password);

    // Validate password
    const isValid = await User.validatePassword(user, password);
    console.log('Password validation result:', isValid);
    
    if (!isValid) {
      res.status(401);
      throw new Error('Invalid credentials (password mismatch)');
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Prepare response based on API access
    const response = {
      success: true,
      data: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        api_access: user.api_access,
        token
      }
    };

    // Add warning if no API access
    if (user.api_access !== 'yes') {
      response.warning = 'Your account does not have API access. Some requests may be denied.';
    }

    console.log('Login successful for user:', user.username);
    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error.message);
    next(error);
  }
};

// Update user API access
const updateApiAccess = async (req, res, next) => {
  try {
    const { userId, access } = req.body;
    
    // Only admins can update API access
    if (req.user.user_level !== 'admin') {
      res.status(403);
      throw new Error('Only administrators can update API access');
    }
    
    // Update access
    await User.updateApiAccess(userId, access);
    
    res.status(200).json({
      success: true,
      message: `API access for user ${userId} updated to ${access}`
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn
  });
};

module.exports = {
  register,
  login,
  getMe,
  updateApiAccess
}; 