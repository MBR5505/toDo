const jwt = require('jsonwebtoken');

// Generate token
exports.generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      username: user.username 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Verify token
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
