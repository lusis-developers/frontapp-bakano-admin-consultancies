import { createRouter, createWebHistory } from 'vue-router'
import authService from '@/services/authService'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/client/:clientId',
      component: () => import('../views/client.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/client/:clientId/businesses',
      name: 'businesses', // ← este nombre debe coincidir
      component: () => import('../views/businesses/index.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/client/:clientId/business/:businessId',
      name: 'businessDetails',
      component: () => import('../views/businesses/business.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = authService.isAuthenticated()

  // Redirigir a dashboard si ya está autenticado y va a la raíz (/)
  if (to.path === '/' && isLoggedIn) {
    next('/dashboard')
    return
  }

  // Si la ruta requiere autenticación y no está autenticado
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
    return
  }

  next()
})

export default router
