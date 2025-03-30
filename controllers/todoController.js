const Todo = require('../models/Todo');
const Group = require('../models/Group'); // Fixed missing closing parenthesis
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
    const parsedYear = parseInt(year);
    const parsedWeek = parseInt(week);
    
    // Try fetching both by date range and by week/year fields
    const todos = await Todo.find({
      user: req.user.id,
      $or: [
        { week: parsedWeek, year: parsedYear },
        { 
          date: { 
            $gte: getStartAndEndOfWeek(parsedYear, parsedWeek).startDate, 
            $lte: getStartAndEndOfWeek(parsedYear, parsedWeek).endDate 
          }
        }
      ]
    }).sort({ date: 1 });
    
    // For debugging
    console.log(`Found ${todos.length} todos for week ${week}, year ${year}`);
    if (todos.length > 0) {
      console.log('Sample todo:', {
        title: todos[0].title,
        day: todos[0].day,
        time: todos[0].time,
        date: todos[0].date,
        week: todos[0].week,
        year: todos[0].year
      });
    }
    
    res.render('pages/todos', {
      todos,
      currentWeek: parsedWeek,
      currentYear: parsedYear,
      user: req.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', { error: 'Error loading todos for this week', user: req.user });
  }
};

exports.getUpcoming = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // 10 groups per page
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || '';
    const sortBy = req.query.sortBy || 'group'; // Default sort by group
    const timeSort = req.query.timeSort || 'asc'; // Default ascending time sort
    
    // Find all user's todos (for statistics)
    const allTodos = await Todo.find({ user: req.user.id });
    
    // Calculate statistics
    const stats = {
      totalTodos: allTodos.length,
      completedTodos: allTodos.filter(todo => todo.completed).length,
      incompleteTodos: allTodos.filter(todo => !todo.completed).length
    };
    
    // Find all user's groups
    const allGroups = await Group.find({ user: req.user.id });
    stats.totalGroups = allGroups.length;
    
    let todos = [];
    let groups = [];
    let totalPages = 0;
    
    // Different queries based on sort type
    if (sortBy === 'todo') {
      // Sort by todos
      const todoQuery = { user: req.user.id };
      
      // Add search to query if provided
      if (searchQuery) {
        todoQuery.$or = [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } }
        ];
      }
      
      // Count for pagination
      const totalTodos = await Todo.countDocuments(todoQuery);
      totalPages = Math.ceil(totalTodos / limit);
      
      // Get todos with pagination
      todos = await Todo.find(todoQuery)
        .populate('group')
        .sort({ date: timeSort === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit);
    } else {
      // Sort by groups
      const groupQuery = { user: req.user.id };
      
      // Add search to query if provided
      if (searchQuery) {
        groupQuery.name = { $regex: searchQuery, $options: 'i' };
      }
      
      // Count groups + 1 for unassigned (for pagination)
      const totalGroupCount = await Group.countDocuments(groupQuery);
      totalPages = Math.ceil((totalGroupCount + 1) / limit); // +1 for unassigned group
      
      // Get groups with pagination
      groups = await Group.find(groupQuery)
        .skip(skip)
        .limit(limit);
      
      // Get all todos for these groups (including unassigned)
      const groupIds = groups.map(g => g._id);
      
      // Todos query based on search and groupIds
      const todosQuery = { 
        user: req.user.id,
        $or: [
          { group: { $in: groupIds } },
          { group: null } // Include unassigned todos
        ]
      };
      
      // Add title/description search if provided
      if (searchQuery) {
        todosQuery.$and = [
          {
            $or: [
              { title: { $regex: searchQuery, $options: 'i' } },
              { description: { $regex: searchQuery, $options: 'i' } }
            ]
          }
        ];
      }
      
      todos = await Todo.find(todosQuery).populate('group');
    }
    
    // Group todos by group
    const todosByGroup = {};
    
    // Add unassigned group first
    todosByGroup.unassigned = todos.filter(todo => !todo.group);
    
    // Add other groups
    todos.filter(todo => todo.group).forEach(todo => {
      const groupId = todo.group._id.toString();
      if (!todosByGroup[groupId]) {
        todosByGroup[groupId] = [];
      }
      todosByGroup[groupId].push(todo);
    });
    
    res.render('pages/upcoming', { 
      user: req.user,
      todos,
      groups,
      todosByGroup,
      stats,
      currentPage: page,
      totalPages,
      sortBy,
      timeSort,
      searchQuery
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', { error: 'Error loading upcoming todos', user: req.user });
  }
};

exports.getCreateTodo = async (req, res) => {
  try {
    // Get user groups
    const groups = await Group.find({ user: req.user.id });
    
    res.render('pages/createTodo', { 
      user: req.user,
      groups
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', { error: 'Error loading groups', user: req.user });
  }
};

exports.postCreateTodo = async (req, res) => {
  try {
    const { title, description, date, time, group } = req.body;
    
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
      user: req.user.id,
      group: group === 'none' ? null : group
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
    
    // Get user groups
    const groups = await Group.find({ user: req.user.id });
    
    res.render('pages/editTodo', { 
      todo, 
      user: req.user,
      groups
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', { error: 'Error loading todo', user: req.user });
  }
};

exports.postEditTodo = async (req, res) => {
  try {
    const { title, description, date, time, completed, group } = req.body;
    
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
        completed: completed === 'on',
        group: group === 'none' ? null : group
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
