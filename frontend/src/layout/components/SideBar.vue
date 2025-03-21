<template>
  <div class="sidebar-container">
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      router
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
    >
      <div class="logo-container">
        <span class="logo-text">管理系统</span>
      </div>

      <el-menu-item index="/dashboard">
        <el-icon><Odometer /></el-icon>
        <span>系统概览</span>
      </el-menu-item>

      <el-menu-item index="/todos">
        <el-icon><List /></el-icon>
        <span>待办事项</span>
      </el-menu-item>

      <el-menu-item v-if="isAdmin" index="/notices">
        <el-icon><Bell /></el-icon>
        <span>系统公告</span>
      </el-menu-item>

      <el-menu-item index="/profile">
        <el-icon><User /></el-icon>
        <span>个人设置</span>
      </el-menu-item>

      <el-menu-item v-if="isAdmin" index="/logs">
        <el-icon><Document /></el-icon>
        <span>系统日志</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Odometer, List, Bell, User, Document } from "@element-plus/icons-vue";

const route = useRoute();
const authStore = useAuthStore();

// 当前激活的菜单项
const activeMenu = computed(() => {
  return route.path;
});

// 是否是管理员
const isAdmin = computed(() => {
  return authStore.user?.role === "admin";
});
</script>

<style scoped>
.sidebar-container {
  height: 100%;
  background-color: #304156;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

.logo-container {
  height: 60px;
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.logo-text {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.title {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.el-menu-item {
  display: flex;
  align-items: center;
}

.el-icon {
  margin-right: 5px;
}
</style>
