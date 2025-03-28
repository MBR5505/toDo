const { verifyToken } = require('../utils/jwtHelpers');

exports.isAuthenticated = (req, res, next) => {
  // Get token from cookies
  const token = req.cookies.token;
  
  if (!token) {
    return res.redirect('/auth/login');
  }
  
  // Verify token
  const decoded = verifyToken(token);
  if (!decoded) {
    // Clear invalid token
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
  
  // Set user in request
  req.user = decoded;
  next();
};
