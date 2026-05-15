import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// 扩展 RouteMeta 类型
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    icon?: string
    requiresAuth?: boolean
    hidden?: boolean
  }
}

// ====== 组件映射表：glob import 所有 views 下的 .vue 文件 ======
const modules = import.meta.glob('/src/views/**/*.vue')

/** 将 DB 菜单树转为 Vue Router 路由，动态 addRoute 到根布局下 */
export function addDynamicRoutes(menus: MenuInfo[]) {
  const layout = router.getRoutes().find(r => r.name === 'Layout')
  const layoutName = layout?.name?.toString() || ''
  const moduleRoutes = buildRoutes(menus)
  moduleRoutes.forEach(r => router.addRoute(layoutName, r))
}

function buildRoutes(menus: MenuInfo[]): RouteRecordRaw[] {
  return menus
    .filter(m => m.menuType !== 'F')
    .map(m => {
      const route: RouteRecordRaw = {
        path: m.path!.replace(/^\//, ''),
        name: m.menuName,
        meta: { title: m.menuName, icon: m.icon || undefined },
        children: m.children ? buildRoutes(m.children) : undefined,
      }
      // 菜单类型 (C) 有 component，目录类型 (M) 仅作为容器
      if (m.menuType === 'C' && m.component) {
        route.component = modules[`/src/views/${m.component}.vue`]
      }
      return route
    })
}

// ====== 静态路由（仅 login 和 layout shell + home） ======
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/AdminLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页', icon: 'HomeFilled' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = sessionStorage.getItem('satoken')

  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router
