<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

// Props
interface SidebarItem {
  name: string;
  href: string;
  icon: any;
  active?: boolean;
  badge?: string;
}

interface DashboardLayoutProps {
  sidebarItems: SidebarItem[];
  userType: "merchant" | "admin" | "ops";
}

const props = defineProps<DashboardLayoutProps>();

// State
const isMobileMenuOpen = ref(false);
const showDropdown = ref(false); // ✅ Added
const router = useRouter();

// Simulated Auth (replace with your real composable)
const signOut = async () => {
  console.log("Signing out...");
  router.push("/auth");
};

// Get user info based on userType
const user = computed(() => {
  switch (props.userType) {
    case "admin":
      return { name: "Admin User", email: "admin@onepg.com", initials: "AU", role: "System Admin" };
    case "ops":
      return { name: "Operations Manager", email: "ops@onepg.com", initials: "OM", role: "Operations" };
    default:
      return { name: "John Doe", email: "john@company.com", initials: "JD", role: "Merchant" };
  }
});
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Top Header -->
    <header class="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div class="flex h-16 items-center justify-between px-4 lg:px-6">
        <!-- Left side -->
        <div class="flex items-center space-x-4">
          <button class="lg:hidden p-2 rounded-md hover:bg-accent" @click="isMobileMenuOpen = !isMobileMenuOpen">
            <MenuIcon :is="isMobileMenuOpen ? 'XIcon' : 'MenuIcon'" class="h-5 w-5" />
          </button>

          <div class="flex items-center space-x-2">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Building2 :is="'Building2Icon'" class="h-5 w-5 text-white" />
            </div>
            <span class="font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              OnePG Payout
            </span>
          </div>
        </div>

        <!-- Center - Search -->
        <div class="hidden md:flex flex-1 max-w-md mx-8">
          <div class="relative w-full">
            <SearchIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="search" placeholder="Search payouts, beneficiaries..."
              class="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring" />
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center space-x-4">
          <button class="relative p-2 rounded-md hover:bg-accent">
            <BellIcon class="h-5 w-5" />
            <span
              class="absolute -top-1 -right-1 h-5 w-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">3</span>
          </button>

          <!-- User dropdown -->
          <div class="relative" @click="showDropdown = !showDropdown">
            <div class="flex items-center space-x-2 cursor-pointer">
              <div class="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                {{ user.initials }}
              </div>
              <div class="hidden md:block text-left">
                <div class="text-sm font-medium">{{ user.name }}</div>
                <div class="text-xs text-muted-foreground">{{ user.role }}</div>
              </div>
              <ChevronDownIcon class="h-4 w-4" />
            </div>

            <!-- Dropdown Menu -->
            <div v-if="showDropdown"
              class="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-md shadow-md z-50">
              <div class="px-4 py-2 text-sm font-medium border-b border-border">
                My Account
              </div>
              <button class="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                @click="router.push('/dashboard/merchant/settings')">
                <UserIcon class="h-4 w-4 mr-2" /> Profile
              </button>
              <button class="flex items-center w-full px-4 py-2 text-sm hover:bg-accent"
                @click="router.push('/dashboard/merchant/settings')">
                <SettingsIcon class="h-4 w-4 mr-2" /> Settings
              </button>
              <div class="border-t border-border my-1" />
              <button class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50" @click="signOut">
                <LogOutIcon class="h-4 w-4 mr-2" /> Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="flex min-h-screen h-full">
      <!-- Sidebar -->
      <aside :class="[
        'fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-card transform transition-transform lg:translate-x-0 lg:static lg:inset-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      ]" style="top: 64px">
        <nav class="p-4 space-y-2">
          <RouterLink v-for="(item, index) in props.sidebarItems" :key="index" :to="item.href"
            class="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors  " :class="[
              item.active
                ? 'bg-primary text-primary-foreground'
               : 'text-foreground hover:bg-[#00BDA4] hover:text-primary-foreground transition-colors duration-300'


            ]">
            <div class="flex items-center space-x-3">
              <component :is="item.icon" class="h-4 w-4" />
              <span>{{ item.name }}</span>
            </div>
            <span v-if="item.badge"
              class="ml-auto bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {{ item.badge }}
            </span>
          </RouterLink>
        </nav>
      </aside>

      <!-- Overlay -->
      <div v-if="isMobileMenuOpen" class="fixed inset-0 z-30 bg-black/50 lg:hidden" @click="isMobileMenuOpen = false" />

      <!-- Main -->
      <main class="flex-1 lg:ml-0 p-4 lg:p-6">
        <RouterView />
      </main>
    </div>

  </div>
</template>

<script lang="ts">
// Icons (use lucide-vue-next or Heroicons)
import {
  BellIcon,
  SearchIcon,
  SettingsIcon,
  UserIcon,
  LogOutIcon,
  ChevronDownIcon,
  MenuIcon,
  XIcon,
  Building2,
} from "lucide-vue-next";
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(to right, #4f46e5, #9333ea);
}
</style>
