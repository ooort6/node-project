const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const todoRoutes = require('./routes/todos');
const noticeRoutes = require('./routes/notices');
const logRoutes = require('./routes/logs');

// 导入日志中间件
const { requestLogger, errorLogger } = require('./middleware/logger');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// MongoDB 连接配置
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // 超时时间设置为 5 秒
  socketTimeoutMS: 45000, // Socket 超时时间
  family: 4 // 强制使用 IPv4
};

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/admin-system', mongoOptions)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // 如果数据库连接失败，退出程序
  });

// 监听数据库连接事件
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// 添加请求日志中间件 - 所有请求都会记录日志
app.use(requestLogger);

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/logs', logRoutes);

// 添加错误日志中间件 - 捕获并记录所有未处理的异常
app.use(errorLogger);

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 