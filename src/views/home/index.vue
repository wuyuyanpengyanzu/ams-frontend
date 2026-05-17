<template>
  <div class="home-page">
    <div class="welcome-card">
      <h3>欢迎使用 AMS 资产管理系统</h3>
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">资产总数</div>
          <div class="stat-value">—</div>
          <div class="stat-hint">待接入数据</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">本月新增</div>
          <div class="stat-value">—</div>
          <div class="stat-hint">待接入数据</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">在线用户</div>
          <div class="stat-value">1</div>
          <div class="stat-hint">当前会话</div>
        </div>
      </div>
    </div>

    <div class="welcome-card" style="margin-top: 20px">
      <div class="card-header">
        <h3>质保预警</h3>
        <el-button type="primary" link @click="$router.push('/asset/warranty')">查看全部 →</el-button>
      </div>
      <div class="stats-row" style="grid-template-columns: repeat(2, 1fr)">
        <div class="stat-card stat-warn">
          <div class="stat-label">即将到期（30天内）</div>
          <div class="stat-value">{{ warranty.expiringSoon }}</div>
        </div>
        <div class="stat-card stat-danger">
          <div class="stat-label">已过期</div>
          <div class="stat-value">{{ warranty.expired }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getWarrantyDashboard } from '@/api/asset'

const warranty = ref({ expiringSoon: 0, expired: 0 })

onMounted(() => {
  getWarrantyDashboard().then((data) => { warranty.value = data })
})
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.home-page {
  max-width: 960px;
}

.welcome-card {
  background: #fff;
  border-radius: $radius;
  padding: 32px;
  box-shadow: $shadow-sm;

  h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 12px;
    color: $text-primary;
  }

  p {
    font-size: 14px;
    color: $text-secondary;
    line-height: 1.8;
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.stat-card {
  background: $bg-light;
  border-radius: $radius-sm;
  padding: 20px;
  border: 1px solid $border-color;

  .stat-label {
    font-size: 12px;
    color: $text-light;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: $deep-blue;
  }

  .stat-hint {
    font-size: 12px;
    color: $gold;
    margin-top: 4px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h3 {
    margin-bottom: 0;
  }
}

.stat-warn {
  border-left: 4px solid #e6a23c;
}

.stat-danger {
  border-left: 4px solid #f56c6c;
}
</style>
