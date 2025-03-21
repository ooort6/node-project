const express = require('express');
const router = express.Router();
const SystemLog = require('../models/SystemLog');
const { auth, adminAuth } = require('../middleware/auth');

/**
 * @route   GET /api/logs
 * @desc    获取系统日志列表（仅管理员可访问）
 * @access  Private/Admin
 */
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-createdAt',
      module,
      actionType,
      status,
      username,
      startDate,
      endDate
    } = req.query;

    // 构建查询条件
    const query = {};
    
    if (module) query.module = module;
    if (actionType) query.actionType = actionType;
    if (status) query.status = status;
    
    if (username) {
      query.username = { $regex: username, $options: 'i' };
    }
    
    // 日期范围查询
    if (startDate || endDate) {
      query.createdAt = {};
      
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // 计算总数
    const total = await SystemLog.countDocuments(query);
    
    // 解析排序参数
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith('-') ? -1 : 1;
    const sortOptions = { [sortField]: sortOrder };

    // 分页查询
    const logs = await SystemLog.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    return res.json({
      success: true,
      data: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        logs
      }
    });
  } catch (error) {
    console.error('获取日志列表失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，获取日志列表失败'
    });
  }
});

/**
 * @route   GET /api/logs/stats/overview
 * @desc    获取日志统计概览数据（仅管理员可访问）
 * @access  Private/Admin
 */
router.get('/stats/overview', [auth, adminAuth], async (req, res) => {
  try {
    // 获取今天的日期范围
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // 获取过去7天的日期范围
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 6);
    
    // 查询今日日志数量
    const todayCount = await SystemLog.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    
    // 查询总日志数量
    const totalCount = await SystemLog.countDocuments();
    
    // 查询错误日志数量
    const errorCount = await SystemLog.countDocuments({ 
      status: 'FAILURE' 
    });
    
    // 查询最近的操作类型统计
    const actionTypeCounts = await SystemLog.aggregate([
      { 
        $match: { 
          createdAt: { $gte: last7Days } 
        } 
      },
      { 
        $group: { 
          _id: '$actionType', 
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    // 查询最近7天每天的日志数量
    const dailyCounts = await SystemLog.aggregate([
      { 
        $match: { 
          createdAt: { $gte: last7Days } 
        } 
      },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } 
          },
          count: { $sum: 1 }
        }
      },
      { 
        $sort: { _id: 1 } 
      }
    ]);
    
    // 查询最近的模块访问统计
    const moduleCounts = await SystemLog.aggregate([
      { 
        $match: { 
          createdAt: { $gte: last7Days } 
        } 
      },
      { 
        $group: { 
          _id: '$module', 
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    return res.json({
      success: true,
      data: {
        todayCount,
        totalCount,
        errorCount,
        actionTypeCounts: actionTypeCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        dailyCounts: dailyCounts.map(item => ({
          date: item._id,
          count: item.count
        })),
        moduleCounts: moduleCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('获取日志统计概览失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，获取日志统计概览失败'
    });
  }
});

/**
 * @route   GET /api/logs/:id
 * @desc    获取单个日志详情（仅管理员可访问）
 * @access  Private/Admin
 */
router.get('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const log = await SystemLog.findById(req.params.id);
    
    if (!log) {
      return res.status(404).json({
        success: false,
        message: '日志记录不存在'
      });
    }
    
    return res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('获取日志详情失败:', error);
    return res.status(500).json({
      success: false, 
      message: '服务器错误，获取日志详情失败'
    });
  }
});

/**
 * @route   DELETE /api/logs/cleanup
 * @desc    清理过期日志（仅管理员可访问）
 * @access  Private/Admin
 */
router.delete('/cleanup', [auth, adminAuth], async (req, res) => {
  try {
    const { days = 90 } = req.query;
    
    // 计算截止日期
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    // 删除截止日期之前的日志
    const result = await SystemLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    return res.json({
      success: true,
      message: `成功清理 ${result.deletedCount} 条过期日志`,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('清理过期日志失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器错误，清理过期日志失败'
    });
  }
});

module.exports = router; 