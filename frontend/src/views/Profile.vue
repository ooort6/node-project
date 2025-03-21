<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
            </div>
          </template>
          <div class="user-info">
            <div class="avatar-container">
              <el-avatar
                :size="100"
                :src="userInfo.avatar"
                @error="avatarError"
              >
                <el-icon><User /></el-icon>
              </el-avatar>
              <el-upload
                class="avatar-uploader"
                action="#"
                :http-request="uploadAvatar"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                accept="image/*"
              >
                <el-button size="small" type="primary" class="upload-btn">
                  更换头像
                </el-button>
              </el-upload>
            </div>

            <div class="info-item">
              <label>用户名：</label>
              <span>{{ userInfo.username }}</span>
            </div>

            <div class="info-item">
              <label>邮箱：</label>
              <span>{{ userInfo.email }}</span>
            </div>

            <div class="info-item">
              <label>角色：</label>
              <el-tag :type="userInfo.role === 'admin' ? 'danger' : 'success'">
                {{ userInfo.role === "admin" ? "管理员" : "普通用户" }}
              </el-tag>
            </div>

            <div class="info-item">
              <label>注册时间：</label>
              <span>{{ userInfo.createdAt || "未知" }}</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息设置" name="basic">
            <el-card shadow="hover">
              <el-form
                ref="basicFormRef"
                :model="basicForm"
                :rules="basicRules"
                label-width="120px"
              >
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="basicForm.username" />
                </el-form-item>

                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="basicForm.email" />
                </el-form-item>

                <el-form-item label="个人简介" prop="bio">
                  <el-input
                    v-model="basicForm.bio"
                    type="textarea"
                    rows="4"
                    placeholder="请输入个人简介"
                  />
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    @click="updateBasicInfo"
                    :loading="basicLoading"
                  >
                    保存修改
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-tab-pane>

          <el-tab-pane label="修改密码" name="password">
            <el-card shadow="hover">
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-width="120px"
              >
                <el-form-item label="当前密码" prop="currentPassword">
                  <el-input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    placeholder="请输入当前密码"
                    show-password
                  />
                </el-form-item>

                <el-form-item label="新密码" prop="newPassword">
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    placeholder="请输入新密码"
                    show-password
                  />
                </el-form-item>

                <el-form-item label="确认新密码" prop="confirmPassword">
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
                    show-password
                  />
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    @click="updatePassword"
                    :loading="passwordLoading"
                  >
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-tab-pane>

          <el-tab-pane label="消息通知设置" name="notification">
            <el-card shadow="hover">
              <el-form label-width="180px">
                <el-form-item label="系统公告通知">
                  <el-switch v-model="notificationSettings.system" />
                </el-form-item>

                <el-form-item label="待办事项提醒">
                  <el-switch v-model="notificationSettings.todo" />
                </el-form-item>

                <el-form-item label="接收邮件通知">
                  <el-switch v-model="notificationSettings.email" />
                </el-form-item>

                <el-form-item>
                  <el-button
                    type="primary"
                    @click="updateNotificationSettings"
                    :loading="notificationLoading"
                  >
                    保存设置
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { ElMessage } from "element-plus";
import { User } from "@element-plus/icons-vue";
import axios from "axios";

const authStore = useAuthStore();
const activeTab = ref("basic");

// 用户信息
const userInfo = ref({
  username: "",
  email: "",
  role: "",
  avatar: "",
  createdAt: "",
  bio: "",
});

// 加载状态
const basicLoading = ref(false);
const passwordLoading = ref(false);
const notificationLoading = ref(false);

// 表单引用
const basicFormRef = ref(null);
const passwordFormRef = ref(null);

// 基本信息表单
const basicForm = ref({
  username: "",
  email: "",
  bio: "",
});

// 密码表单
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 通知设置
const notificationSettings = ref({
  system: true,
  todo: true,
  email: false,
});

// 表单验证规则
const basicRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱地址", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
  bio: [{ max: 200, message: "个人简介不能超过200个字符", trigger: "blur" }],
};

