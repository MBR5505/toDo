const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { isAuthenticated } = require('../middlewares/auth');

// Apply authentication middleware to all todo routes
router.use(isAuthenticated);

// Get todo list page
router.get('/', todoController.getTodos);

// Handle week selection form submission
router.get('/week', (req, res) => {
  const { year, week } = req.query;
  res.redirect(`/todos/week/${year}/${week}`);
});

// Get specific week
router.get('/week/:year/:week', todoController.getWeek);

// Get all future todos
router.get('/upcoming', todoController.getUpcoming);

// Create new todo
router.get('/create', todoController.getCreateTodo);
router.post('/create', todoController.postCreateTodo);

// Update todo
router.get('/edit/:id', todoController.getEditTodo);
router.post('/edit/:id', todoController.postEditTodo);

// Delete todo
router.post('/delete/:id', todoController.deleteTodo);

// Toggle completion status
router.post('/toggle/:id', todoController.toggleTodo);

module.exports = router;
