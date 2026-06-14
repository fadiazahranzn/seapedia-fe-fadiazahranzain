import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', redirect: '/login' },

  // Auth
  { path: '/login', component: () => import('@/views/auth/LoginView.vue'), meta: { guest: true } },
  { path: '/register', component: () => import('@/views/auth/RegisterView.vue'), meta: { guest: true } },

  // Buyer
  {
    path: '/buyer',
    component: () => import('@/layouts/BuyerLayout.vue'),
    meta: { auth: true, role: 'buyer' },
    children: [
      { path: '', redirect: '/buyer/home' },
      { path: 'home', component: () => import('@/views/buyer/HomeView.vue') },
    ],
  },

  // Seller
  {
    path: '/seller',
    component: () => import('@/layouts/SellerLayout.vue'),
    meta: { auth: true, role: 'seller' },
    children: [
      { path: '', redirect: '/seller/dashboard' },
      { path: 'dashboard', component: () => import('@/views/seller/DashboardView.vue') },
    ],
  },

  // Driver
  {
    path: '/driver',
    component: () => import('@/layouts/DriverLayout.vue'),
    meta: { auth: true, role: 'driver' },
    children: [
      { path: '', redirect: '/driver/jobs' },
      { path: 'jobs', component: () => import('@/views/driver/JobsView.vue') },
    ],
  },

  // Admin
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { auth: true, role: 'admin' },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', component: () => import('@/views/admin/DashboardView.vue') },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/login' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.meta.auth && !auth.isLoggedIn) return '/login'
  if (to.meta.guest && auth.isLoggedIn) return `/${auth.activeRole}`
  if (to.meta.role && auth.activeRole !== to.meta.role) return `/${auth.activeRole}`
})

export default router
