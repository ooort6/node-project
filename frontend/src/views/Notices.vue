<template>
  <div class="notices-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统公告</span>
          <el-button v-if="authStore.isAdmin" type="primary" @click="handleAdd">
            发布公告
          </el-button>
        </div>
      </template>

      <el-timeline>
        <el-timeline-item
          v-for="notice in notices"
          :key="notice.id"
          :timestamp="notice.date"
          :type="notice.type"
        >
          <el-card class="notice-card">
            <template #header>
              <div class="notice-header">
                <h4>{{ notice.title }}</h4>
                <div v-if="authStore.isAdmin" class="notice-actions">
                  <el-button type="primary" link @click="handleEdit(notice)">
                    编辑
                  </el-button>
                  <el-button type="danger" link @click="handleDelete(notice)">
                    删除
                  </el-button>
                </div>
              </div>
            </template>
            <p>{{ notice.content }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '发布公告' : '编辑公告'"
      width="50%"
    >
      <el-form :model="noticeForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="noticeForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="noticeForm.content"
            type="textarea"
            rows="4"
            placeholder="请输入公告内容"
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="noticeForm.type" placeholder="请选择公告类型">
            <el-option label="普通" value="info" />
            <el-option label="成功" value="success" />
            <el-option label="警告" value="warning" />
            <el-option label="危险" value="danger" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from "../api/notice";

const authStore = useAuthStore();

// 公告列表数据
const notices = ref([]);

// 获取公告列表
const fetchNotices = async () => {
  try {
    const { data } = await getNotices();
    notices.value = data;
  } catch (error) {
    ElMessage.error("获取公告列表失败");
  }
};

// 在组件挂载时获取数据
onMounted(() => {
  fetchNotices();
});

// 对话框相关
const dialogVisible = ref(false);
const dialogType = ref("add");
const noticeForm = ref({
  id: null,
  title: "",
  content: "",
  type: "info",
});

// 新增公告
const handleAdd = () => {
  dialogType.value = "add";
  noticeForm.value = {
    id: null,
    title: "",
    content: "",
    type: "info",
  };
  dialogVisible.value = true;
};

// 编辑公告
const handleEdit = (notice) => {
  dialogType.value = "edit";
  noticeForm.value = { ...notice };
  dialogVisible.value = true;
};

// 删除公告
const handleDelete = (notice) => {
  ElMessageBox.confirm("确定要删除这条公告吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    try {
      await deleteNotice(notice.id);
      await fetchNotices(); // 重新获取列表
      ElMessage.success("删除成功");
    } catch (error) {
      ElMessage.error("删除失败");
    }
  });
};

// 提交表单
const handleSubmit = async () => {
  try {
    if (dialogType.value === "add") {
      // 新增
      await createNotice(noticeForm.value);
      ElMessage.success("发布成功");
    } else {
      // 编辑
      await updateNotice(noticeForm.value.id, noticeForm.value);
      ElMessage.success("更新成功");
    }
    await fetchNotices(); // 重新获取列表
    dialogVisible.value = false;
  } catch (error) {
    ElMessage.error(dialogType.value === "add" ? "发布失败" : "更新失败");
  }
};
</script>

<style scoped>
.notices-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-card {
  margin-bottom: 10px;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-header h4 {
  margin: 0;
}

.notice-actions {
  display: flex;
  gap: 10px;
}

.el-timeline-item {
  padding-bottom: 20px;
}
</style>
