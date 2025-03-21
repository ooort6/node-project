<template>
  <div class="users-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
        </div>
      </template>

      <el-table
        v-loading="usersStore.loading"
        :data="usersStore.users"
        style="width: 100%"
      >
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role" label="角色">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'success'">
              {{ row.role === "admin" ? "管理员" : "普通用户" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑用户对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑用户" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useUsersStore } from "../stores/users";
import { ElMessage, ElMessageBox } from "element-plus";

const usersStore = useUsersStore();
const dialogVisible = ref(false);
const formRef = ref(null);
const currentUserId = ref(null);

const form = reactive({
  username: "",
  email: "",
  role: "",
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
  role: [{ required: true, message: "请选择角色", trigger: "change" }],
};

onMounted(() => {
  usersStore.fetchUsers();
});

const handleEdit = (row) => {
  currentUserId.value = row.id;
  form.username = row.username;
  form.email = row.email;
  form.role = row.role;
  dialogVisible.value = true;
};

const handleDelete = (row) => {
  ElMessageBox.confirm("确定要删除该用户吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      const result = await usersStore.deleteUser(row.id);
      if (result.success) {
        ElMessage.success("删除成功");
      } else {
        ElMessage.error(result.message);
      }
    })
    .catch(() => {});
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      const result = await usersStore.updateUser(currentUserId.value, {
        username: form.username,
        email: form.email,
        role: form.role,
      });

      if (result.success) {
        ElMessage.success("更新成功");
        dialogVisible.value = false;
      } else {
        ElMessage.error(result.message);
      }
    }
  });
};
</script>

<style scoped>
.users-container {
  min-height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
