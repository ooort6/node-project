<template>
  <div class="log-management-container">
    <el-card class="filter-card">
      <template #header>
        <div class="card-header">
          <span>日志管理</span>
          <div class="header-actions">
            <el-button type="primary" :icon="Refresh" @click="refreshLogs"
              >刷新</el-button
            >
            <el-popconfirm
              title="确定要清理90天前的日志吗？此操作不可恢复！"
              @confirm="cleanupLogs"
            >
              <template #reference>
                <el-button type="danger" :icon="Delete">清理过期日志</el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="模块">
          <el-select
            v-model="queryParams.module"
            placeholder="全部模块"
            clearable
          >
            <el-option label="认证模块" value="AUTH" />
            <el-option label="用户模块" value="USER" />
            <el-option label="待办模块" value="TODO" />
            <el-option label="公告模块" value="NOTICE" />
            <el-option label="系统模块" value="SYSTEM" />
            <el-option label="其它模块" value="OTHER" />
          </el-select>
        </el-form-item>

        <el-form-item label="操作类型">
          <el-select
            v-model="queryParams.actionType"
            placeholder="全部操作"
            clearable
          >
            <el-option label="登录" value="LOGIN" />
            <el-option label="登出" value="LOGOUT" />
            <el-option label="创建" value="CREATE" />
            <el-option label="更新" value="UPDATE" />
            <el-option label="删除" value="DELETE" />
            <el-option label="系统" value="SYSTEM" />
            <el-option label="错误" value="ERROR" />
            <el-option label="其它" value="OTHER" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="全部状态"
            clearable
          >
            <el-option label="成功" value="SUCCESS" />
            <el-option label="失败" value="FAILURE" />
            <el-option label="警告" value="WARNING" />
            <el-option label="信息" value="INFO" />
          </el-select>
        </el-form-item>

        <el-form-item label="用户名">
          <el-input
            v-model="queryParams.username"
            placeholder="输入用户名"
            clearable
          />
        </el-form-item>

        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            :shortcuts="dateRangeShortcuts"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="searchLogs">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="showStats" class="stats-card">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-title">今日日志</div>
            <div class="stat-value">{{ stats.todayCount || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-title">总日志数</div>
            <div class="stat-value">{{ stats.totalCount || 0 }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-title">错误日志</div>
            <div class="stat-value error-value">
              {{ stats.errorCount || 0 }}
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-title">近7天日志</div>
            <div class="stat-value">
              {{
                stats.dailyCounts?.reduce((sum, item) => sum + item.count, 0) ||
                0
              }}
            </div>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="chart-row">
        <el-col :span="12">
          <div ref="dailyChartRef" class="chart-container"></div>
        </el-col>
        <el-col :span="12">
          <div ref="moduleChartRef" class="chart-container"></div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="log-table-card">
      <el-table
        v-loading="loading"
        :data="logList"
        style="width: 100%"
        stripe
        border
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <el-table-column
          prop="username"
          label="用户"
          width="100"
          show-overflow-tooltip
        />

        <el-table-column prop="module" label="模块" width="100">
          <template #default="scope">
            <el-tag :type="getModuleTagType(scope.row.module)" effect="plain">
              {{ getModuleName(scope.row.module) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="actionType" label="操作类型" width="100">
          <template #default="scope">
            <el-tag
              :type="getActionTypeTagType(scope.row.actionType)"
              effect="plain"
            >
              {{ getActionTypeName(scope.row.actionType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="description"
          label="操作描述"
          min-width="250"
          show-overflow-tooltip
        />

        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusName(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="ip"
          label="IP地址"
          width="120"
          show-overflow-tooltip
        />

        <el-table-column prop="createdAt" label="操作时间" width="160">
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="80" fixed="right">
          <template #default="scope">
            <el-button link type="primary" @click="showLogDetail(scope.row)">
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.limit"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 日志详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="日志详情"
      width="60%"
      destroy-on-close
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户ID">
          {{ currentLog.userId || "无" }}
        </el-descriptions-item>

        <el-descriptions-item label="用户名">
          {{ currentLog.username || "无" }}
        </el-descriptions-item>

        <el-descriptions-item label="操作模块">
          {{ getModuleName(currentLog.module) }}
        </el-descriptions-item>

        <el-descriptions-item label="操作类型">
          {{ getActionTypeName(currentLog.actionType) }}
        </el-descriptions-item>

        <el-descriptions-item label="操作描述" :span="2">
          {{ currentLog.description }}
        </el-descriptions-item>

        <el-descriptions-item label="操作状态">
          <el-tag :type="getStatusTagType(currentLog.status)">
            {{ getStatusName(currentLog.status) }}
          </el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="IP地址">
          {{ currentLog.ip || "无" }}
        </el-descriptions-item>

        <el-descriptions-item label="用户代理" :span="2">
          {{ currentLog.userAgent || "无" }}
        </el-descriptions-item>

        <el-descriptions-item label="操作时间">
          {{ formatDateTime(currentLog.createdAt) }}
        </el-descriptions-item>

        <el-descriptions-item label="更新时间">
          {{ formatDateTime(currentLog.updatedAt) }}
        </el-descriptions-item>
      </el-descriptions>

      <template v-if="currentLog.details">
        <div class="details-title">详细数据</div>
        <el-input type="textarea" :rows="10" v-model="detailsJson" readonly />
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, computed, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Delete, Refresh } from "@element-plus/icons-vue";
import axios from "axios";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

// 注册ECharts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  BarChart,
  LineChart,
  PieChart,
  CanvasRenderer,
]);

// 日志列表数据
const logList = ref([]);
const loading = ref(false);
const total = ref(0);

// 图表引用
const dailyChartRef = ref(null);
const moduleChartRef = ref(null);
let dailyChart = null;
let moduleChart = null;

// 是否显示统计信息
const showStats = ref(true);

// 统计数据
const stats = ref({
  todayCount: 0,
  totalCount: 0,
  errorCount: 0,
  actionTypeCounts: {},
  dailyCounts: [],
  moduleCounts: {},
});

// 查询参数
const queryParams = reactive({
  page: 1,
  limit: 20,
  sort: "-createdAt",
  module: "",
  actionType: "",
  status: "",
  username: "",
  startDate: "",
  endDate: "",
});

// 日期范围
const dateRange = ref([]);

// 日期快捷选项
const dateRangeShortcuts = [
  {
    text: "最近一周",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: "最近一个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: "最近三个月",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

// 当前选中的日志
const currentLog = ref({});
const detailDialogVisible = ref(false);
const detailsJson = computed(() => {
  if (currentLog.value && currentLog.value.details) {
    return JSON.stringify(currentLog.value.details, null, 2);
  }
  return "";
});

// 监听日期范围变化
watch(dateRange, (newValue) => {
  if (newValue) {
    queryParams.startDate = newValue[0];
    queryParams.endDate = newValue[1];
  } else {
    queryParams.startDate = "";
    queryParams.endDate = "";
  }
});

// 获取日志列表
const fetchLogs = async () => {
  loading.value = true;
  try {
    const { data } = await axios.get("/api/logs", { params: queryParams });
    if (data.success) {
      logList.value = data.data.logs;
      total.value = data.data.total;
    } else {
      ElMessage.error(data.message || "获取日志列表失败");
    }
  } catch (error) {
    console.error("获取日志列表错误:", error);
    ElMessage.error("获取日志列表失败");
  } finally {
    loading.value = false;
  }
};

// 获取统计数据
const fetchStats = async () => {
  try {
    const { data } = await axios.get("/api/logs/stats/overview");
    if (data.success) {
      stats.value = data.data;
      nextTick(() => {
        initCharts();
      });
    } else {
      ElMessage.error(data.message || "获取统计数据失败");
    }
  } catch (error) {
    console.error("获取统计数据错误:", error);
    ElMessage.error("获取统计数据失败");
    showStats.value = false;
  }
};

// 初始化图表
const initCharts = () => {
  // 初始化日志趋势图
  if (dailyChartRef.value) {
    dailyChart = echarts.init(dailyChartRef.value);
    const dailyData = stats.value.dailyCounts || [];

    // 准备x轴和y轴数据
    const xAxisData = dailyData.map((item) => item.date);
    const seriesData = dailyData.map((item) => item.count);

    dailyChart.setOption({
      title: {
        text: "近7天日志趋势",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      xAxis: {
        type: "category",
        data: xAxisData,
        axisLabel: {
          rotate: 30,
        },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
      },
      series: [
        {
          name: "日志数量",
          type: "line",
          data: seriesData,
          smooth: true,
          markPoint: {
            data: [
              { type: "max", name: "最大值" },
              { type: "min", name: "最小值" },
            ],
          },
        },
      ],
    });

    // 窗口调整大小时，重绘图表
    window.addEventListener("resize", () => {
      dailyChart && dailyChart.resize();
    });
  }

  // 初始化模块分布图
  if (moduleChartRef.value) {
    moduleChart = echarts.init(moduleChartRef.value);
    const moduleCounts = stats.value.moduleCounts || {};

    // 准备饼图数据
    const pieData = Object.entries(moduleCounts).map(([name, value]) => ({
      name: getModuleName(name),
      value,
    }));

    moduleChart.setOption({
      title: {
        text: "模块访问分布",
        left: "center",
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        left: "left",
      },
      series: [
        {
          name: "访问次数",
          type: "pie",
          radius: "60%",
          center: ["50%", "60%"],
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    });

    // 窗口调整大小时，重绘图表
    window.addEventListener("resize", () => {
      moduleChart && moduleChart.resize();
    });
  }
};

// 刷新日志
const refreshLogs = () => {
  fetchLogs();
  fetchStats();
};

// 搜索日志
const searchLogs = () => {
  queryParams.page = 1;
  fetchLogs();
};

// 重置查询条件
const resetQuery = () => {
  Object.assign(queryParams, {
    page: 1,
    limit: 20,
    sort: "-createdAt",
    module: "",
    actionType: "",
    status: "",
    username: "",
    startDate: "",
    endDate: "",
  });
  dateRange.value = [];
  fetchLogs();
};

// 处理分页变化
const handleSizeChange = (val) => {
  queryParams.limit = val;
  fetchLogs();
};

const handleCurrentChange = (val) => {
  queryParams.page = val;
  fetchLogs();
};

// 显示日志详情
const showLogDetail = (log) => {
  currentLog.value = log;
  detailDialogVisible.value = true;
};

// 清理过期日志
const cleanupLogs = async () => {
  try {
    const { data } = await axios.delete("/api/logs/cleanup?days=90");
    if (data.success) {
      ElMessage.success(data.message || "清理成功");
      refreshLogs();
    } else {
      ElMessage.error(data.message || "清理失败");
    }
  } catch (error) {
    console.error("清理日志错误:", error);
    ElMessage.error("清理日志失败");
  }
};

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// 获取模块名称
const getModuleName = (moduleCode) => {
  const moduleMap = {
    AUTH: "认证模块",
    USER: "用户模块",
    TODO: "待办模块",
    NOTICE: "公告模块",
    SYSTEM: "系统模块",
    OTHER: "其它模块",
  };
  return moduleMap[moduleCode] || moduleCode;
};

// 获取操作类型名称
const getActionTypeName = (actionType) => {
  const actionTypeMap = {
    LOGIN: "登录",
    LOGOUT: "登出",
    CREATE: "创建",
    UPDATE: "更新",
    DELETE: "删除",
    SYSTEM: "系统",
    ERROR: "错误",
    OTHER: "其它",
  };
  return actionTypeMap[actionType] || actionType;
};

// 获取状态名称
const getStatusName = (status) => {
  const statusMap = {
    SUCCESS: "成功",
    FAILURE: "失败",
    WARNING: "警告",
    INFO: "信息",
  };
  return statusMap[status] || status;
};

// 获取模块标签类型
const getModuleTagType = (module) => {
  const typeMap = {
    AUTH: "danger",
    USER: "warning",
    TODO: "success",
    NOTICE: "info",
    SYSTEM: "primary",
    OTHER: "info",
  };
  return typeMap[module] || "";
};

// 获取操作类型标签类型
const getActionTypeTagType = (actionType) => {
  const typeMap = {
    LOGIN: "success",
    LOGOUT: "info",
    CREATE: "primary",
    UPDATE: "warning",
    DELETE: "danger",
    SYSTEM: "info",
    ERROR: "danger",
    OTHER: "",
  };
  return typeMap[actionType] || "";
};

// 获取状态标签类型
const getStatusTagType = (status) => {
  const typeMap = {
    SUCCESS: "success",
    FAILURE: "danger",
    WARNING: "warning",
    INFO: "info",
  };
  return typeMap[status] || "";
};

// 组件挂载后执行
onMounted(() => {
  fetchLogs();
  fetchStats();
});
</script>

<style scoped>
.log-management-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-top: 15px;
}

.stats-card {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  border-radius: 4px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.error-value {
  color: #f56c6c;
}

.chart-row {
  margin-top: 20px;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.log-table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.details-title {
  margin: 20px 0 10px;
  font-weight: bold;
  font-size: 16px;
}
</style>
