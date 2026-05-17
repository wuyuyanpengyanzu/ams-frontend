<template>
  <div class="page-card">
    <div class="toolbar">
      <div class="toolbar-left">
        <span class="page-title">盘点管理</span>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" v-permission="'ams:asset:add'" @click="openCreateDialog">+ 新建盘点任务</el-button>
      </div>
    </div>

    <el-table :data="list" border stripe v-loading="loading">
      <el-table-column prop="taskName" label="任务名称" min-width="160" />
      <el-table-column label="盘点部门" min-width="120">
        <template #default="{ row }">
          <span v-if="row.department">{{ row.department }}</span>
          <span v-else class="text-muted">全部门</span>
        </template>
      </el-table-column>
      <el-table-column label="盘点分类" min-width="120">
        <template #default="{ row }">
          <span v-if="row.categoryId">{{ row.categoryId }}</span>
          <span v-else class="text-muted">全分类</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'warning' : 'success'" size="small">
            {{ row.status === 0 ? '盘点中' : '已完成' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="totalCount" label="需盘数" width="80" align="center" />
      <el-table-column prop="normalCount" label="正常" width="70" align="center" />
      <el-table-column prop="abnormalCount" label="异常" width="70" align="center" />
      <el-table-column prop="uncheckedCount" label="未盘" width="70" align="center" />
      <el-table-column prop="createTime" label="创建时间" min-width="160" />
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <div class="op-cell">
            <el-button type="primary" link size="small" @click="$router.push(`/inventory/task/${row.taskId}`)">
              {{ row.status === 0 ? '盘点' : '详情' }}
            </el-button>
            <el-button
              v-if="row.status === 0"
              type="danger"
              link
              size="small"
              v-permission="'ams:asset:delete'"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="query.current"
        v-model:page-size="query.size"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @change="fetchList"
      />
    </div>

    <!-- 新建弹窗 -->
    <el-dialog v-model="dialogVisible" title="新建盘点任务" width="420px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="form.taskName" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="部门">
          <el-input v-model="form.department" placeholder="留空盘点全部" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" placeholder="留空盘点全部" clearable style="width: 100%">
            <el-option v-for="cat in categories" :key="cat.categoryId" :label="cat.categoryName" :value="cat.categoryId" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确认创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getInventoryTaskList, createInventoryTask, deleteInventoryTask } from '@/api/inventory'
import { getCategoryList } from '@/api/category'

const list = ref<InventoryTaskItem[]>([])
const loading = ref(false)
const total = ref(0)
const categories = ref<AssetCategory[]>([])

const query = reactive({ current: 1, size: 10 })

function fetchList() {
  loading.value = true
  getInventoryTaskList({ ...query })
    .then((data) => { list.value = data.records; total.value = data.total })
    .finally(() => (loading.value = false))
}

// 新建
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const form = reactive<InventoryTaskParams>({ taskName: '', department: '', categoryId: undefined })
const rules: FormRules = {
  taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
}

function openCreateDialog() {
  form.taskName = ''
  form.department = ''
  form.categoryId = undefined
  dialogVisible.value = true
  formRef.value?.clearValidate()
}

function handleCreate() {
  formRef.value?.validate().then(() => {
    createInventoryTask({
      taskName: form.taskName,
      department: form.department || undefined,
      categoryId: form.categoryId,
    }).then((data) => {
      ElMessage.success(`任务创建成功，共 ${data.totalCount} 项待盘点`)
      dialogVisible.value = false
      fetchList()
    })
  })
}

function handleDelete(row: InventoryTaskItem) {
  ElMessageBox.confirm(`确定删除任务「${row.taskName}」吗？`, '提示', { type: 'warning' }).then(() => {
    deleteInventoryTask(row.taskId).then(() => {
      ElMessage.success('删除成功')
      fetchList()
    })
  })
}

onMounted(() => {
  getCategoryList().then((data) => (categories.value = data))
  fetchList()
})
</script>

<style scoped>
.page-card { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 20px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.toolbar-left { display: flex; align-items: center; gap: 10px; }
.toolbar-right { display: flex; align-items: center; gap: 8px; }
.page-title { font-size: 16px; font-weight: 600; color: #303133; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
.text-muted { color: #c0c4cc; }
.op-cell { display: flex; justify-content: center; align-items: center; gap: 2px; }
</style>
