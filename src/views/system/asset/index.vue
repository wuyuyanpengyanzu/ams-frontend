<template>
  <div class="page-card">
    <!-- ====== 搜索工具栏 ====== -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="query.keyword"
          placeholder="编号 / 名称"
          clearable
          style="width: 180px"
          @keyup.enter="handleSearch"
        />
        <el-select
          v-model="query.categoryId"
          placeholder="分类"
          clearable
          style="width: 140px"
        >
          <el-option
            v-for="cat in categories"
            :key="cat.categoryId"
            :label="cat.categoryName"
            :value="cat.categoryId"
          />
        </el-select>
        <el-select
          v-model="query.status"
          placeholder="状态"
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="(item, key) in StatusEnum"
            :key="key"
            :label="item.text"
            :value="Number(key)"
          />
        </el-select>
        <el-button @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" v-permission="'ams:asset:add'" @click="openFormDialog()">+ 新增资产</el-button>
        <el-button v-permission="'ams:asset:export'" @click="handleExport">导出</el-button>
        <el-button v-permission="'ams:asset:import'" @click="importVisible = true">导入</el-button>
      </div>
    </div>

    <!-- ====== 数据表格 ====== -->
    <el-table :data="list" border stripe style="width: 100%" v-loading="loading">
      <el-table-column prop="assetCode" label="资产编号" min-width="140" />
      <el-table-column label="资产名称" min-width="140">
        <template #default="{ row }">
          <el-button type="primary" link @click="openDrawer(row)">
            {{ row.assetName }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column prop="categoryName" label="所属分类" min-width="100" />
      <el-table-column prop="model" label="规格型号" min-width="120" show-overflow-tooltip />
      <el-table-column prop="department" label="归属部门" min-width="100" />
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="StatusEnum[row.status]?.type ?? 'info'" size="small">
            {{ StatusEnum[row.status]?.text ?? row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="领用人" min-width="100">
        <template #default="{ row }">
          <span v-if="row.userName">{{ row.userName }}</span>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <div class="op-cell">
            <el-button type="primary" link size="small" v-permission="'ams:asset:edit'" @click="openFormDialog(row)">编辑</el-button>
            <el-dropdown trigger="click" @command="(cmd: string) => handleRowCommand(cmd, row)">
            <el-button link size="small" class="more-btn">
              更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-if="row.status === 0" command="borrow" v-permission="'ams:asset:borrow'">
                  <span class="drop-text drop-borrow">领用</span>
                </el-dropdown-item>
                <el-dropdown-item v-if="row.status === 1" command="return" v-permission="'ams:asset:return'">
                  <span class="drop-text drop-return">归还</span>
                </el-dropdown-item>
                <el-dropdown-item v-if="row.status !== 3" command="repair" v-permission="'ams:asset:repair'">
                  <span class="drop-text drop-repair">报修</span>
                </el-dropdown-item>
                <el-dropdown-item v-if="row.status !== 3" command="scrap" v-permission="'ams:asset:scrap'">
                  <span class="drop-text drop-scrap">报废</span>
                </el-dropdown-item>
                <el-dropdown-item command="delete" divided v-permission="'ams:asset:delete'">
                  <span class="drop-text drop-delete">删除</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- ====== 分页 ====== -->
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

    <!-- ====== 新增 / 编辑弹窗 ====== -->
    <el-dialog
      v-model="formVisible"
      :title="isEdit ? '编辑资产' : '新增资产'"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="80px">
        <el-form-item label="资产编号" prop="assetCode">
          <el-input v-model="form.assetCode" placeholder="请输入资产编号" />
        </el-form-item>
        <el-form-item label="资产名称" prop="assetName">
          <el-input v-model="form.assetName" placeholder="请输入资产名称" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" placeholder="请选择分类" clearable style="width: 100%">
            <el-option
              v-for="cat in categories"
              :key="cat.categoryId"
              :label="cat.categoryName"
              :value="cat.categoryId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="规格型号">
          <el-input v-model="form.model" placeholder="请输入规格型号" />
        </el-form-item>
        <el-form-item label="序列号">
          <el-input v-model="form.sn" placeholder="请输入序列号" />
        </el-form-item>
        <el-form-item label="购入单价">
          <el-input-number
            v-model="form.unitPrice"
            :min="0"
            :precision="2"
            :controls="false"
            placeholder="0.00"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="购置日期">
          <el-date-picker
            v-model="form.purchaseDate"
            type="date"
            placeholder="请选择购置日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="归属部门">
          <el-input v-model="form.department" placeholder="请输入归属部门" />
        </el-form-item>
        <el-form-item label="存放地点">
          <el-input v-model="form.location" placeholder="请输入存放地点" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="handleFormSubmit">确认</el-button>
      </template>
    </el-dialog>

    <!-- ====== 领用弹窗 ====== -->
    <el-dialog
      v-model="borrowVisible"
      title="领用资产"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form ref="borrowFormRef" :model="borrowForm" :rules="borrowRules" label-width="80px">
        <el-form-item label="选择用户" prop="userId">
          <el-select
            v-model="borrowForm.userId"
            filterable
            placeholder="请选择领用人"
            style="width: 100%"
          >
            <el-option
              v-for="u in activeUsers"
              :key="u.userId"
              :label="`${u.nickName || u.userName} (${u.userName})`"
              :value="u.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="borrowForm.remark" placeholder="领用备注（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="borrowVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBorrowSubmit">确认领用</el-button>
      </template>
    </el-dialog>

    <!-- ====== 归还 / 报修 / 报废弹窗 ====== -->
    <el-dialog
      v-model="actionVisible"
      :title="actionTitle"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form label-width="80px">
        <el-form-item label="备注">
          <el-input
            v-model="actionRemark"
            type="textarea"
            :rows="3"
            :placeholder="actionTitle + '备注（选填）'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="actionVisible = false">取消</el-button>
        <el-button type="primary" @click="handleActionSubmit">确认{{ actionTitle }}</el-button>
      </template>
    </el-dialog>

    <!-- ====== 详情抽屉 ====== -->
    <el-drawer v-model="drawerVisible" title="资产详情" size="600px">
      <template v-if="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="资产编号">{{ detail.assetCode }}</el-descriptions-item>
          <el-descriptions-item label="资产名称">{{ detail.assetName }}</el-descriptions-item>
          <el-descriptions-item label="所属分类">{{ detail.categoryName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="规格型号">{{ detail.model || '-' }}</el-descriptions-item>
          <el-descriptions-item label="序列号">{{ detail.sn || '-' }}</el-descriptions-item>
          <el-descriptions-item label="购入单价">
            {{ detail.unitPrice != null ? `¥${detail.unitPrice}` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="购置日期">{{ detail.purchaseDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="归属部门">{{ detail.department || '-' }}</el-descriptions-item>
          <el-descriptions-item label="存放地点">{{ detail.location || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="StatusEnum[detail.status]?.type ?? 'info'" size="small">
              {{ StatusEnum[detail.status]?.text ?? detail.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="领用人">{{ detail.userName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detail.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.createTime }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ detail.updateTime }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="log-title">操作日志</h4>
        <el-timeline v-if="detail.logs && detail.logs.length">
          <el-timeline-item
            v-for="log in detail.logs"
            :key="log.logId"
            :timestamp="log.createTime"
            placement="top"
          >
            <div class="log-item">
              <span class="log-op">{{ operationTypeText[log.operationType] }}</span>
              <span v-if="log.operatorName" class="log-operator"> — {{ log.operatorName }}</span>
              <div v-if="log.remark" class="log-remark">{{ log.remark }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无操作日志" />
      </template>
    </el-drawer>

    <!-- ====== 导入弹窗 ====== -->
    <el-dialog v-model="importVisible" title="导入资产" width="520px" :close-on-click-modal="false">
      <div class="import-steps">
        <el-button type="primary" link @click="handleDownloadTemplate">
          <el-icon style="margin-right:4px"><Download /></el-icon>下载导入模板
        </el-button>
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :limit="1"
          accept=".xlsx,.xls"
          :on-change="handleFileChange"
          drag
          style="margin-top:16px"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">拖拽文件到此处或点击上传</div>
          <template #tip>
            <div class="el-upload__tip">仅支持 .xlsx / .xls 格式</div>
          </template>
        </el-upload>
      </div>
      <div v-if="importResult" class="import-result">
        <el-divider />
        <div class="result-summary">
          <span>共 <b>{{ importResult.total }}</b> 条</span>
          <span class="result-success">成功 <b>{{ importResult.success }}</b></span>
          <span class="result-fail">失败 <b>{{ importResult.fail }}</b></span>
        </div>
        <div v-if="importResult.errors.length" class="result-errors">
          <el-table :data="importResult.errors" size="small" max-height="200">
            <el-table-column prop="row" label="行号" width="70" />
            <el-table-column prop="reason" label="失败原因" show-overflow-tooltip />
          </el-table>
        </div>
      </div>
      <template #footer>
        <el-button @click="importVisible = false">关闭</el-button>
        <el-button type="primary" :disabled="!pendingFile" :loading="importing" @click="handleImport">
          开始导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ArrowDown, Download, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  getAssetList,
  getAssetDetail,
  createAsset,
  updateAsset,
  deleteAsset,
  borrowAsset,
  returnAsset,
  repairAsset,
  scrapAsset,
  exportAssetList,
  importAssets,
  downloadTemplate,
} from '@/api/asset'
import { getCategoryList } from '@/api/category'
import { getUserList } from '@/api/user'

// ====== 状态映射 ======
const StatusEnum: Record<number, { text: string; type: 'info' | 'success' | 'warning' | 'danger' }> = {
  0: { text: '闲置', type: 'info' },
  1: { text: '领用', type: 'success' },
  2: { text: '维修', type: 'warning' },
  3: { text: '报废', type: 'danger' },
}

const operationTypeText: Record<number, string> = {
  0: '领用',
  1: '归还',
  2: '报修',
  3: '报废',
}

// ====== 表格数据 ======
const list = ref<AssetItem[]>([])
const loading = ref(false)
const total = ref(0)
const categories = ref<AssetCategory[]>([])

const query = reactive<AssetQueryParams>({
  current: 1,
  size: 10,
  keyword: undefined,
  categoryId: undefined,
  status: undefined,
})

function fetchList() {
  loading.value = true
  getAssetList({ ...query })
    .then((data) => {
      list.value = data.records
      total.value = data.total
    })
    .finally(() => (loading.value = false))
}

function handleSearch() {
  query.current = 1
  fetchList()
}

function handleReset() {
  query.current = 1
  query.keyword = undefined
  query.categoryId = undefined
  query.status = undefined
  fetchList()
}

// ====== 导出 ======
function handleExport() {
  exportAssetList({ ...query }).then((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    a.download = `资产列表_${today}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  })
}

// ====== 导入 ======
const importVisible = ref(false)
const uploadRef = ref()
const pendingFile = ref<File | null>(null)
const importing = ref(false)
const importResult = ref<ImportResult | null>(null)

function handleFileChange(file: any) {
  pendingFile.value = file.raw
  importResult.value = null
}

function handleDownloadTemplate() {
  downloadTemplate().then((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '资产导入模板.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  })
}

function handleImport() {
  if (!pendingFile.value) return
  importing.value = true
  importAssets(pendingFile.value).then((data) => {
    importResult.value = data
    if (data.success > 0) {
      ElMessage.success(`成功导入 ${data.success} 条`)
      fetchList()
    }
  }).finally(() => {
    importing.value = false
  })
}

// ====== 新增 / 编辑 ======
const formVisible = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)
const isEdit = computed(() => editingId.value !== null)

const form = reactive<AssetFormParams>({
  assetCode: '',
  assetName: '',
  categoryId: undefined,
  model: '',
  sn: '',
  unitPrice: undefined,
  purchaseDate: '',
  department: '',
  location: '',
  remark: '',
})

const formRules: FormRules = {
  assetCode: [{ required: true, message: '请输入资产编号', trigger: 'blur' }],
  assetName: [{ required: true, message: '请输入资产名称', trigger: 'blur' }],
}

function openFormDialog(row?: AssetItem) {
  if (row) {
    editingId.value = row.assetId
    form.assetCode = row.assetCode
    form.assetName = row.assetName
    form.categoryId = row.categoryId ?? undefined
    form.model = row.model
    form.sn = row.sn
    form.unitPrice = row.unitPrice
    form.purchaseDate = row.purchaseDate
    form.department = row.department
    form.location = row.location
    form.remark = row.remark
  } else {
    editingId.value = null
    form.assetCode = ''
    form.assetName = ''
    form.categoryId = undefined
    form.model = ''
    form.sn = ''
    form.unitPrice = undefined
    form.purchaseDate = ''
    form.department = ''
    form.location = ''
    form.remark = ''
  }
  formVisible.value = true
  formRef.value?.clearValidate()
}

function handleFormSubmit() {
  formRef.value?.validate().then(() => {
    const params: AssetFormParams = {
      assetCode: form.assetCode,
      assetName: form.assetName,
      categoryId: form.categoryId,
      model: form.model || undefined,
      sn: form.sn || undefined,
      unitPrice: form.unitPrice,
      purchaseDate: form.purchaseDate || undefined,
      department: form.department || undefined,
      location: form.location || undefined,
      remark: form.remark || undefined,
    }
    const req = isEdit.value
      ? updateAsset(editingId.value!, params)
      : createAsset(params)
    req.then(() => {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      formVisible.value = false
      fetchList()
    })
  })
}

// ====== 删除 ======
function handleDelete(row: AssetItem) {
  ElMessageBox.confirm(`确定删除资产「${row.assetName}」吗？`, '提示', {
    type: 'warning',
  }).then(() => {
    deleteAsset(row.assetId).then(() => {
      ElMessage.success('删除成功')
      fetchList()
    })
  })
}

// ====== 领用 ======
const borrowVisible = ref(false)
const borrowFormRef = ref<FormInstance>()
const borrowTarget = ref<AssetItem | null>(null)
const borrowForm = reactive({ userId: undefined as number | undefined, remark: '' })
const borrowRules: FormRules = {
  userId: [{ required: true, message: '请选择领用人', trigger: 'change' }],
}

const activeUsers = ref<UserVO[]>([])

function fetchUsers() {
  if (activeUsers.value.length === 0) {
    getUserList().then((data) => {
      activeUsers.value = data.filter((u) => u.status !== '1')
    })
  }
}

function openBorrowDialog(row: AssetItem) {
  borrowTarget.value = row
  borrowForm.userId = undefined
  borrowForm.remark = ''
  fetchUsers()
  borrowVisible.value = true
  borrowFormRef.value?.clearValidate()
}

function handleBorrowSubmit() {
  borrowFormRef.value?.validate().then(() => {
    borrowAsset(borrowTarget.value!.assetId, {
      userId: borrowForm.userId!,
      remark: borrowForm.remark || undefined,
    }).then(() => {
      ElMessage.success('领用成功')
      borrowVisible.value = false
      fetchList()
    })
  })
}

// ====== 归还 / 报修 / 报废 ======
const actionVisible = ref(false)
const actionType = ref<'return' | 'repair' | 'scrap'>('return')
const actionTarget = ref<AssetItem | null>(null)
const actionRemark = ref('')

const actionTitle = computed(() => {
  return { return: '归还', repair: '报修', scrap: '报废' }[actionType.value]
})

function handleRowCommand(cmd: string, row: AssetItem) {
  switch (cmd) {
    case 'borrow': openBorrowDialog(row); break
    case 'return': openActionDialog(row, 'return'); break
    case 'repair': openActionDialog(row, 'repair'); break
    case 'scrap': openActionDialog(row, 'scrap'); break
    case 'delete': handleDelete(row); break
  }
}

function openActionDialog(row: AssetItem, type: 'return' | 'repair' | 'scrap') {
  actionTarget.value = row
  actionType.value = type
  actionRemark.value = ''
  actionVisible.value = true
}

function handleActionSubmit() {
  const id = actionTarget.value!.assetId
  const params = { remark: actionRemark.value || undefined }
  const req = {
    return: returnAsset,
    repair: repairAsset,
    scrap: scrapAsset,
  }[actionType.value](id, params)

  req.then(() => {
    ElMessage.success(actionTitle.value + '成功')
    actionVisible.value = false
    fetchList()
  })
}

// ====== 详情抽屉 ======
const drawerVisible = ref(false)
const detail = ref<(AssetItem & { logs: AssetLog[] }) | null>(null)

function openDrawer(row: AssetItem) {
  getAssetDetail(row.assetId).then((data) => {
    detail.value = data
    if (detail.value.logs) {
      detail.value.logs = detail.value.logs.reverse()
    }
    drawerVisible.value = true
  })
}

// ====== 初始化 ======
onMounted(() => {
  getCategoryList().then((data) => (categories.value = data))
  fetchList()
})
</script>

<style scoped>
.page-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.log-title {
  margin: 24px 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.log-item {
  font-size: 13px;
}

.log-op {
  font-weight: 600;
  color: #409eff;
}

.log-operator {
  color: #606266;
}

.log-remark {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

/* ======== 操作列下拉 ======== */
.more-btn {
  font-size: 12px;
  color: #606266;
}

.drop-text {
  font-size: 13px;
}

.drop-borrow  { color: #67c23a; }
.drop-return { color: #e6a23c; }
.drop-repair { color: #e6a23c; }
.drop-scrap  { color: #f56c6c; }
.drop-delete { color: #f56c6c; }

.text-muted { color: #c0c4cc; }
.op-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
}

.import-steps {
  text-align: left;
}

.import-result {
  text-align: left;
}

.result-summary {
  display: flex;
  gap: 20px;
  font-size: 14px;
  margin-bottom: 8px;
}

.result-success { color: #67c23a; }
.result-fail { color: #f56c6c; }

.result-errors {
  max-height: 200px;
  overflow-y: auto;
}
</style>
