<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <el-menu
        :router="true"
        :default-active="$route.path"
        class="el-menu-vertical"
        background-color="#304156"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Monitor /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>

        <el-menu-item v-if="authStore.isAdmin" index="/dashboard/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/notices">
          <el-icon><Bell /></el-icon>
          <span>系统公告</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/todos">
          <el-icon><List /></el-icon>
          <span>待办事项</span>
        </el-menu-item>

        <el-menu-item index="/dashboard/profile">
          <el-icon><Setting /></el-icon>
          <span>个人设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-content">
          <div class="left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/dashboard' }"
                >首页</el-breadcrumb-item
              >
              <el-breadcrumb-item v-if="$route.name !== 'dashboard'">
                {{ getBreadcrumbTitle($route.name) }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="right">
            <el-dropdown trigger="click">
              <span class="user-dropdown">
                {{ authStore.user?.username }}
                <el-icon><CaretBottom /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/dashboard/profile')">
                    <el-icon><User /></el-icon>个人信息
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import {
  Monitor,
  User,
  Bell,
  List,
  Setting,
  CaretBottom,
  SwitchButton,
} from "@element-plus/icons-vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";

const router = useRouter();
const authStore = useAuthStore();

const getBreadcrumbTitle = (routeName) => {
  const routeMap = {
    users: "用户管理",
    notices: "系统公告",
    todos: "待办事项",
    profile: "个人设置",
  };
  return routeMap[routeName] || "";
};

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
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
}

.el-menu {
  border-right: none;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  padding: 0 20px;
}

.header-content {
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}

.el-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.el-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
