<template>
  <div class="todos-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>待办事项</span>
          <el-button type="primary" @click="handleAdd">添加待办</el-button>
        </div>
      </template>

      <!-- 加载状态 -->
      <el-skeleton :rows="3" animated v-if="loading" />

      <div v-else class="todo-list">
        <el-empty v-if="!todos.length" description="暂无待办事项" />
        <template v-else>
          <div v-for="todo in filteredTodos" :key="todo.id" class="todo-item">
            <el-card :class="{ completed: todo.completed }">
              <div class="todo-content">
                <el-checkbox
                  v-model="todo.completed"
                  @change="() => handleStatusChange(todo)"
                  :disabled="statusLoading[todo.id]"
                >
                  <span :class="{ completed: todo.completed }">
                    {{ todo.content }}
                  </span>
                </el-checkbox>
                <div class="todo-actions">
                  <el-tag size="small" :type="todo.priority">
                    {{ getPriorityLabel(todo.priority) }}
                  </el-tag>
                  <div class="action-buttons">
                    <el-button
                      type="primary"
                      link
                      @click="handleEdit(todo)"
                      :disabled="loading"
                    >
                      编辑
                    </el-button>
                    <el-button
                      type="danger"
                      link
                      @click="handleDelete(todo)"
                      :disabled="loading"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
              <div class="todo-meta">
                <span>创建时间：{{ formatDateTime(todo.createTime) }}</span>
                <span v-if="todo.deadline"
                  >截止时间：{{ formatDateTime(todo.deadline) }}</span
                >
              </div>
            </el-card>
          </div>
        </template>
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '添加待办' : '编辑待办'"
      width="50%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        :model="todoForm"
        :rules="rules"
        ref="formRef"
        label-width="80px"
        @submit.prevent
      >
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="todoForm.content"
            type="textarea"
            rows="3"
            placeholder="请输入待办事项内容"
            :disabled="submitLoading"
          />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select
            v-model="todoForm.priority"
            placeholder="请选择优先级"
            :disabled="submitLoading"
          >
            <el-option label="低" value="info" />
            <el-option label="中" value="warning" />
            <el-option label="高" value="danger" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止时间">
          <el-date-picker
            v-model="todoForm.deadline"
            type="datetime"
            placeholder="请选择截止时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled="submitLoading"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" :disabled="submitLoading">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            :loading="submitLoading"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  updateTodoStatus,
} from "../api/todo";

// 待办事项列表
const todos = ref([]);
const loading = ref(false);
const submitLoading = ref(false);
const statusLoading = ref({});
const formRef = ref(null);

// 表单验证规则
const rules = {
  content: [
    { required: true, message: "请输入待办事项内容", trigger: "blur" },
    {
      min: 1,
      max: 500,
      message: "内容长度在1到500个字符之间",
      trigger: "blur",
    },
  ],
  priority: [{ required: true, message: "请选择优先级", trigger: "change" }],
};

// 获取待办事项列表
const fetchTodos = async () => {
  loading.value = true;
  try {
    const { data } = await getTodos();
    todos.value = data;
  } catch (error) {
    ElMessage.error("获取待办事项列表失败");
  } finally {
    loading.value = false;
  }
};

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return "";
  const date = new Date(datetime);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 在组件挂载时获取数据
onMounted(() => {
  fetchTodos();
});

// 过滤后的待办事项（未完成的排在前面）
const filteredTodos = computed(() => {
  return [...todos.value].sort((a, b) => {
    if (a.completed === b.completed) {
      // 相同完成状态下，按优先级和创建时间排序
      const priorityOrder = { danger: 3, warning: 2, info: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createTime) - new Date(a.createTime);
    }
    return a.completed ? 1 : -1;
  });
});

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref("add");
const todoForm = ref({
  id: null,
  content: "",
  priority: "info",
  deadline: "",
});

// 获取优先级标签
const getPriorityLabel = (priority) => {
  const map = {
    info: "低",
    warning: "中",
    danger: "高",
  };
  return map[priority] || "低";
};

// 添加待办
const handleAdd = () => {
  dialogType.value = "add";
  todoForm.value = {
    id: null,
    content: "",
    priority: "info",
    deadline: "",
  };
  dialogVisible.value = true;
  // 重置表单验证
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 编辑待办
const handleEdit = (todo) => {
  dialogType.value = "edit";
  todoForm.value = { ...todo };
  dialogVisible.value = true;
  // 重置表单验证
  if (formRef.value) {
    formRef.value.resetFields();
  }
};

// 删除待办
const handleDelete = (todo) => {
  ElMessageBox.confirm("确定要删除这条待办事项吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    loading.value = true;
    try {
      await deleteTodo(todo.id);
      await fetchTodos(); // 重新获取列表
      ElMessage.success("删除成功");
    } catch (error) {
      ElMessage.error("删除失败");
    } finally {
      loading.value = false;
    }
  });
};

// 更改状态
const handleStatusChange = async (todo) => {
  statusLoading.value[todo.id] = true;
  try {
    await updateTodoStatus(todo.id, todo.completed);
    const message = todo.completed ? "已完成" : "已取消完成";
    ElMessage.success(message);
  } catch (error) {
    todo.completed = !todo.completed; // 恢复状态
    ElMessage.error("更新状态失败");
  } finally {
    statusLoading.value[todo.id] = false;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }

    submitLoading.value = true;
    try {
      if (dialogType.value === "add") {
        // 新增
        await createTodo({
          ...todoForm.value,
          completed: false,
        });
        ElMessage.success("添加成功");
      } else {
        // 编辑
        await updateTodo(todoForm.value.id, todoForm.value);
        ElMessage.success("更新成功");
      }
      await fetchTodos(); // 重新获取列表
      dialogVisible.value = false;
    } catch (error) {
      ElMessage.error(dialogType.value === "add" ? "添加失败" : "更新失败");
    } finally {
      submitLoading.value = false;
    }
  });
};
</script>

<style scoped>
.todos-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.todo-item .el-card {
  transition: all 0.3s;
}

.todo-item .el-card.completed {
  opacity: 0.6;
}

.todo-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.todo-content .completed {
  text-decoration: line-through;
  color: #999;
}

.todo-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.todo-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 20px;
}

:deep(.el-form-item__content) {
  flex-wrap: nowrap;
}
</style>
