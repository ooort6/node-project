const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const { auth } = require('../middleware/auth');

// 获取当前用户的所有待办事项
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.userId })
      .sort({ createTime: -1 });
    
    res.json({ code: 200, message: '获取待办事项成功', data: todos });
  } catch (error) {
    console.error('获取待办事项失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 创建新的待办事项
router.post('/', auth, async (req, res) => {
  try {
    const { content, priority, deadline } = req.body;
    
    if (!content) {
      return res.status(400).json({ code: 400, message: '待办内容不能为空' });
    }
    
    const todo = new Todo({
      content,
      priority: priority || 'info',
      deadline: deadline || null,
      userId: req.user.userId,
      completed: false,
      createTime: new Date()
    });
    
    await todo.save();
    
    res.status(201).json({ code: 200, message: '创建待办事项成功', data: todo });
  } catch (error) {
    console.error('创建待办事项失败:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ code: 400, message: Object.values(error.errors).map(err => err.message).join(', ') });
    }
    
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 更新待办事项
router.put('/:id', auth, async (req, res) => {
  try {
    const { content, priority, deadline } = req.body;
    const todoId = req.params.id;
    
    // 查找并确保是当前用户的待办事项
    const todo = await Todo.findOne({ _id: todoId, userId: req.user.userId });
    
    if (!todo) {
      return res.status(404).json({ code: 404, message: '待办事项不存在或无权限访问' });
    }
    
    // 更新字段
    todo.content = content || todo.content;
    todo.priority = priority || todo.priority;
    todo.deadline = deadline || todo.deadline;
    
    await todo.save();
    
    res.json({ code: 200, message: '更新待办事项成功', data: todo });
  } catch (error) {
    console.error('更新待办事项失败:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ code: 400, message: Object.values(error.errors).map(err => err.message).join(', ') });
    }
    
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 删除待办事项
router.delete('/:id', auth, async (req, res) => {
  try {
    const todoId = req.params.id;
    
    // 查找并确保是当前用户的待办事项
    const todo = await Todo.findOneAndDelete({ _id: todoId, userId: req.user.userId });
    
    if (!todo) {
      return res.status(404).json({ code: 404, message: '待办事项不存在或无权限访问' });
    }
    
    res.json({ code: 200, message: '删除待办事项成功' });
  } catch (error) {
    console.error('删除待办事项失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 更新待办事项状态
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { completed } = req.body;
    const todoId = req.params.id;
    
    if (completed === undefined) {
      return res.status(400).json({ code: 400, message: '缺少completed字段' });
    }
    
    // 查找并确保是当前用户的待办事项
    const todo = await Todo.findOne({ _id: todoId, userId: req.user.userId });
    
    if (!todo) {
      return res.status(404).json({ code: 404, message: '待办事项不存在或无权限访问' });
    }
    
    // 更新状态
    todo.completed = completed;
    await todo.save();
    
    res.json({ code: 200, message: '更新待办事项状态成功', data: todo });
  } catch (error) {
    console.error('更新待办事项状态失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router; 