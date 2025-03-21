<template>
  <div class="app-wrapper">
    <div class="sidebar-wrapper">
      <SideBar />
    </div>

    <div class="main-container">
      <div class="header">
        <div class="breadcrumb">
          <span>{{ currentPageTitle }}</span>
        </div>
        <div class="user-info">
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="dropdown-link">
              <el-avatar :size="32" :src="userAvatar">
                {{ userInitials }}
              </el-avatar>
              <span class="username">{{ username }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人设置</el-dropdown-item>
                <el-dropdown-item divided command="logout"
                  >退出登录</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { ElMessageBox } from "element-plus";
import { ArrowDown } from "@element-plus/icons-vue";
import SideBar from "./components/SideBar.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 用户名
const username = computed(() => {
  return authStore.user?.username || "未登录";
});

// 用户头像
const userAvatar = computed(() => {
  return authStore.user?.avatar || "";
});

// 用户名首字母（用于没有头像时显示）
const userInitials = computed(() => {
  const name = authStore.user?.username || "";
  return name.charAt(0).toUpperCase();
});

// 当前页面标题
const currentPageTitle = computed(() => {
  return route.meta.title || "管理系统";
});

// 下拉菜单命令处理
const handleCommand = async (command) => {
  if (command === "profile") {
    router.push("/profile");
  } else if (command === "logout") {
    try {
      await ElMessageBox.confirm("确定要退出登录吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      });
      await authStore.logout();
      router.push("/login");
    } catch (error) {
      // 用户取消操作
    }
  }
};
</script>

<style scoped>
.app-wrapper {
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
}

.sidebar-wrapper {
  width: 210px;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1001;
  transition: all 0.3s;
}

.main-container {
  min-height: 100%;
  margin-left: 210px;
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.breadcrumb {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.user-info {
  display: flex;
  align-items: center;
}

.dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin: 0 5px;
  color: #606266;
}

.app-main {
  flex: 1;
  padding: 20px;
  background-color: #f0f2f5;
  overflow: auto;
}

/* 路由切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
