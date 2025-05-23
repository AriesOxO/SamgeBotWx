import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/index.vue'),
    meta: { title: '仪表盘', icon: 'dashboard' }
  },
  {
    path: '/comments',
    name: 'Comments',
    component: () => import('@/views/comments/index.vue'),
    meta: { title: '评论管理', icon: 'comment' }
  },
  {
    path: '/novels',
    name: 'Novels',
    component: () => import('@/views/novels/index.vue'),
    meta: { title: '小说管理', icon: 'novel' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/settings/index.vue'),
    meta: { title: '系统设置', icon: 'setting' }
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
