const mongoose = require('mongoose');

// 定义系统公告Schema
const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '标题不能为空'],
    trim: true,
    maxlength: [100, '标题不能超过100个字符']
  },
  content: {
    type: String,
    required: [true, '内容不能为空'],
    trim: true,
    maxlength: [2000, '内容不能超过2000个字符']
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'danger'],
    default: 'info'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 创建索引
noticeSchema.index({ date: -1 });
noticeSchema.index({ type: 1 });

// 定义模型方法
noticeSchema.methods = {
  // 转换为JSON时的处理
  toJSON: function() {
    const obj = this.toObject();
    obj.id = obj._id; // 将_id转换为id
    delete obj._id;
    delete obj.__v;
    return obj;
  }
};

// 注册模型
const Notice = mongoose.model('Notice', noticeSchema);

// 添加初始公告数据
const createInitialNotices = async () => {
  try {
    // 检查是否已经有公告数据
    const count = await Notice.countDocuments();
    if (count === 0) {
      console.log('初始化系统公告数据...');
      
      // 创建管理员用户ID（如果没有真实的管理员ID，先使用一个占位符）
      const adminId = new mongoose.Types.ObjectId();
      
      // 初始化公告数据
      const initialNotices = [
        {
          title: '系统上线通知',
          content: '系统正式上线啦！欢迎使用我们的后台管理系统',
          type: 'success',
          createdBy: adminId,
          date: new Date('2024-03-18')
        },
        {
          title: '功能更新通知',
          content: '新增了个人信息修改功能，用户现在可以在"个人设置"页面修改个人信息。',
          type: 'info',
          createdBy: adminId,
          date: new Date('2024-03-17')
        },
        {
          title: '系统维护通知',
          content: '本周日凌晨2-4点进行系统维护，期间系统可能暂时无法访问，请提前做好工作安排。',
          type: 'warning',
          createdBy: adminId,
          date: new Date('2024-03-16')
        }
      ];
      
      await Notice.insertMany(initialNotices);
      console.log('系统公告数据初始化完成！');
    }
  } catch (error) {
    console.error('初始化系统公告数据失败:', error);
  }
};

// 导出时执行初始化
setTimeout(createInitialNotices, 2000); // 延迟执行，确保数据库连接已建立

module.exports = Notice; 