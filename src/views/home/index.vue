<template>
  <div class="home-page">
    <div class="welcome-card">
      <h3>欢迎使用 AMS 资产管理系统</h3>
      <p>登录成功，鉴权已打通。深靛蓝 + 暖金配色，沉稳商务风格。</p>
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
  </div>
</template>

<script setup lang="ts">
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
</style>
