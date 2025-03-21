import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/dashboard',
      name: 'layout',
      component: () => import('../views/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/Dashboard.vue')
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/Users.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('../views/Profile.vue')
        },
        {
          path: 'notices',
          name: 'notices',
          component: () => import('../views/Notices.vue')
        },
        {
          path: 'todos',
          name: 'todos',
          component: () => import('../views/Todos.vue')
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue')
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next({ name: 'login' })
      return
    }

    if (to.matched.some(record => record.meta.requiresAdmin)) {
      if (authStore.user?.role !== 'admin') {
        next({ name: 'dashboard' })
        return
      }
    }
  }

  next()
})

export default router 