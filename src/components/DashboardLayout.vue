<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter, RouterLink, RouterView } from "vue-router";
import {
  BarChart3,
  Shield,
  Workflow,
  Video,
  AlertTriangle,
  Settings,
  Webhook,
  Key,
  CreditCard,
  Activity,
  FileText,
  Menu,
  X,
  Search,
  Bell,
  User,
  ChevronDown,
  Moon,
  Sun,
  Grid3X3,
  Zap,
  Building2,
  Lock,
  ChevronRight,
} from "lucide-vue-next";
import axios from "../axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Logo } from "@/components/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuthStore } from "@/stores/auth";

const sidebarOpen = ref(false);
const expandedGroups = ref<Record<string, boolean>>({
  // "Bank Account": true,
  // "Aadhaar/PAN": true,
});

const route = useRoute();
const router = useRouter();
const { signOut } = useAuthStore();

const username = ref("")

const mainNavItems = [
  { name: "Overview", href: "/app", icon: BarChart3 },
];

const serviceGroups = [
  {
    title: "Corporate",
    icon: Lock,
    items: [
      { name: "Company Info", href: "/app/services/company", icon: User },
      { name: "DIN Info", href: "/app/services/din", icon: User },
      { name: "GSTIN", href: "/app/services/gstin", icon: User },

    ],
  },
  {
    title: "Voter",
    icon: Lock,
    items: [
      { name: "Voter", href: "/app/services/voter", icon: User },

    ],
  },
  {
    title: "License",
    icon: Lock,
    items: [
      { name: "License", href: "/app/services/license", icon: User },

    ],
  },
  {
    title: "RC",
    icon: Lock,
    items: [
      { name: "RC Full", href: "/app/services/rc-full", icon: User },
      { name: "RC Special", href: "/app/services/rc-special", icon: User },
      { name: "RC With Mobilel", href: "/app/services/rc-mobile", icon: User },
      { name: "Engine To RC", href: "/app/services/rc-engine", icon: User },
      { name: "Fastag", href: "/app/services/fastag", icon: User },
    ],
  },
  {
    title: "PANCARD",
    icon: Lock,
    items: [
      { name: "PAN Lite", href: "/app/services/pan-lite", icon: User },
      { name: "PAN Aadhaar Linked", href: "/app/services/pan-adhaar-link", icon: User },
      { name: "PAN Verification", href: "/app/services/pan-verification", icon: User },
      { name: "PAN Link", href: "/app/services/pan-link", icon: User },
      { name: "PAN Masked", href: "/app/services/pan-masked", icon: User },
      { name: "PAN With DOB", href: "/app/services/pan-dob", icon: User },
      { name: "PAN Advance", href: "/app/services/pan-advance", icon: User },

    ],
  },
  {
    title: "Bank Account",
    icon: Building2,
    items: [
      { name: "Bank Account - Verification Penny Drop", href: "/app/services/Verification-penny", icon: CreditCard },
      { name: "Bank Account - Mobile To UPI", href: "/app/services/mobile-to-upi", icon: CreditCard },
      { name: "Bank Account - Mobile To UPI Advance", href: "/app/services/mobile-upi-advance", icon: CreditCard },
      { name: "Bank Account", href: "/app/services/bank-verification", icon: CreditCard },
      { name: "Bank Account - Reverse Penny Less", href: "/app/services/verification-less", icon: CreditCard },
      { name: "UPI", href: "/app/services/upi-verification", icon: Building2 },
      { name: "IFSC-Verification", href: "/app/services/ifsc-verification", icon: Building2 },
    ],
  },
  {
    title: "Aadhaar",
    icon: Lock,
    items: [
      { name: "Aadhaar", href: "/app/services/aadhaarcard", icon: User },
      { name: "Aadhaar-validation", href: "/app/services/aadhaar-validation", icon: User },
      // { name: "Aadhaar OKYC", href: "/app/services/aadhaar-okyc", icon: User },
      // { name: "Aadhaar Masking", href: "/app/services/aadhaar-masking", icon: User },
      // { name: "DigiLocker - Aadhaar", href: "/app/services/digilocker-aadhaar", icon: Lock },
      // { name: "PAN", href: "/app/services/pan-lite", icon: FileText },
      // { name: "PAN 360", href: "/app/services/pan-360", icon: FileText },
      // { name: "PAN Lite", href: "/app/services/pan-lite", icon: FileText },
    ],
  },

];

