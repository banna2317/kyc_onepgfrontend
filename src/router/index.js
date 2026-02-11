import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import axios from "../axios";
// new
import Login from "@/pages/Login.vue";
import { useAuthStore } from "@/stores/auth";
import OverviewPage from "@/pages/dashboard/OverviewPage.vue";
import DashboardLayout from "@/components/DashboardLayout.vue";
import BankVerificationPage from "@/pages/dashboard/BankVerificationPage.vue";
import ReversePennyPage from "@/pages/dashboard/ReversePennyPage.vue";
import VerificationPennyPage from "@/pages/dashboard/VerificationPennyPage.vue";
import UpiVerificationPage from "@/pages/dashboard/UpiVerificationPage.vue";
import AadhaarOKYCPage from "@/pages/dashboard/AadhaarOKYCPage.vue";
import AadhaarMaskingPage from "@/pages/dashboard/AadhaarMaskingPage.vue";
import DigiLockerAadhaarPage from "@/pages/dashboard/DigiLockerAadhaarPage.vue";
import DashboardServicesPage from "@/pages/dashboard/ServicesPage.vue";
import PANVerificationPage from "@/pages/dashboard/PANVerificationPage.vue";
import WebhooksPage from "@/pages/dashboard/WebhooksPage.vue";
import APIKeysPage from "@/pages/dashboard/APIKeysPage.vue";
import BillingPage from "@/pages/dashboard/BillingPage.vue";
import SettingsPage from "@/pages/dashboard/SettingsPage.vue";
import DocsPage from "@/pages/DocsPage.vue";
import Navigation from "@/components/Navigation.vue";
import MobileToUpi from "@/pages/dashboard/MobileToUpi.vue";
import MobileToUpiAdvance from "@/pages/dashboard/MobileToUpiAdvance.vue";
import IFSCVerificationPage from "@/pages/dashboard/IFSCVerificationPage.vue";
import PaneLiteVerification from "@/pages/dashboard/PaneLiteVerification.vue";
import PanAdhaarLink from "@/pages/dashboard/PanAdhaarLink.vue";
import PanCardVerification from "@/pages/dashboard/PanCardVerification.vue";
import PanLinkVerificationPage from "@/pages/dashboard/PanLinkVerificationPage.vue";
import PanMaskedVerificationPage from "@/pages/dashboard/PanMaskedVerificationPage.vue";
import PanDobVerificationPage from "@/pages/dashboard/PanDobVerificationPage.vue";
import PanAdvanceVerificationPage from "@/pages/dashboard/PanAdvanceVerificationPage.vue";

import RcFullVerificationPage from "@/pages/dashboard/RcFullVerificationPage.vue";
import RcSpecialVerificationPage from "@/pages/dashboard/RcSpecialVerificationPage.vue";
import RcMobileVerificationPage from "@/pages/dashboard/RcMobileVerificationPage.vue";
import RcEngineVerificationPage from "@/pages/dashboard/RcEngineVerificationPage.vue";
import FastagVerificationPage from "@/pages/dashboard/FastagVerificationPage.vue";

import AadhaarVerificationPage from "@/pages/dashboard/AadhaarVerificationPage.vue";
import AadhaarVelidationPage from "@/pages/dashboard/AadhaarVelidationPage.vue";


import VoterVerificationPage from "@/pages/dashboard/VoterVerificationPage.vue";
import LicenseVerificationPage from "@/pages/dashboard/LicenseVerificationPage.vue";
import CompanyVerificationPage from "@/pages/dashboard/CompanyVerificationPage.vue";

import DinVerificationPage from "@/pages/dashboard/DinVerificationPage.vue";
import GstinVerificationPage from "@/pages/dashboard/GstinVerificationPage.vue";
import OnboardingPage from "@/pages/OnboardingPage.vue";
// new

const routes = [
  { path: "/", name: "home", component: HomePage, meta: { requiresAuth: true } },


  // new
  { path: "/login", name: "login", component: Login, meta: { layout: "auth" } },
  { path: "/onboarding", name: "onboarding", component: OnboardingPage, meta: { requiresAuth: false } },
  { path: "/docs", name: "docs", component: DocsPage, meta: { requiresAuth: true } },

  {
    path: "/app",
    component: DashboardLayout,
    meta: { requiresAuth: true, requiresVerification: true },
    children: [
      { path: "", name: "overview", component: OverviewPage },
      { path: "services/company", component: CompanyVerificationPage },
      { path: "services/din", component: DinVerificationPage },
      { path: "services/gstin", component: GstinVerificationPage },
      { path: "services/bank-verification", component: BankVerificationPage },
      { path: "services/voter", component: VoterVerificationPage },
      { path: "services/license", component: LicenseVerificationPage },
      { path: "services/mobile-to-upi", component: MobileToUpi },
      { path: "services/mobile-upi-advance", component: MobileToUpiAdvance },
      { path: "services/verification-less", component: ReversePennyPage },
      { path: "services/Verification-penny", component: VerificationPennyPage },
      { path: "services/upi-verification", component: UpiVerificationPage },
      { path: "services/ifsc-verification", component: IFSCVerificationPage },
      { path: "services/aadhaar-okyc", component: AadhaarOKYCPage },
      { path: "services/aadhaarcard", component: AadhaarVerificationPage },
      { path: "services/aadhaar-validation", component: AadhaarVelidationPage },
      { path: "services/aadhaar-masking", component: AadhaarMaskingPage },
      { path: "services/digilocker-aadhaar", component: DigiLockerAadhaarPage },
      { path: "services/:serviceId", component: DashboardServicesPage },
      { path: "services/pan-360", component: PANVerificationPage },
      { path: "services/pan-lite", component: PaneLiteVerification },
      { path: "services/pan-adhaar-link", component: PanAdhaarLink },
      { path: "services/pan-verification", component: PanCardVerification },
      { path: "services/pan-link", component: PanLinkVerificationPage },
      { path: "services/pan-masked", component: PanMaskedVerificationPage },
      { path: "services/pan-dob", component: PanDobVerificationPage },
      { path: "services/pan-advance", component: PanAdvanceVerificationPage },
      { path: "services/rc-full", component: RcFullVerificationPage },
      { path: "services/rc-special", component: RcSpecialVerificationPage },
      { path: "services/rc-mobile", component: RcMobileVerificationPage },
      { path: "services/rc-engine", component: RcEngineVerificationPage },
      { path: "services/fastag", component: FastagVerificationPage },
      { path: "webhooks", component: WebhooksPage },
      { path: "api-keys", component: APIKeysPage },
      { path: "billing", component: BillingPage },
      { path: "settings", component: SettingsPage },
    ],
  },



  { path: "/dashboard", name: "dashboard", component: HomePage, meta: { requiresAuth: true } },
  // new
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

let initialized = false;

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (authStore.loading) {
    await authStore.initAuth();
  }

  if (
    to.meta.requiresAuth &&
    (!authStore.user ||
      (to.meta.requiresVerification && !authStore.isVerified))
  ) {
    return next({ name: "login" });
  }

  if (to.name === "login" && authStore.user && authStore.isVerified) {
    return next({ name: "home" });
  }

  next();
});

export default router;
