<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><User /></el-icon>
              <span>用户数量</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ stats.userCount || 0 }}</h2>
            <p>系统注册用户总数</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><List /></el-icon>
              <span>待办事项</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ stats.todoCount || 0 }}</h2>
            <p>{{ completedPercent }}% 已完成</p>
            <el-progress
              :percentage="completedPercent"
              :status="progressStatus"
            ></el-progress>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Bell /></el-icon>
              <span>系统公告</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ stats.noticeCount || 0 }}</h2>
            <p>最近更新: {{ stats.lastNoticeTime || "无" }}</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Calendar /></el-icon>
              <span>今日日期</span>
            </div>
          </template>
          <div class="card-body">
            <h2>{{ currentDate }}</h2>
            <p>{{ greeting }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="mt-20">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近待办事项</span>
              <el-button type="text" @click="$router.push('/dashboard/todos')"
                >查看所有</el-button
              >
            </div>
          </template>
          <div v-if="recentTodos.length === 0" class="empty-data">
            <el-empty description="暂无待办事项"></el-empty>
          </div>
          <el-table v-else :data="recentTodos" style="width: 100%">
            <el-table-column prop="content" label="内容" width="300">
              <template #default="scope">
                <el-text
                  :type="scope.row.completed ? 'info' : ''"
                  :decoration="scope.row.completed ? 'line-through' : ''"
                >
                  {{ scope.row.content }}
                </el-text>
              </template>
            </el-table-column>
            <el-table-column prop="priority" label="优先级" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.priority" size="small">
                  {{ getPriorityLabel(scope.row.priority) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="completed" label="状态" width="100">
              <template #default="scope">
                <el-tag
                  :type="scope.row.completed ? 'success' : 'warning'"
                  size="small"
                >
                  {{ scope.row.completed ? "已完成" : "待完成" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="createTime"
              label="创建时间"
            ></el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近系统公告</span>
              <el-button type="text" @click="$router.push('/dashboard/notices')"
                >查看所有</el-button
              >
            </div>
          </template>
          <div v-if="recentNotices.length === 0" class="empty-data">
            <el-empty description="暂无系统公告"></el-empty>
          </div>
          <el-table v-else :data="recentNotices" style="width: 100%">
            <el-table-column
              prop="title"
              label="标题"
              width="300"
            ></el-table-column>
            <el-table-column prop="type" label="类型" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.type" size="small">
                  {{ getNoticeTypeLabel(scope.row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="date" label="发布时间"></el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { User, List, Bell, Calendar } from "@element-plus/icons-vue";
import { getTodos } from "../api/todo";
import { getNotices } from "../api/notice";
import axios from "axios";

// 统计数据
const stats = ref({
  userCount: 0,
  todoCount: 0,
  todoCompletedCount: 0,
  noticeCount: 0,
  lastNoticeTime: "",
});

// 最近数据
const recentTodos = ref([]);
const recentNotices = ref([]);

// 计算属性
const completedPercent = computed(() => {
  if (stats.value.todoCount === 0) return 0;
  return Math.round(
    (stats.value.todoCompletedCount / stats.value.todoCount) * 100
  );
});

const progressStatus = computed(() => {
  const percent = completedPercent.value;
  if (percent < 30) return "exception";
  if (percent < 70) return "warning";
  return "success";
});

const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
});

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return "凌晨好！";
  if (hour < 12) return "上午好！";
  if (hour < 14) return "中午好！";
  if (hour < 18) return "下午好！";
  return "晚上好！";
});

// 获取仪表盘数据
const fetchDashboardData = async () => {
  try {
    // 获取待办事项数据
    const todosResponse = await getTodos();
    const todos = todosResponse.data || [];
    recentTodos.value = todos.slice(0, 5); // 取最近5条

    stats.value.todoCount = todos.length;
    stats.value.todoCompletedCount = todos.filter(
      (todo) => todo.completed
    ).length;

    // 获取公告数据
    const noticesResponse = await getNotices();
    const notices = noticesResponse.data || [];
    recentNotices.value = notices.slice(0, 5); // 取最近5条

    stats.value.noticeCount = notices.length;
    if (notices.length > 0) {
      stats.value.lastNoticeTime = notices[0].date;
    }

    // 获取用户数量
    // 实际项目中可能需要一个单独的API接口来获取这些统计数据
    // 这里为了简化，假设有10个用户
    stats.value.userCount = 10;
  } catch (error) {
    console.error("获取仪表盘数据失败:", error);
  }
};

// 类型标签映射
const getPriorityLabel = (priority) => {
  const map = {
    info: "低",
    warning: "中",
    danger: "高",
  };
  return map[priority] || "未知";
};

const getNoticeTypeLabel = (type) => {
  const map = {
    info: "普通",
    success: "成功",
    warning: "警告",
    danger: "危险",
  };
  return map[type] || "普通";
};

// 在组件挂载时获取数据
onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-header .el-icon {
  margin-right: 8px;
}

.card-body {
  text-align: center;
  padding: 10px 0;
}

.card-body h2 {
  font-size: 24px;
  margin: 0 0 10px 0;
}

.card-body p {
  margin: 0;
  color: #909399;
}

.mt-20 {
  margin-top: 20px;
}

.empty-data {
  padding: 20px 0;
}
</style>