const bottomNavItems = [
  { name: "IP Whitelist", href: "/app/webhooks", icon: Webhook },
  { name: "API Keys", href: "/app/api-keys", icon: Key },
  { name: "Billing", href: "/app/billing", icon: CreditCard },
  { name: "Settings", href: "/app/settings", icon: Settings },
  { name: "Docs", href: "/docs", icon: FileText },
];

const isActive = (href: string) => {
  if (href === "/app") return route.path === "/app";
  return route.path.startsWith(href);
};

onMounted(async () => {
  try {

    
    const response = await axios.post("/user");
    username.value = response.data.user;
   
  } catch (error: any) {
    console.error(error.response?.data?.message || error.message || "API call failed");
  }
});

const handleSignOut = async () => {
  await signOut();
  router.push("/login");
};
</script>

<template>
  <div class="min-h-screen flex flex-col lg:flex-row bg-background">
    <!-- Mobile Sidebar Overlay -->
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-black/10 lg:hidden" @click="sidebarOpen = false" />

    <!-- Sidebar -->
    <div
      class="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-glass backdrop-blur-xl border-r border-border/50 overflow-y-auto
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'">
      <div class="flex items-center justify-between h-16 px-6 border-b border-border/50">
        <span class="font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          OnePG
        </span>
        <Button variant="ghost" size="sm" class="lg:hidden" @click="sidebarOpen = false">
          <X class="h-5 w-5" />
        </Button>
      </div>

      <nav class="flex-1 px-4 py-6 space-y-2">
        <!-- Main Nav -->
        <RouterLink v-for="item in mainNavItems" :key="item.name" :to="item.href"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200" :class="isActive(item.href)
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'" @click="sidebarOpen = false">
          <component :is="item.icon" class="mr-3 h-5 w-5" />
          {{ item.name }}
        </RouterLink>

        <!-- Service Groups -->
        <Collapsible v-for="group in serviceGroups" :key="group.title" :open="expandedGroups[group.title]"
          @update:open="val => expandedGroups[group.title] = val">
          <CollapsibleTrigger as-child>
            <button
              class="flex items-center w-full px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200">
              <component :is="group.icon" class="mr-3 h-5 w-5" />
              {{ group.title }}
              <ChevronRight class="ml-auto h-4 w-4 transition-transform duration-200"
                :class="{ 'rotate-90': expandedGroups[group.title] }" />
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent class="ml-6 space-y-1">
            <RouterLink v-for="item in group.items" :key="item.name" :to="item.href"
              class="flex items-center px-4 py-2 text-sm rounded-lg transition-all duration-200" :class="isActive(item.href)
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'" @click="sidebarOpen = false">
              <component :is="item.icon" class="mr-3 h-4 w-4" />
              {{ item.name }}
            </RouterLink>
          </CollapsibleContent>
        </Collapsible>

        <div class="my-4 border-t border-border/50" />

        <!-- Bottom Nav -->
        <RouterLink v-for="item in bottomNavItems" :key="item.name" :to="item.href"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200" :class="isActive(item.href)
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'" @click="sidebarOpen = false">
          <component :is="item.icon" class="mr-3 h-5 w-5" />
          {{ item.name }}
        </RouterLink>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header
        class="h-16 bg-gradient-glass backdrop-blur-xl border-b border-border/50 flex items-center justify-between px-6">
        <div class="flex items-center space-x-4">
          <Button variant="ghost" size="sm" class="lg:hidden" @click="sidebarOpen = true">
            <Menu class="h-5 w-5" />
          </Button>

          <!-- Org Selector -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" class="hidden md:flex items-center space-x-2">
                <span class="text-sm font-medium">Acme Finserve</span>
                <ChevronDown class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-56">
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              <DropdownMenuItem>
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                    <span class="text-xs font-bold text-primary-foreground">A</span>
                  </div>
                  <span>Acme Finserve</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-muted-foreground">
                Switch Organization...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <!-- Search -->
       
        </div>

        <div class="flex items-center space-x-4">
          <!-- Notifications -->
          <Button variant="ghost" size="sm" class="h-9 w-9 relative">
            <Bell class="h-4 w-4" />
            <span
              class="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-[10px] leading-none rounded-full flex items-center justify-center font-medium">
              3
            </span>
          </Button>

          <!-- Profile Menu -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="sm" class="h-9 w-9">
                <User class="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56">
              <DropdownMenuLabel> {{ username?.name }}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem @select="router.push('/app/settings')">Profile Settings</DropdownMenuItem>
              <DropdownMenuItem @select="router.push('/app/billing')">Billing</DropdownMenuItem>
              <DropdownMenuItem @select="router.push('/app/api-keys')">API Keys</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-destructive" @select="handleSignOut">
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 overflow-auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>
