<template>
  <div class="profile-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useUsersStore } from "../stores/users";
import { ElMessage } from "element-plus";

const authStore = useAuthStore();
const usersStore = useUsersStore();
const formRef = ref(null);
const loading = ref(false);

const form = reactive({
  username: "",
  email: "",
});

const rules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" },
  ],
  email: [
    { required: true, message: "请输入邮箱地址", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: "blur" },
  ],
};

onMounted(() => {
  // 初始化表单数据
  form.username = authStore.user?.username || "";
  form.email = authStore.user?.email || "";
});

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const result = await usersStore.updateUser(authStore.user.id, {
          username: form.username,
          email: form.email,
        });

        if (result.success) {
          ElMessage.success("更新成功");
          // 更新本地存储的用户信息
          authStore.user = {
            ...authStore.user,
            username: form.username,
            email: form.email,
          };
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
.profile-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
