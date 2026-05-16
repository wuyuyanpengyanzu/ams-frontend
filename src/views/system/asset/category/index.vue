<template>
  <div class="page-card">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchKey"
          placeholder="搜索分类名称"
          clearable
          style="width: 220px"
          @keyup.enter="fetchList"
        />
        <el-button @click="fetchList">查询</el-button>
        <el-button @click="searchKey = ''; fetchList()">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" v-permission="'ams:category:add'" @click="openDialog()">+ 新增分类</el-button>
      </div>
    </div>

    <el-table :data="filteredList" border stripe style="width: 100%">
      <el-table-column prop="categoryId" label="ID" width="80" />
      <el-table-column prop="categoryName" label="分类名称" />
      <el-table-column label="上级分类">
        <template #default="{ row }">
          <span v-if="row.parentId && row.parentId !== 0">
            {{ getParentName(row.parentId) }}
          </span>
          <span v-else class="text-muted">顶级分类</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <div class="op-cell">
            <el-button type="primary" link v-permission="'ams:category:edit'" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link v-permission="'ams:category:delete'" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="form.categoryName" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="上级分类">
          <el-tree-select
            v-model="form.parentId"
            :data="treeData"
            :props="{ label: 'categoryName', value: 'categoryId', children: 'children' }"
            placeholder="无（顶级分类）"
            clearable
            check-strictly
            style="width: 100%"
          />
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
import { getCategoryList, createCategory, updateCategory, deleteCategory } from '@/api/category'

const list = ref<AssetCategory[]>([])
const searchKey = ref('')
const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

const isEdit = computed(() => editingId.value !== null)

const form = ref({
  categoryName: '',
  parentId: undefined as number | undefined,
})

const rules: FormRules = {
  categoryName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
}

const treeData = computed(() => buildTree(list.value))

function buildTree(items: AssetCategory[], parentId = 0): any[] {
  return items
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      ...item,
      children: buildTree(items, item.categoryId),
    }))
}

function getParentName(parentId: number): string {
  const parent = list.value.find((c) => c.categoryId === parentId)
  return parent ? parent.categoryName : '-'
}

const filteredList = computed(() => {
  if (!searchKey.value) return list.value
  const kw = searchKey.value.toLowerCase()
  return list.value.filter((c) => c.categoryName.toLowerCase().includes(kw))
})

function fetchList() {
  getCategoryList().then((data) => (list.value = data))
}

function openDialog(row?: AssetCategory) {
  if (row) {
    editingId.value = row.categoryId
    form.value = {
      categoryName: row.categoryName,
      parentId: row.parentId && row.parentId !== 0 ? row.parentId : undefined,
    }
  } else {
    editingId.value = null
    form.value = { categoryName: '', parentId: undefined }
  }
  dialogVisible.value = true
  formRef.value?.clearValidate()
}

function handleSubmit() {
  formRef.value?.validate().then(() => {
    const params = {
      categoryName: form.value.categoryName,
      parentId: form.value.parentId,
    }
    const req = isEdit.value
      ? updateCategory(editingId.value!, params)
      : createCategory(params)
    req.then(() => {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
      fetchList()
    })
  })
}

function handleDelete(row: AssetCategory) {
  ElMessageBox.confirm(`确定删除分类「${row.categoryName}」吗？`, '提示', {
    type: 'warning',
  }).then(() => {
    deleteCategory(row.categoryId).then(() => {
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
