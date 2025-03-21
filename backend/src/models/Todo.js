const mongoose = require('mongoose');

// 定义待办事项Schema
const todoSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, '待办内容不能为空'],
    trim: true,
    maxlength: [500, '待办内容不能超过500个字符']
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['info', 'warning', 'danger'],
    default: 'info'
  },
  deadline: {
    type: Date,
    required: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createTime: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 创建待办事项索引
todoSchema.index({ userId: 1 });
todoSchema.index({ completed: 1 });
todoSchema.index({ priority: 1 });
todoSchema.index({ createTime: -1 });

// 定义模型方法
todoSchema.methods = {
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
const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo; 