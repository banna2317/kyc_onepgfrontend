import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import Payouts from '@/pages/Payouts.vue'
import MerchantWallet from '@/pages/MerchantWallet.vue'
import MerchantReports from '@/pages/MerchantReports.vue'
import MerchantBeneficiaries from '@/pages/MerchantBeneficiaries.vue'
import Settings from '@/pages/Settings.vue'
import Login from '@/pages/Login.vue'
import { useAuthStore } from '@/stores/auth'  // 👈 import auth store

const routes = [
  { path: '/', name: 'home', component: HomePage, meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: Login, meta: { layout: 'auth' } },
  { path: '/transactions', name: 'Transactions', component: Payouts, meta: { requiresAuth: true } },
  { path: '/wallet', name: 'wallet', component: MerchantWallet, meta: { requiresAuth: true } },
  { path: '/reports', name: 'reports', component: MerchantReports, meta: { requiresAuth: true } },
  { path: '/beneficiary', name: 'beneficiary', component: MerchantBeneficiaries, meta: { requiresAuth: true } },
  { path: '/settings', name: 'settings', component: Settings, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 🛡️ Authentication Guard
router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  // Only fetch user once per app load
  if (!auth.user && to.meta.requiresAuth) {
    await auth.getUser()
  }

  // Redirect unauthenticated users to login
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login')
  }

  // Prevent logged-in users from going back to login
  if (to.path === '/login' && auth.isAuthenticated) {
    return next('/')
  }

  next()
})

export default router
