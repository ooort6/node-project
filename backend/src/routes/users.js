const express = require('express');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// 获取用户列表（需要管理员权限）
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '获取用户列表失败', error: error.message });
  }
});

// 获取单个用户信息
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '获取用户信息失败', error: error.message });
  }
});

// 更新用户信息（需要管理员权限或本人）
router.put('/:id', auth, async (req, res) => {
  try {
    const { username, email, role } = req.body;
    
    // 检查权限
    if (req.user.role !== 'admin' && req.user.userId !== req.params.id) {
      return res.status(403).json({ message: '没有权限修改此用户信息' });
    }

    const updateData = { username, email };
    if (req.user.role === 'admin') {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '更新用户信息失败', error: error.message });
  }
});

// 删除用户（需要管理员权限）
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({ message: '用户删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除用户失败', error: error.message });
  }
});

module.exports = router; 