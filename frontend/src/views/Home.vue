<template>
  <div class="home-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>欢迎使用后台管理系统</span>
        </div>
      </template>
      <div class="card-content">
        <h3>您好，{{ authStore.user?.username }}</h3>
        <p>
          您的角色是：{{
            authStore.user?.role === "admin" ? "管理员" : "普通用户"
          }}
        </p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-content {
  line-height: 1.8;
}
</style>
