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
  if (to.meta.requiresAuth && !authService.isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

export default router
