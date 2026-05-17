<template>
  <div class="page-card">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-select v-model="query.days" style="width: 140px" @change="handleSearch">
          <el-option :value="7" label="7天内到期" />
          <el-option :value="30" label="30天内到期" />
          <el-option :value="90" label="90天内到期" />
          <el-option :value="-1" label="已过期" />
        </el-select>
        <el-select v-model="query.categoryId" placeholder="分类" clearable style="width: 140px" @change="handleSearch">
          <el-option v-for="cat in categories" :key="cat.categoryId" :label="cat.categoryName" :value="cat.categoryId" />
        </el-select>
        <el-input
          v-model="query.department"
          placeholder="部门"
          clearable
          style="width: 140px"
          @keyup.enter="handleSearch"
        />
        <el-input
          v-model="query.keyword"
          placeholder="编号/名称"
          clearable
          style="width: 160px"
          @keyup.enter="handleSearch"
        />
        <el-button @click="handleSearch">查询</el-button>
      </div>
    </div>

    <el-table :data="list" border stripe v-loading="loading" :row-class-name="rowClassName">
      <el-table-column prop="assetCode" label="资产编号" min-width="130" />
      <el-table-column prop="assetName" label="资产名称" min-width="140" />
      <el-table-column prop="categoryName" label="分类" min-width="100" />
      <el-table-column prop="model" label="型号" min-width="110" show-overflow-tooltip />
      <el-table-column prop="department" label="部门" min-width="100" />
      <el-table-column prop="purchaseDate" label="购置日期" min-width="110" />
      <el-table-column prop="warrantyMonths" label="质保月数" width="90" align="center">
        <template #default="{ row }">
          {{ row.warrantyMonths ? row.warrantyMonths + '月' : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="质保到期日" min-width="120">
        <template #default="{ row }">
          <span :class="{ 'expired-text': isExpired(row) }">{{ row.warrantyExpiryDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="资产状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="StatusEnum[row.status]?.type ?? 'info'" size="small">
            {{ StatusEnum[row.status]?.text ?? row.status }}
          </el-tag>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getWarrantyExpiring } from '@/api/asset'
import { getCategoryList } from '@/api/category'

const StatusEnum: Record<number, { text: string; type: string }> = {
  0: { text: '闲置', type: 'info' },
  1: { text: '领用', type: 'success' },
  2: { text: '维修', type: 'warning' },
  3: { text: '报废', type: 'danger' },
}

const list = ref<WarrantyItem[]>([])
const loading = ref(false)
const total = ref(0)
const categories = ref<AssetCategory[]>([])

const query = reactive<WarrantyQueryParams>({ current: 1, size: 10, days: 30 })

function fetchList() {
  loading.value = true
  getWarrantyExpiring({ ...query })
    .then((data) => { list.value = data.records; total.value = data.total })
    .finally(() => (loading.value = false))
}

function handleSearch() {
  query.current = 1
  fetchList()
}

function isExpired(row: WarrantyItem) {
  return row.warrantyExpiryDate && new Date(row.warrantyExpiryDate) < new Date()
}

function rowClassName({ row }: { row: WarrantyItem }) {
  if (isExpired(row)) return 'expired-row'
  return ''
}

onMounted(() => {
  getCategoryList().then((data) => (categories.value = data))
  fetchList()
})
</script>

<style scoped>
.page-card { background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 20px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.toolbar-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
.expired-text { color: #f56c6c; font-weight: 600; }

:deep(.el-table .expired-row) {
  --el-table-tr-bg-color: var(--el-color-danger-light-9);
}
</style>