const passwordRules = {
  currentPassword: [
    { required: true, message: "请输入当前密码", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能小于6个字符", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error("两次输入密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    // 这里应该调用API获取详细用户信息
    // 目前使用store中的用户信息
    const user = authStore.user;

    userInfo.value = {
      username: user.username,
      email: user.email,
      role: user.role || "user",
      avatar: user.avatar || "",
      createdAt: new Date().toLocaleDateString("zh-CN"),
      bio: user.bio || "这个用户很懒，还没有填写个人简介",
    };

    // 初始化表单数据
    basicForm.value = {
      username: userInfo.value.username,
      email: userInfo.value.email,
      bio: userInfo.value.bio,
    };
  } catch (error) {
    ElMessage.error("获取用户信息失败");
  }
};

// 头像上传相关方法
const avatarError = () => {
  // 头像加载失败时显示默认头像
  userInfo.value.avatar = "";
};

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error("上传头像图片只能是图片格式!");
    return false;
  }

  if (!isLt2M) {
    ElMessage.error("上传头像图片大小不能超过 2MB!");
    return false;
  }

  return true;
};

const uploadAvatar = async (options) => {
  try {
    // 在实际项目中，这里应该调用API上传文件
    // 示例代码：
    // const formData = new FormData();
    // formData.append('avatar', options.file);
    // const response = await axios.post('/api/users/avatar', formData);
    // userInfo.value.avatar = response.data.avatarUrl;

    // 假设上传成功，使用本地预览
    const reader = new FileReader();
    reader.readAsDataURL(options.file);
    reader.onload = () => {
      userInfo.value.avatar = reader.result;
    };

    ElMessage.success("头像上传成功");
  } catch (error) {
    ElMessage.error("头像上传失败");
  }
};

// 更新基本信息
const updateBasicInfo = async () => {
  if (!basicFormRef.value) return;

  await basicFormRef.value.validate(async (valid) => {
    if (!valid) return;

    basicLoading.value = true;
    try {
      // 在实际项目中，这里应该调用API更新用户信息
      // 示例代码：
      // await axios.put('/api/users/profile', basicForm.value);

      // 更新本地状态
      userInfo.value.username = basicForm.value.username;
      userInfo.value.email = basicForm.value.email;
      userInfo.value.bio = basicForm.value.bio;

      // 更新authStore中的用户信息
      authStore.updateUser({
        ...authStore.user,
        username: basicForm.value.username,
        email: basicForm.value.email,
        bio: basicForm.value.bio,
      });

      ElMessage.success("个人信息更新成功");
    } catch (error) {
      ElMessage.error("个人信息更新失败");
    } finally {
      basicLoading.value = false;
    }
  });
};

// 更新密码
const updatePassword = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return;

    passwordLoading.value = true;
    try {
      // 调用API更新密码
      await axios.put(`/users/password/${authStore.user.id}`, {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
      });

      ElMessage.success("密码修改成功");
      // 清空表单
      passwordForm.value = {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
    } catch (error) {
      console.error("密码修改失败:", error);
      let errorMsg = "密码修改失败";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMsg = error.response.data.message;
      }
      ElMessage.error(errorMsg);
    } finally {
      passwordLoading.value = false;
    }
  });
};

// 更新通知设置
const updateNotificationSettings = async () => {
  notificationLoading.value = true;
  try {
    // 在实际项目中，这里应该调用API更新通知设置
    // 示例代码：
    // await axios.put('/api/users/notification-settings', notificationSettings.value);

    ElMessage.success("通知设置更新成功");
  } catch (error) {
    ElMessage.error("通知设置更新失败");
  } finally {
    notificationLoading.value = false;
  }
};

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  text-align: center;
  padding: 10px 0;
}

.avatar-container {
  margin-bottom: 20px;
}

.upload-btn {
  margin-top: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: bold;
  color: #606266;
}

.el-tabs {
  margin-top: 20px;
}

.el-form {
  max-width: 500px;
  margin: 0 auto;
}
</style>
