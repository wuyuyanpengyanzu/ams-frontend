<template>
  <div class="page-card">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKey"
          placeholder="搜索用户名或昵称"
          clearable
          style="width: 220px"
          @keyup.enter="fetchList"
        />
        <el-button @click="fetchList">查询</el-button>
        <el-button @click="searchKey = ''; fetchList()">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" v-permission="'ams:user:add'" @click="openDialog()">+ 新增用户</el-button>
      </div>
    </div>

    <el-table :data="filteredList" border stripe style="width: 100%">
      <el-table-column prop="userId" label="ID" width="80" />
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="nickName" label="昵称" />
      <el-table-column label="所属角色">
        <template #default="{ row }">
          <template v-if="row.roles && row.roles.length">
            <el-tag
              v-for="role in row.roles"
              :key="role.roleId"
              size="small"
              style="margin-right: 4px"
            >
              {{ role.roleName }}
            </el-tag>
          </template>
          <span v-else class="text-muted">无</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'" size="small">
            {{ row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <div class="op-cell">
            <el-button type="primary" link v-permission="'ams:user:edit'" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link v-permission="'ams:user:delete'" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="form.nickName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width: 100%">
            <el-option label="正常" value="0" />
            <el-option label="停用" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="form.roleIds">
            <el-checkbox
              v-for="role in allRoles"
              :key="role.roleId"
              :label="role.roleId"
            >
              {{ role.roleName }}
            </el-checkbox>
          </el-checkbox-group>
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
import { getUserList, createUser, updateUser, deleteUser } from '@/api/user'
import { getRoleList } from '@/api/role'

const list = ref<UserVO[]>([])
const allRoles = ref<RoleInfo[]>([])
const searchKey = ref('')
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

const isEdit = computed(() => editingId.value !== null)

const form = ref<{
  userName: string
  password: string
  nickName: string
  status: string
  roleIds: number[]
}>({
  userName: '',
  password: '',
  nickName: '',
  status: '0',
  roleIds: [],
})

const rules: FormRules = {
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码不少于6位', trigger: 'blur' },
  ],
}

const filteredList = computed(() => {
  if (!searchKey.value) return list.value
  const kw = searchKey.value.toLowerCase()
  return list.value.filter(
    (u) =>
      u.userName.toLowerCase().includes(kw) ||
      (u.nickName && u.nickName.toLowerCase().includes(kw)),
  )
})

function fetchList() {
  getUserList().then((data) => (list.value = data))
}

function openDialog(row?: UserVO) {
  allRoles.value.length === 0 && getRoleList().then((data) => (allRoles.value = data))

  if (row) {
    editingId.value = row.userId
    form.value = {
      userName: row.userName,
      password: '',
      nickName: row.nickName || '',
      status: row.status,
      roleIds: row.roles ? row.roles.map((r) => r.roleId) : [],
    }
  } else {
    editingId.value = null
    form.value = { userName: '', password: '', nickName: '', status: '0', roleIds: [] }
  }
  dialogVisible.value = true
  // 编辑时清除密码校验
  formRef.value?.clearValidate()
}

function handleSubmit() {
  formRef.value?.validate().then(() => {
    if (isEdit.value) {
      const params: UserUpdateParams = {
        userName: form.value.userName,
        nickName: form.value.nickName,
        status: form.value.status,
        roleIds: form.value.roleIds,
      }
      updateUser(editingId.value!, params).then(() => {
        ElMessage.success('编辑成功')
        dialogVisible.value = false
        fetchList()
      })
    } else {
      createUser(form.value).then(() => {
        ElMessage.success('新增成功')
        dialogVisible.value = false
        fetchList()
      })
    }
  })
}

function handleDelete(row: UserVO) {
  ElMessageBox.confirm(`确定删除用户「${row.userName}」吗？`, '提示', {
    type: 'warning',
  }).then(() => {
    deleteUser(row.userId).then(() => {
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
.text-muted { color: #c0c4cc; }
.op-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
}
</style>
