const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const groupController = require('../controllers/groupController');
const { isAuthenticated } = require('../middlewares/auth');
const Todo = require('../models/Todo');

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

// This route still exists but is now for server-side search (like when user refreshes)
router.get('/upcoming/search', todoController.getUpcoming);

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

// Group routes
router.get('/groups/create', groupController.getCreateGroup);
router.post('/groups/create', groupController.postCreateGroup);
router.get('/groups/edit/:id', groupController.getEditGroup);
router.post('/groups/edit/:id', groupController.postEditGroup);
router.post('/groups/delete/:id', groupController.deleteGroup);
router.post('/groups/add-todo', groupController.addTodoToGroup);

// Debug route to check todos in database - remove in production
router.get('/debug', isAuthenticated, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).populate('group').sort({ date: 1 });
    
    // Send back JSON of all todos for debugging
    res.json({
      count: todos.length,
      todos: todos.map(todo => ({
        id: todo._id,
        title: todo.title,
        day: todo.day,
        date: todo.date,
        time: todo.time,
        week: todo.week,
        year: todo.year,
        completed: todo.completed,
        group: todo.group ? { id: todo.group._id, name: todo.group.name, color: todo.group.color } : null
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos for debugging' });
  }
});

module.exports = router;
