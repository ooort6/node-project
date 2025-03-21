const mongoose = require('mongoose');
const User = require('./src/models/User');

async function resetAdminPassword() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/admin-system', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('已成功连接数据库');
    
    // 查找admin用户
    const adminUser = await User.findOne({ username: 'admin' });
    
    if (adminUser) {
      // 重置密码
      adminUser.password = 'admin123';
      await adminUser.save();
      console.log('已成功重置admin用户的密码为: admin123');
    } else {
      console.log('未找到admin用户，尝试查找任何一个具有管理员权限的用户');
      
      // 查找任何一个管理员用户
      const anyAdminUser = await User.findOne({ role: 'admin' });
      
      if (anyAdminUser) {
        anyAdminUser.password = 'admin123';
        await anyAdminUser.save();
        console.log(`已成功重置用户 ${anyAdminUser.username} 的密码为: admin123`);
      } else {
        console.log('未找到任何管理员用户');
      }
    }
  } catch (error) {
    console.error('发生错误:', error);
  } finally {
    // 断开数据库连接
    await mongoose.disconnect();
    console.log('已断开数据库连接');
  }
}

// 执行重置密码函数
resetAdminPassword(); 