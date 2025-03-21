<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>登录</h2>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="submit-btn"
            @click="handleSubmit"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="form-footer">
          <router-link to="/register">没有账号？立即注册</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { ElMessage } from "element-plus";

const router = useRouter();
const authStore = useAuthStore();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  username: "",
  password: "",
});

const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const result = await authStore.login(form.username, form.password);
        if (result.success) {
          ElMessage.success("登录成功");
          router.push("/dashboard");
        } else {
          ElMessage.error(result.message);
        }
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.submit-btn {
  width: 100%;
}

.form-footer {
  text-align: center;
  margin-top: 16px;
}

.form-footer a {
  color: #409eff;
  text-decoration: none;
}

.form-footer a:hover {
  color: #66b1ff;
}
</style>
