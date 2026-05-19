<template>
  <div class="page-card">
    <!-- 顶部摘要 -->
    <div class="detail-header">
      <div class="header-left">
        <el-button link @click="$router.back()"><el-icon><ArrowLeft /></el-icon>返回</el-button>
        <span class="header-title">{{ task?.taskName }}</span>
        <el-tag :type="task?.status === 0 ? 'warning' : 'success'" size="small">
          {{ task?.status === 0 ? '盘点中' : '已完成' }}
        </el-tag>
      </div>
      <el-button
        v-if="task?.status === 0"
        type="primary"
        v-permission="'ams:asset:edit'"
        @click="handleComplete"
      >
        完成盘点
      </el-button>
    </div>

    <!-- 进度条 -->
    <div class="progress-bar">
      <div class="progress-info">
        <span>盘点进度：{{ checkedCount }} / {{ task?.totalCount ?? 0 }}</span>
        <span class="progress-stats">
          正常 <b class="c-success">{{ normalCount }}</b>
          异常 <b class="c-danger">{{ abnormalCount }}</b>
          未盘 <b class="c-muted">{{ task ? task.totalCount - checkedCount : 0 }}</b>
        </span>
      </div>
      <el-progress
        :percentage="task?.totalCount ? Math.round((checkedCount / task.totalCount) * 100) : 0"
        :stroke-width="8"
      />
    </div>

    <!-- 明细表格 -->
    <el-table :data="items" border stripe v-loading="loading">
      <el-table-column prop="assetCode" label="资产编号" min-width="130" />
      <el-table-column prop="assetName" label="资产名称" min-width="140" />
      <el-table-column prop="categoryName" label="分类" min-width="100" />
      <el-table-column prop="model" label="型号" min-width="100" show-overflow-tooltip />
      <el-table-column prop="department" label="部门" min-width="100" />
      <el-table-column prop="location" label="位置" min-width="100" />
      <el-table-column label="资产状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="assetStatusMap[row.assetStatus]?.type" size="small">
            {{ assetStatusMap[row.assetStatus]?.text ?? row.assetStatus }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="盘点结果" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.result === 1" type="success" size="small">正常</el-tag>
          <el-tag v-else-if="row.result === 2" type="danger" size="small">异常</el-tag>
          <span v-else class="text-muted">待盘点</span>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
      <el-table-column label="操作" width="160" fixed="right" v-if="task?.status === 0">
        <template #default="{ row }">
          <div class="op-cell">
            <el-button type="primary" link size="small" @click="markItem(row, 1)">正常</el-button>
            <el-button type="danger" link size="small" @click="markItem(row, 2)">异常</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getInventoryTaskDetail, markInventoryItem, completeInventoryTask } from '@/api/inventory'

const route = useRoute()
const taskId = Number(route.params.id)

const task = ref<InventoryTaskItem | null>(null)
const items = ref<InventoryItem[]>([])
const loading = ref(false)

const assetStatusMap: Record<number, { text: string; type: string }> = {
  0: { text: '闲置', type: 'info' },
  1: { text: '领用', type: 'success' },
  2: { text: '维修', type: 'warning' },
  3: { text: '报废', type: 'danger' },
}

const normalCount = computed(() => items.value.filter(i => i.result === 1).length)
const abnormalCount = computed(() => items.value.filter(i => i.result === 2).length)
const checkedCount = computed(() => normalCount.value + abnormalCount.value)

function fetchDetail() {
  loading.value = true
  getInventoryTaskDetail(taskId)
    .then((data) => { task.value = data.task; items.value = data.items })
    .finally(() => (loading.value = false))
}

function markItem(row: InventoryItem, result: number) {
  const label = result === 1 ? '正常' : '异常'
  ElMessageBox.prompt(`标记为「${label}」，可填写备注：`, '盘点确认', {
    confirmButtonText: '确认',
    inputPlaceholder: '备注（选填）',
  }).then(({ value }) => {
    markInventoryItem(row.itemId, { result, remark: value || undefined }).then(() => {
      row.result = result
      row.remark = value || ''
      row.checkTime = new Date().toISOString()
      ElMessage.success('已标记')
    }).catch(() => {
      ElMessage.error('标记失败')
    })
  }).catch(() => {})
}

function handleComplete() {
  const unchecked = task.value ? task.value.totalCount - checkedCount.value : 0
  ElMessageBox.confirm(
    `盘点汇总：正常 ${normalCount.value} / 异常 ${abnormalCount.value} / 未盘 ${unchecked}。确认完成？`,
    '完成盘点',
    { type: 'warning' },
  ).then(() => {
    completeInventoryTask(taskId).then(() => {
      ElMessage.success('盘点已完成')
      fetchDetail()
    })
  }).catch(() => {})
}

onMounted(fetchDetail)
</script>

<style scoped>
.page-card { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 20px; }
.detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.header-left { display: flex; align-items: center; gap: 12px; }
.header-title { font-size: 16px; font-weight: 600; color: #303133; }
.progress-bar { margin-bottom: 20px; padding: 16px; background: #f5f7fa; border-radius: 8px; }
.progress-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 13px; }
.progress-stats { display: flex; gap: 16px; }
.c-success { color: #67c23a; }
.c-danger { color: #f56c6c; }
.c-muted { color: #c0c4cc; }
.text-muted { color: #c0c4cc; }
.op-cell { display: flex; justify-content: center; align-items: center; gap: 4px; }
</style>
