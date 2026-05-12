<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="admin-aside">
      <div class="logo" @click="toggleCollapse">
        <span v-if="!isCollapse">AMS</span>
        <span v-else>A</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <el-menu-item v-if="!route.children || route.children.length === 0" :index="route.path">
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
              :index="route.path + '/' + child.path"
            >
              <el-icon v-if="child.meta?.icon"><component :is="child.meta.icon" /></el-icon>
              <template #title>{{ child.meta?.title }}</template>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-aside>

    <!-- 右侧内容 -->
    <el-container>
      <!-- 顶栏 -->
      <el-header class="admin-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              Admin <el-icon><ArrowDown /></el-icon>
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
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, Fold, Expand } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

// 获取 AdminLayout 的直接子路由作为菜单项
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

.admin-aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;

  .logo {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
  }
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 16px;

  .collapse-btn {
    font-size: 20px;
    cursor: pointer;
  }

  .user-info {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

:deep(.el-menu) {
  border-right: none;
}
</style>
