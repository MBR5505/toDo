const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/jwtHelpers');

// Home page
router.get('/', (req, res) => {
  // Check if user is authenticated via JWT
  const token = req.cookies.token;
  if (token) {
    const user = verifyToken(token);
    if (user) {
      return res.redirect('/todos');
    }
  }
  res.render('pages/home');
});

module.exports = router;
