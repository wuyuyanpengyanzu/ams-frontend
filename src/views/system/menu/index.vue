<template>
  <div class="page-card">
    <div class="toolbar">
      <span class="toolbar-hint">树形表格 — 展开/折叠查看父子层级</span>
      <el-button type="primary" @click="openDialog()">+ 新增菜单</el-button>
    </div>

    <el-table
      :data="treeData"
      row-key="menuId"
      border
      stripe
      style="width: 100%"
      default-expand-all
    >
      <el-table-column prop="menuName" label="菜单名称">
        <template #default="{ row }">
          <el-tag
            :type="row.menuType === 'M' ? 'info' : row.menuType === 'C' ? 'warning' : 'success'"
            size="small"
            style="margin-right: 6px"
          >
            {{ { M: '目录', C: '菜单', F: '按钮' }[row.menuType] || row.menuType }}
          </el-tag>
          {{ row.menuName }}
        </template>
      </el-table-column>
      <el-table-column prop="perms" label="权限标识" />
      <el-table-column prop="icon" label="图标" width="120" />
      <el-table-column prop="path" label="路由地址" width="160" />
      <el-table-column label="操作" width="160" align="center">
        <template #default="{ row }">
          <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
          <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑菜单' : '新增菜单'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="上级菜单" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="{ label: 'menuName', value: 'menuId', children: 'children' }"
            placeholder="不选则为顶级菜单"
            clearable
            check-strictly
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-select v-model="form.menuType" style="width: 100%">
            <el-option label="目录 (M)" value="M" />
            <el-option label="菜单 (C)" value="C" />
            <el-option label="按钮 (F)" value="F" />
          </el-select>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="路由地址" prop="path">
          <el-input v-model="form.path" placeholder="如 /system/user" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="form.component" placeholder="如 system/user/index" />
        </el-form-item>
        <el-form-item label="权限标识" prop="perms">
          <el-input v-model="form.perms" placeholder="如 sys:user:list" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="如 HomeFilled" />
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
import { getMenuTree, createMenu, updateMenu, deleteMenu } from '@/api/menu'

const treeData = ref<MenuInfo[]>([])
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

const isEdit = computed(() => editingId.value !== null)

const form = ref<MenuParams>({
  menuName: '',
  parentId: undefined,
  menuType: 'C',
  icon: '',
  path: '',
  component: '',
  perms: '',
})

const rules: FormRules = {
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
}

/** 将树形数据拍扁为 el-tree-select 用的 options（排除按钮类型） */
const parentOptions = computed(() => {
  return [{ menuId: 0, menuName: '顶级', children: buildParentOptions(treeData.value) }]
})

function buildParentOptions(nodes: MenuInfo[]): any[] {
  return nodes
    .filter((n) => n.menuType !== 'F')
    .map((n) => ({
      menuId: n.menuId,
      menuName: n.menuName,
      children: n.children ? buildParentOptions(n.children) : undefined,
    }))
}

function fetchTree() {
  getMenuTree().then((data) => (treeData.value = data))
}

function openDialog(row?: MenuInfo) {
  if (row) {
    editingId.value = row.menuId
    form.value = {
      menuName: row.menuName,
      parentId: row.parentId || 0,
      menuType: row.menuType,
      icon: row.icon || '',
      path: row.path || '',
      component: row.component || '',
      perms: row.perms || '',
    }
  } else {
    editingId.value = null
    form.value = { menuName: '', parentId: 0, menuType: 'C', icon: '', path: '', component: '', perms: '' }
  }
  dialogVisible.value = true
}

function handleSubmit() {
  formRef.value?.validate().then(() => {
    const params = { ...form.value }
    if (params.parentId === 0) params.parentId = undefined
    const req = isEdit.value ? updateMenu(editingId.value!, params) : createMenu(params)
    req.then(() => {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
      fetchTree()
    })
  })
}

function handleDelete(row: MenuInfo) {
  ElMessageBox.confirm(`确定删除菜单「${row.menuName}」吗？`, '提示', {
    type: 'warning',
  }).then(() => {
    deleteMenu(row.menuId).then(() => {
      ElMessage.success('删除成功')
      fetchTree()
    })
  })
}

onMounted(fetchTree)
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
}
.toolbar-hint {
  font-size: 13px;
  color: #909399;
}
</style>
