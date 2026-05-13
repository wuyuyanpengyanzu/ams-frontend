<template>
  <div class="page-card">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKey"
          placeholder="搜索角色名或标识"
          clearable
          style="width: 220px"
        />
        <el-button @click="fetchList">查询</el-button>
        <el-button @click="searchKey = ''; fetchList()">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="openDialog()">+ 新增角色</el-button>
      </div>
    </div>

    <el-table :data="filteredList" border stripe style="width: 100%">
      <el-table-column prop="roleId" label="ID" width="80" />
      <el-table-column prop="roleName" label="角色名称" />
      <el-table-column prop="roleKey" label="角色标识" />
      <el-table-column label="操作" width="160" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色标识" prop="roleKey">
          <el-input v-model="form.roleKey" placeholder="如 admin, user" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { getRoleList, createRole, updateRole, deleteRole } from '@/api/role'

const list = ref<RoleInfo[]>([])
const searchKey = ref('')
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

const isEdit = computed(() => editingId.value !== null)

const form = ref<RoleParams>({ roleName: '', roleKey: '' })

const rules: FormRules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleKey: [{ required: true, message: '请输入角色标识', trigger: 'blur' }],
}

const filteredList = computed(() => {
  if (!searchKey.value) return list.value
  const kw = searchKey.value.toLowerCase()
  return list.value.filter(
    (r) => r.roleName.toLowerCase().includes(kw) || r.roleKey.toLowerCase().includes(kw),
  )
})

function fetchList() {
  getRoleList().then((data) => (list.value = data))
}

function openDialog(row?: RoleInfo) {
  if (row) {
    editingId.value = row.roleId
    form.value = { roleName: row.roleName, roleKey: row.roleKey }
  } else {
    editingId.value = null
    form.value = { roleName: '', roleKey: '' }
  }
  dialogVisible.value = true
}

function handleSubmit() {
  formRef.value?.validate().then(() => {
    const params = { ...form.value }
    const req = isEdit.value ? updateRole(editingId.value!, params) : createRole(params)
    req.then(() => {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
      fetchList()
    })
  })
}

function handleDelete(row: RoleInfo) {
  ElMessageBox.confirm(`确定删除角色「${row.roleName}」吗？`, '提示', {
    type: 'warning',
  }).then(() => {
    deleteRole(row.roleId).then(() => {
      ElMessage.success('删除成功')
      fetchList()
    })
  })
}

onMounted(fetchList)
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
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
