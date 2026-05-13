<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="admin-aside">
      <div class="sidebar-logo" @click="toggleCollapse">
        <span class="logo-icon">A</span>
        <span v-show="!isCollapse" class="logo-text">AMS</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        router
        background-color="transparent"
        text-color="rgba(255,255,255,0.55)"
        active-text-color="#c9a44b"
        class="sidebar-menu"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <el-menu-item v-if="!route.children || route.children.length === 0" :index="'/' + route.path">
            <el-icon v-if="route.meta?.icon"><component :is="route.meta!.icon" /></el-icon>
            <template #title>{{ route.meta?.title }}</template>
          </el-menu-item>
          <el-sub-menu v-else :index="route.path">
            <template #title>
              <el-icon v-if="route.meta?.icon"><component :is="route.meta!.icon" /></el-icon>
              <span>{{ route.meta?.title }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children.filter(c => !c.meta?.hidden)"
              :key="child.path"
              :index="'/' + route.path + '/' + child.path"
            >
              <el-icon v-if="child.meta?.icon"><component :is="child.meta.icon" /></el-icon>
              <template #title>{{ child.meta?.title }}</template>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-aside>

    <!-- 右侧内容 -->
    <el-container class="main-container">
      <!-- 顶栏 -->
      <el-header class="admin-header">
        <div class="header-left">
          <span class="collapse-btn" @click="toggleCollapse">☰</span>
          <span class="breadcrumb">AMS / <em>{{ route.meta?.title || '首页概览' }}</em></span>
        </div>
        <div class="header-right">
          <span class="user-avatar">A</span>
          <span class="user-name">Admin</span>
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="content-area">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

const menuRoutes = computed(() => {
  return router.options.routes
    .find((r) => r.path === '/' && r.component)
    ?.children?.filter((c) => !c.meta?.hidden) || []
})

function toggleCollapse() {
  isCollapse.value = !isCollapse.value
}

function handleCommand(command: string) {
  if (command === 'logout') {
    userStore.clearToken()
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.admin-layout {
  height: 100vh;
}

/* ======== 侧边栏 ======== */
.admin-aside {
  background: linear-gradient(180deg, $deeper-blue 0%, $deep-blue 100%);
  transition: width 0.3s ease-out;
  overflow: hidden;
}

.sidebar-logo {
  height: $header-height;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  user-select: none;
}

.logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba($gold, 0.15);
  color: $gold;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  flex-shrink: 0;
}

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 2px;
}

/* ======== el-menu 覆盖 ======== */
.sidebar-menu {
  border-right: none;
  padding: 12px 8px;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    border-radius: $radius-sm;
    margin-bottom: 2px;
    height: 42px;
    line-height: 42px;
    font-size: 14px;

    &:hover {
      background: rgba(255, 255, 255, 0.06) !important;
      color: #fff;
    }
  }

  :deep(.el-menu-item.is-active) {
    color: $gold;
    background: rgba($gold, 0.12) !important;
  }

  :deep(.el-sub-menu .el-menu) {
    background: rgba(0, 0, 0, 0.15);
    border-radius: $radius-sm;
  }
}

/* ======== 右侧主区域 ======== */
.main-container {
  background: $bg-light;
}

/* ======== 顶栏 ======== */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid $border-color;
  padding: 0 20px;
  height: $header-height;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: $radius-sm;
  color: $text-secondary;
  font-size: 16px;
  transition: 0.2s ease-out;

  &:hover {
    background: $bg-light;
    color: $text-primary;
  }
}

.breadcrumb {
  font-size: 14px;
  color: $text-secondary;

  em {
    font-style: normal;
    color: $text-primary;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: $deep-blue;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.user-name {
  font-size: 13px;
  color: $text-primary;
  font-weight: 500;
}

.user-info {
  cursor: pointer;
  color: $text-secondary;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: 0.2s ease-out;

  &:hover {
    color: $text-primary;
  }
}

/* ======== 内容区 ======== */
.content-area {
  padding: 24px;
  overflow-y: auto;
}
</style>
