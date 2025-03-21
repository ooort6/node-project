const Logger = require('../utils/logger');

/**
 * 请求日志记录中间件
 * 记录所有API请求的访问日志
 */
const requestLogger = (req, res, next) => {
  // 保存原始的end方法
  const originalEnd = res.end;
  
  // 记录请求开始时间
  const startTime = Date.now();
  
  // 重写end方法，在响应结束时记录日志
  res.end = function(chunk, encoding) {
    // 恢复原始的end方法
    res.end = originalEnd;
    
    // 调用原始的end方法
    res.end(chunk, encoding);
    
    // 计算请求处理时间
    const duration = Date.now() - startTime;
    
    // 从请求路径中提取操作模块
    const path = req.originalUrl || req.url;
    let module = 'OTHER';
    
    if (path.includes('/api/auth')) {
      module = 'AUTH';
    } else if (path.includes('/api/users')) {
      module = 'USER';
    } else if (path.includes('/api/todos')) {
      module = 'TODO';
    } else if (path.includes('/api/notices')) {
      module = 'NOTICE';
    } else if (path.includes('/api/logs')) {
      module = 'SYSTEM';
    }
    
    // 从请求方法中推断操作类型
    let actionType = 'OTHER';
    switch (req.method) {
      case 'GET':
        actionType = 'SYSTEM'; // 查询操作
        break;
      case 'POST':
        actionType = 'CREATE';
        break;
      case 'PUT':
      case 'PATCH':
        actionType = 'UPDATE';
        break;
      case 'DELETE':
        actionType = 'DELETE';
        break;
    }
    
    // 判断请求是否成功
    const success = res.statusCode >= 200 && res.statusCode < 400;
    
    // 构建日志描述
    const description = `${req.method} ${path} - ${res.statusCode} (${duration}ms)`;
    
    // 记录日志
    Logger.log({
      userId: req.user?._id,
      username: req.user?.username || 'guest',
      actionType,
      module,
      description,
      status: success ? 'SUCCESS' : 'FAILURE',
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      details: {
        method: req.method,
        path,
        query: req.query,
        statusCode: res.statusCode,
        duration,
        timestamp: new Date()
      }
    }).catch(error => {
      console.error('Failed to log request:', error);
    });
  };
  
  next();
};

/**
 * 错误日志记录中间件
 * 记录所有未捕获的异常
 */
const errorLogger = (err, req, res, next) => {
  // 记录错误日志
  Logger.logError(err, 'SYSTEM', req, req.user).catch(logErr => {
    console.error('Failed to log error:', logErr);
  });
  
  // 继续传递错误
  next(err);
};

module.exports = {
  requestLogger,
  errorLogger
}; 