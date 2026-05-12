<template>
  <div class="home-page">
    <h1>欢迎使用 AMS 资产管理系统</h1>
    <p>登录成功，鉴权已打通。</p>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;

  h1 {
    font-size: 24px;
    color: #303133;
  }

  p {
    margin-top: 12px;
    color: #909399;
  }
}
</style>
