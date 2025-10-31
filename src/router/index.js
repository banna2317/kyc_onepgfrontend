import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import Payouts from '@/pages/Payouts.vue'
import MerchantWallet from '@/pages/MerchantWallet.vue'
import MerchantReports from '@/pages/MerchantReports.vue'
import MerchantBeneficiaries from '@/pages/MerchantBeneficiaries.vue'
import Settings from '@/pages/Settings.vue'
import Login from '@/pages/Login.vue'
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
    {
    path: '/login',
    name: 'login',
    component: Login,
     meta: { layout: "auth" },
  },
    {
    path: '/transactions',
    name: 'Transactions',
    component: Payouts,
  },
      {
    path: '/wallet',
    name: 'wallet',
    component: MerchantWallet,
  },
        {
    path: '/reports',
    name: 'reports',
    component: MerchantReports,
  },

        {
    path: '/beneficiary',
    name: 'beneficiary',
    component: MerchantBeneficiaries,
  },
          {
    path: '/settings',
    name: 'settings',
    component: Settings,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
