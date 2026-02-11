<template>
  <RouterView />
</template>


<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import DashboardLayout from "./components/DashboardLayout.vue";
import AuthLayout from "@/components/AuthLayout.vue";
import { 
  BarChart3, 
  CreditCardIcon, 
  SettingsIcon, 
  WalletIcon,
  LayoutDashboard,
  UsersIcon
} from "lucide-vue-next";
import { Toaster } from "vue-sonner";

// Base sidebar items
const sidebarItems = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Payouts", href: "/transactions", icon: CreditCardIcon, badge: 12 },
  { name: "Wallet", href: "/wallet", icon: WalletIcon },
  { name: "Beneficiary", href: "/beneficiary", icon: UsersIcon },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

const route = useRoute();

// Dynamically mark the active item
const computedSidebarItems = computed(() =>
  sidebarItems.map((item) => ({
    ...item,
    active: route.path === item.href,
  }))
);

// Dynamically select layout component
const layoutComponent = computed(() => {
  switch (route.meta.layout) {
    case "auth":
      return AuthLayout;
    case "dashboard":
    default:
      return DashboardLayout;
  }
});

// Pass sidebar items only for DashboardLayout
const layoutProps = computed(() => {
  if (layoutComponent.value === DashboardLayout) {
    return { sidebarItems: computedSidebarItems.value };
  }
  return {}; // No props for AuthLayout
});
</script>
