const mongoose = require('mongoose');

/**
 * 系统日志模型
 * 用于记录用户操作和系统事件
 */
const systemLogSchema = new mongoose.Schema({
  // 操作用户ID
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // 系统操作可能没有关联用户
  },
  
  // 用户名（冗余存储，方便查询）
  username: {
    type: String,
    default: 'system'
  },
  
  // 操作类型
  actionType: {
    type: String,
    required: true,
    enum: ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'SYSTEM', 'ERROR', 'OTHER'],
  },
  
  // 操作模块
  module: {
    type: String,
    required: true,
    enum: ['AUTH', 'USER', 'TODO', 'NOTICE', 'SYSTEM', 'OTHER'],
  },
  
  // 操作描述
  description: {
    type: String,
    required: true,
  },
  
  // 操作结果
  status: {
    type: String,
    required: true,
    enum: ['SUCCESS', 'FAILURE', 'WARNING', 'INFO'],
    default: 'SUCCESS',
  },
  
  // IP地址
  ip: {
    type: String,
  },
  
  // 用户代理(浏览器信息)
  userAgent: {
    type: String,
  },
  
  // 详细数据（可选，用于存储操作的详细信息）
  details: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
});

// 索引设置，提高查询效率
systemLogSchema.index({ createdAt: -1 }); // 按创建时间倒序索引
systemLogSchema.index({ userId: 1, createdAt: -1 }); // 按用户ID和创建时间复合索引
systemLogSchema.index({ actionType: 1 }); // 按操作类型索引
systemLogSchema.index({ module: 1 }); // 按模块索引
systemLogSchema.index({ status: 1 }); // 按状态索引

const SystemLog = mongoose.model('SystemLog', systemLogSchema);

module.exports = SystemLog; 