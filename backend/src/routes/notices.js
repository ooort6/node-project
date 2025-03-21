const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const { auth, adminAuth } = require('../middleware/auth');

// 获取所有公告
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find()
      .sort({ date: -1 })
      .populate('createdBy', 'username'); // 关联用户信息
    
    // 转换数据格式，适配前端
    const formattedNotices = notices.map(notice => {
      const noticeObj = notice.toJSON();
      // 如果有createdBy用户信息，则提取用户名
      if (noticeObj.createdBy && typeof noticeObj.createdBy === 'object') {
        noticeObj.createdByName = noticeObj.createdBy.username;
      }
      // 格式化日期为字符串，方便前端显示
      noticeObj.date = new Date(noticeObj.date).toLocaleDateString('zh-CN');
      return noticeObj;
    });
    
    res.json({ code: 200, message: '获取公告成功', data: formattedNotices });
  } catch (error) {
    console.error('获取公告失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 获取单个公告
router.get('/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    
    if (!notice) {
      return res.status(404).json({ code: 404, message: '公告不存在' });
    }
    
    res.json({ code: 200, message: '获取公告成功', data: notice });
  } catch (error) {
    console.error('获取公告失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 创建公告（仅管理员）
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { title, content, type } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ code: 400, message: '标题和内容不能为空' });
    }
    
    const notice = new Notice({
      title,
      content,
      type: type || 'info',
      createdBy: req.user.userId,
      date: new Date()
    });
    
    await notice.save();
    
    // 获取完整的公告信息，包括用户名
    const savedNotice = await Notice.findById(notice._id)
      .populate('createdBy', 'username');
    
    const formattedNotice = savedNotice.toJSON();
    if (formattedNotice.createdBy && typeof formattedNotice.createdBy === 'object') {
      formattedNotice.createdByName = formattedNotice.createdBy.username;
    }
    formattedNotice.date = new Date(formattedNotice.date).toLocaleDateString('zh-CN');
    
    res.status(201).json({ code: 200, message: '创建公告成功', data: formattedNotice });
  } catch (error) {
    console.error('创建公告失败:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ code: 400, message: Object.values(error.errors).map(err => err.message).join(', ') });
    }
    
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 更新公告（仅管理员）
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { title, content, type } = req.body;
    const noticeId = req.params.id;
    
    // 查找公告
    const notice = await Notice.findById(noticeId);
    
    if (!notice) {
      return res.status(404).json({ code: 404, message: '公告不存在' });
    }
    
    // 更新字段
    notice.title = title || notice.title;
    notice.content = content || notice.content;
    notice.type = type || notice.type;
    
    await notice.save();
    
    res.json({ code: 200, message: '更新公告成功', data: notice });
  } catch (error) {
    console.error('更新公告失败:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ code: 400, message: Object.values(error.errors).map(err => err.message).join(', ') });
    }
    
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

// 删除公告（仅管理员）
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const noticeId = req.params.id;
    
    // 查找并删除公告
    const notice = await Notice.findByIdAndDelete(noticeId);
    
    if (!notice) {
      return res.status(404).json({ code: 404, message: '公告不存在' });
    }
    
    res.json({ code: 200, message: '删除公告成功' });
  } catch (error) {
    console.error('删除公告失败:', error);
    res.status(500).json({ code: 500, message: '服务器错误' });
  }
});

module.exports = router; 