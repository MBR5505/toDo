const User = require('../models/User');
const { generateToken } = require('../utils/jwtHelpers');

exports.getRegister = (req, res) => {
  res.render('pages/register');
};

exports.postRegister = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('pages/register', { 
        error: 'Username already exists', 
        username 
      });
    }
    
    // Create new user
    const user = new User({ username, password });
    await user.save();
    
    res.redirect('/auth/login');
  } catch (error) {
    console.error(error);
    res.render('pages/register', { 
      error: 'Error creating user', 
      username: req.body.username 
    });
  }
};

exports.getLogin = (req, res) => {
  res.render('pages/login');
};

exports.postLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('pages/login', { 
        error: 'Invalid username or password', 
        username 
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('pages/login', { 
        error: 'Invalid username or password', 
        username 
      });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Set token as cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.redirect('/todos');
  } catch (error) {
    console.error(error);
    res.render('pages/login', { 
      error: 'Error logging in', 
      username: req.body.username 
    });
  }
};

exports.logout = (req, res) => {
  // Clear JWT cookie
  res.clearCookie('token');
  res.redirect('/');
};
