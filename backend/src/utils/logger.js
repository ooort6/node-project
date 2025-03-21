const SystemLog = require('../models/SystemLog');

/**
 * 系统日志记录工具
 * 用于记录用户操作和系统事件
 */
class Logger {
  /**
   * 记录系统日志
   * @param {Object} logData - 日志数据
   * @param {mongoose.Schema.Types.ObjectId} [logData.userId] - 用户ID（可选）
   * @param {String} [logData.username] - 用户名（可选）
   * @param {String} logData.actionType - 操作类型：LOGIN|LOGOUT|CREATE|UPDATE|DELETE|SYSTEM|ERROR|OTHER
   * @param {String} logData.module - 操作模块：AUTH|USER|TODO|NOTICE|SYSTEM|OTHER
   * @param {String} logData.description - 操作描述
   * @param {String} [logData.status] - 操作结果：SUCCESS|FAILURE|WARNING|INFO，默认为SUCCESS
   * @param {String} [logData.ip] - IP地址（可选）
   * @param {String} [logData.userAgent] - 用户代理（可选）
   * @param {Object} [logData.details] - 详细数据（可选）
   * @returns {Promise<Object>} 创建的日志对象
   */
  static async log(logData) {
    try {
      const systemLog = new SystemLog(logData);
      await systemLog.save();
      return systemLog;
    } catch (error) {
      console.error('Logger error:', error);
      // 出错时不要抛出异常，避免影响主要业务流程
      return null;
    }
  }

  /**
   * 记录用户登录日志
   * @param {Object} req - Express请求对象
   * @param {Object} user - 用户对象
   * @param {Boolean} success - 登录是否成功
   * @param {String} [message] - 附加消息
   */
  static async logLogin(req, user, success, message = '') {
    const logData = {
      userId: user?._id,
      username: user?.username || 'unknown',
      actionType: 'LOGIN',
      module: 'AUTH',
      description: `用户${success ? '登录成功' : '登录失败'}${message ? ': ' + message : ''}`,
      status: success ? 'SUCCESS' : 'FAILURE',
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    return this.log(logData);
  }

  /**
   * 记录用户登出日志
   * @param {Object} req - Express请求对象
   * @param {Object} user - 用户对象
   */
  static async logLogout(req, user) {
    const logData = {
      userId: user?._id,
      username: user?.username || 'unknown',
      actionType: 'LOGOUT',
      module: 'AUTH',
      description: '用户登出系统',
      status: 'SUCCESS',
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    return this.log(logData);
  }

  /**
   * 记录数据操作日志
   * @param {Object} req - Express请求对象
   * @param {Object} user - 用户对象
   * @param {String} actionType - 操作类型：CREATE|UPDATE|DELETE
   * @param {String} module - 操作模块：USER|TODO|NOTICE|OTHER
   * @param {String} description - 操作描述
   * @param {Boolean} success - 操作是否成功
   * @param {Object} [details] - 详细数据（可选）
   */
  static async logAction(req, user, actionType, module, description, success, details = null) {
    const logData = {
      userId: user?._id,
      username: user?.username || 'unknown',
      actionType,
      module,
      description,
      status: success ? 'SUCCESS' : 'FAILURE',
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    if (details) {
      logData.details = details;
    }

    return this.log(logData);
  }

  /**
   * 记录系统错误日志
   * @param {Error} error - 错误对象
   * @param {String} [module] - 模块名称
   * @param {Object} [req] - Express请求对象（可选）
   * @param {Object} [user] - 用户对象（可选）
   */
  static async logError(error, module = 'SYSTEM', req = null, user = null) {
    const logData = {
      actionType: 'ERROR',
      module,
      description: `系统错误: ${error.message}`,
      status: 'FAILURE',
      details: {
        stack: error.stack,
        name: error.name,
        message: error.message
      }
    };

    if (req) {
      logData.ip = req.ip || req.connection.remoteAddress;
      logData.userAgent = req.headers['user-agent'];
    }

    if (user) {
      logData.userId = user._id;
      logData.username = user.username;
    }

    return this.log(logData);
  }
}

module.exports = Logger; 