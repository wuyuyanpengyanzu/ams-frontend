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
  console.log('[Router] All glob keys:', Object.keys(modules))
  console.log('[Router] Adding routes to layout:', layoutName, moduleRoutes)
  moduleRoutes.forEach(r => router.addRoute(layoutName, r))
  console.log('[Router] Routes after add:', router.getRoutes().map(r => ({ name: r.name, path: r.path })))
}

function buildRoutes(menus: MenuInfo[], parentPath = ''): RouteRecordRaw[] {
  return menus
    .filter(m => m.menuType !== 'F')
    .map(m => {
      const fullPath = m.path || ''
      // 子路由移除父路径前缀，得到相对路径
      let relPath: string
      if (parentPath && fullPath.startsWith(parentPath + '/')) {
        relPath = fullPath.slice(parentPath.length + 1) // e.g. "user"
      } else if (parentPath && fullPath === parentPath) {
        relPath = '' // same path as parent, rare
      } else {
        relPath = fullPath.replace(/^\//, '') // root-level menu
      }
      const route: RouteRecordRaw = {
        path: relPath,
        name: m.menuName,
        meta: {
          title: m.menuName,
          icon: m.icon || undefined,
          hidden: m.path?.includes(':id') || undefined,
        },
        children: m.children ? buildRoutes(m.children, fullPath) : undefined,
      }
      // 菜单类型 (C) 有 component，目录类型 (M) 仅作为容器
      if (m.menuType === 'C' && m.component) {
        const key = `/src/views/${m.component}.vue`
        route.component = modules[key]
        console.log(`[Router] menu=${m.menuName}, key=${key}, found=${!!route.component}`)
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

router.beforeEach(async (to, _from, next) => {
  const token = sessionStorage.getItem('satoken')

  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
    return
  }

  if (to.path === '/login' && token) {
    next('/')
    return
  }

  // 刷新后动态路由丢失，需要重新加载
  if (token) {
    const { useMenuStore } = await import('@/stores/menu')
    const menuStore = useMenuStore()
    if (!menuStore.loaded) {
      try {
        const menus = await menuStore.fetchMenu()
        addDynamicRoutes(menus)
        // 路由已添加，重新导航到目标路径
        next({ ...to, replace: true })
        return
      } catch {
        next('/login')
        return
      }
    }
  }

  next()
})

export default router
