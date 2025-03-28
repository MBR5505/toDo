const Todo = require('../models/Todo');
const { getWeekNumber, getStartAndEndOfWeek } = require('../utils/dateHelpers');

exports.getTodos = async (req, res) => {
  try {
    const now = new Date();
    const week = getWeekNumber(now);
    const year = now.getFullYear();
    
    return res.redirect(`/todos/week/${year}/${week}`);
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', { error: 'Error loading todos', user: req.user });
  }
};

exports.getWeek = async (req, res) => {
  try {
    const { year, week } = req.params;
    const { startDate, endDate } = getStartAndEndOfWeek(parseInt(year), parseInt(week));
    
    const todos = await Todo.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });
    
    res.render('pages/todos', {
      todos,
      currentWeek: parseInt(week),
      currentYear: parseInt(year),
      user: req.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', { error: 'Error loading todos for this week', user: req.user });
  }
};

exports.getUpcoming = async (req, res) => {
  try {
    const now = new Date();
    
    const todos = await Todo.find({
      user: req.user.id,
      date: { $gte: now }
    }).sort({ date: 1 });
    
    res.render('pages/upcoming', { todos, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', { error: 'Error loading upcoming todos', user: req.user });
  }
};

exports.getCreateTodo = (req, res) => {
  res.render('pages/createTodo', { user: req.user });
};

exports.postCreateTodo = async (req, res) => {
  try {
    const { title, description, date, time } = req.body;
    
    const todoDate = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[todoDate.getDay()];
    
    const weekInfo = getWeekNumber(todoDate);
    
    const todo = new Todo({
      title,
      description,
      date: todoDate,
      time,
      day,
      week: weekInfo,
      year: todoDate.getFullYear(),
      user: req.user.id
    });
    
    await todo.save();
    res.redirect('/todos');
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/createTodo', {
      error: 'Error creating todo',
      user: req.user,
      formData: req.body
    });
  }
};

exports.getEditTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!todo) {
      return res.status(404).render('pages/error', { error: 'Todo not found', user: req.user });
    }
    
    res.render('pages/editTodo', { todo, user: req.user });
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', { error: 'Error loading todo', user: req.user });
  }
};

exports.postEditTodo = async (req, res) => {
  try {
    const { title, description, date, time, completed } = req.body;
    
    const todoDate = new Date(date);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[todoDate.getDay()];
    
    const weekInfo = getWeekNumber(todoDate);
    
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      {
        title,
        description,
        date: todoDate,
        time,
        day,
        week: weekInfo,
        year: todoDate.getFullYear(),
        completed: completed === 'on' // Handle checkbox value
      },
      { new: true }
    );
    
    if (!todo) {
      return res.status(404).render('pages/error', { error: 'Todo not found', user: req.user });
    }
    
    res.redirect('/todos');
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', { error: 'Error updating todo', user: req.user });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.redirect('/todos');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting todo' });
  }
};

exports.toggleTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    todo.completed = !todo.completed;
    await todo.save();
    
    res.redirect('/todos');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error toggling todo status' });
  }
};
