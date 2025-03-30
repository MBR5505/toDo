const Group = require('../models/Group');
const Todo = require('../models/Todo');

// Get group creation page
exports.getCreateGroup = (req, res) => {
  res.render('pages/createGroup', { 
    user: req.user,
    colors: ['blue', 'green', 'purple', 'orange', 'teal', 'pink']
  });
};

// Create new group
exports.postCreateGroup = async (req, res) => {
  try {
    const { name, color } = req.body;
    
    const group = new Group({
      name,
      color,
      user: req.user.id
    });
    
    await group.save();
    
    res.redirect('/todos/upcoming');
  } catch (error) {
    console.error(error);
    res.render('pages/createGroup', { 
      error: 'Error creating group',
      user: req.user,
      formData: req.body,
      colors: ['blue', 'green', 'purple', 'orange', 'teal', 'pink']
    });
  }
};

// Get group edit page
exports.getEditGroup = async (req, res) => {
  try {
    const group = await Group.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!group) {
      return res.status(404).render('pages/error', { error: 'Group not found', user: req.user });
    }
    
    res.render('pages/editGroup', { 
      group, 
      user: req.user,
      colors: ['blue', 'green', 'purple', 'orange', 'teal', 'pink']
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', { error: 'Error loading group', user: req.user });
  }
};

// Update group
exports.postEditGroup = async (req, res) => {
  try {
    const { name, color } = req.body;
    
    const group = await Group.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name, color },
      { new: true }
    );
    
    if (!group) {
      return res.status(404).render('pages/error', { error: 'Group not found', user: req.user });
    }
    
    res.redirect('/todos/upcoming');
  } catch (error) {
    console.error(error);
    res.status(500).render('pages/error', { error: 'Error updating group', user: req.user });
  }
};

// Delete group
exports.deleteGroup = async (req, res) => {
  try {
    // Find the group
    const group = await Group.findOne({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Remove group association from todos
    await Todo.updateMany(
      { group: group._id },
      { $set: { group: null } }
    );
    
    // Delete the group
    await Group.deleteOne({ _id: group._id });
    
    res.redirect('/todos/upcoming');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting group' });
  }
};

// Add existing todo to group
exports.addTodoToGroup = async (req, res) => {
  try {
    const { todoId, groupId } = req.body;
    
    // Update todo with group
    const todo = await Todo.findOneAndUpdate(
      { _id: todoId, user: req.user.id },
      { group: groupId === 'none' ? null : groupId },
      { new: true }
    );
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.redirect('/todos/upcoming');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error adding todo to group' });
  }
};
