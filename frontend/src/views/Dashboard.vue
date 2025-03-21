<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
            </div>
          </template>
          <div class="user-info">
            <el-avatar :size="64" icon="UserFilled" />
            <h3>{{ authStore.user?.username }}</h3>
            <p>
              角色：{{
                authStore.user?.role === "admin" ? "管理员" : "普通用户"
              }}
            </p>
            <p>邮箱：{{ authStore.user?.email }}</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
            </div>
          </template>
          <div class="system-info">
            <p>当前时间：{{ currentTime }}</p>
            <p>系统版本：v1.0.0</p>
            <p>在线状态：<el-tag type="success">正常</el-tag></p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover" class="dashboard-card">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/profile')">
              <el-icon><User /></el-icon>
              个人信息
            </el-button>
            <el-button type="warning" @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>系统公告</span>
            </div>
          </template>
          <div class="notice-list">
            <el-timeline>
              <el-timeline-item
                v-for="(notice, index) in notices"
                :key="index"
                :timestamp="notice.date"
                :type="notice.type"
              >
                {{ notice.content }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
            </div>
          </template>
          <div class="todo-list">
            <el-checkbox-group v-model="checkedTodos">
              <div
                v-for="(todo, index) in todos"
                :key="index"
                class="todo-item"
              >
                <el-checkbox :label="todo">{{ todo }}</el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { User, SwitchButton } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

const router = useRouter();
const authStore = useAuthStore();

// 当前时间
const currentTime = ref(new Date().toLocaleString());
const timer = setInterval(() => {
  currentTime.value = new Date().toLocaleString();
}, 1000);

// 系统公告
const notices = ref([
  {
    content: "系统上线啦！欢迎使用我们的后台管理系统",
    date: "2024-03-18",
    type: "success",
  },
  {
    content: "新增了个人信息修改功能",
    date: "2024-03-17",
    type: "info",
  },
  {
    content: "系统维护通知：本周日凌晨2-4点进行系统维护",
    date: "2024-03-16",
    type: "warning",
  },
]);

// 待办事项
const todos = ref([
  "完善个人信息",
  "查看系统使用指南",
  "了解最新功能更新",
  "反馈系统使用体验",
]);
const checkedTodos = ref([]);

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    authStore.logout();
    router.push("/login");
  });
};

onMounted(() => {
  // 组件挂载时的逻辑
});

onUnmounted(() => {
  // 清除定时器
  clearInterval(timer);
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  text-align: center;
  line-height: 1.8;
}

.system-info {
  line-height: 2;
}

.quick-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.quick-actions .el-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.notice-list {
  padding: 10px;
}

.todo-list {
  .todo-item {
    margin-bottom: 10px;
  }
}

.el-timeline-item {
  padding-bottom: 20px;
}
</style>
