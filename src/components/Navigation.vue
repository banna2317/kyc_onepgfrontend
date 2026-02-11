<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Menu, X, LogOut, User } from "lucide-vue-next";
// import Logo from "./Logo.vue";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "./ui/dropdown-menu";
import { useAuthStore } from "@/stores/auth";

const isOpen = ref(false);
const openDropdown = ref<string | null>(null);
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const navItems = [
    { name: "Home", href: "/" },
    {
        name: "Services",
        subItems: [
            { name: "Payout", href: "/payout" },
            { name: "KYC", href: "/" },
        ],
    },
    { name: "Docs", href: "/app/docs" },
];

const scrolled = ref(false);
const user = computed(() => authStore.user);

const isActive = (href: string) => route.path === href;

const handleSignOut = async () => {
    await authStore.signOut();
    router.push("/auth");
};

// Navbar text color
const textColor = computed(() =>
    route.path !== "/" || scrolled.value ? "text-black" : "text-white"
);
</script>

<template>
    <nav
        :class="`fixed top-0 w-full z-50 ${route.path === '/' ? 'bg-transparent overflow-x-hidden' : 'bg-gradient-glass backdrop-blur-md border-b border-border/50'}`">
        <div class="container mx-auto px-2 sm:px-4 py-4">
            <div
                :class="route.path === '/' ? 'mx-auto flex items-center justify-between w-full max-w-[calc(100vw-16px)] sm:max-w-none min-w-0 h-14 md:h-20 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-4 md:px-8 overflow-hidden' : 'flex items-center justify-between min-w-0 h-16'">
                <!-- <Logo /> -->
                <span class="font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    OnePG
                </span>
                <!-- Desktop Navigation -->
                <div class="hidden md:flex items-center space-x-8">
                    <template v-for="item in navItems" :key="item.name">
                        <DropdownMenu v-if="item.subItems" :modal="false">
                            <DropdownMenuTrigger asChild>
                                <span class="cursor-pointer text-sm font-medium transition-colors hover:text-primary"
                                    :class="textColor">{{ item.name }}</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start"
                                class="bg-black text-white backdrop-blur-md shadow-lg border border-white/20 rounded-xl p-1 max-h-[60vh] overflow-auto">
                                <DropdownMenuItem v-for="sub in item.subItems" :key="sub.name"
                                    class="text-white hover:bg-white/10" @click="router.push(sub.href)">
                                    {{ sub.name }}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <router-link v-else :to="item.href"
                            class="text-sm font-medium transition-colors hover:text-primary"
                            :class="[isActive(item.href) ? 'text-primary' : textColor]">
                            {{ item.name }}
                        </router-link>
                    </template>
                </div>

                <!-- Desktop CTA Buttons -->
                <div class="hidden md:flex items-center space-x-4">
                    <template v-if="user">
                        <router-link to="/app"
                            class="cursor-pointer text-sm font-medium transition-colors hover:text-primary"
                            :class="textColor">
                            Dashboard
                        </router-link>
                        <DropdownMenu :modal="false">
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <User class="mr-2 h-4 w-4" />
                                    <span class="max-w-[160px] md:max-w-[220px] truncate inline-block align-middle">{{
                                        user.email }}</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem @click="router.push('/app')">Dashboard</DropdownMenuItem>
                                <DropdownMenuItem @click="router.push('/app/settings')">Settings</DropdownMenuItem>
                                <DropdownMenuItem @click="router.push('/app/billing')">Billing</DropdownMenuItem>
                                <DropdownMenuItem @click="router.push('/app/api-keys')">API Keys</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem @click="handleSignOut">
                                    <LogOut class="mr-2 h-4 w-4" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </template>
                    <template v-else>
                        <router-link to="/onboarding">
                            <Button variant="outline" size="sm"
                                class="rounded-full border-white/40 flex items-center justify-center h-9 px-5 py-2"
                                :style="{ color: textColor }">
                                Sign up
                            </Button>
                        </router-link>
                        <router-link to="/auth">
                            <Button size="sm"
                                class="rounded-full bg-[#1e6dfb] hover:bg-[#175be0] text-white flex items-center justify-center h-9 px-5 py-2">
                                Log in
                            </Button>
                        </router-link>
                    </template>
                </div>

                <!-- Mobile menu button -->
                <button class="md:hidden" @click="isOpen = !isOpen">
                    <X v-if="isOpen" class="h-6 w-6" :class="textColor" />
                    <Menu v-else class="h-6 w-6" :class="textColor" />
                </button>
            </div>

            <!-- Mobile Navigation -->
            <div v-if="isOpen"
                :class="`md:hidden py-4 ${route.path === '/' ? 'mt-2 rounded-2xl border border-border/50 bg-black/60 backdrop-blur-md' : 'border-t border-border/50 bg-black/70'} max-h-[80vh] overflow-auto`">
                <div class="flex flex-col space-y-4 px-4">
                    <template v-for="item in navItems" :key="item.name">
                        <div class="flex flex-col">
                            <template v-if="item.subItems">
                                <span class="text-sm font-medium transition-colors hover:text-primary cursor-pointer"
                                    :class="textColor"
                                    @click="openDropdown = openDropdown === item.name ? null : item.name">
                                    {{ item.name }}
                                </span>
                                <div v-if="openDropdown === item.name" class="ml-4 mt-2 flex flex-col space-y-2">
                                    <router-link v-for="sub in item.subItems" :key="sub.name" :to="sub.href"
                                        class="text-sm font-medium transition-colors hover:text-primary"
                                        :class="textColor" @click="isOpen = false">
                                        {{ sub.name }}
                                    </router-link>
                                </div>
                            </template>
                            <router-link v-else :to="item.href"
                                class="text-sm font-medium transition-colors hover:text-primary" :class="textColor"
                                @click="isOpen = false">
                                {{ item.name }}
                            </router-link>
                        </div>
                    </template>

                    <div class="pt-4 border-t border-border/50 flex flex-col space-y-2">
                        <template v-if="user">
                            <router-link to="/app" @click="isOpen = false">
                                <Button variant="ghost" class="w-full" :style="{ color: 'white' }">Dashboard</Button>
                            </router-link>
                            <Button variant="outline" class="w-full"
                                @click="() => { isOpen = false; handleSignOut(); }">
                                <LogOut class="mr-2 h-4 w-4" />
                                Sign Out
                            </Button>
                        </template>
                        <template v-else>
                            <router-link to="/auth" @click="isOpen = false">
                                <Button variant="ghost" class="w-full text-white" :style="{ color: textColor }">Sign
                                    In</Button>
                            </router-link>
                            <router-link to="/onboarding" @click="isOpen = false">
                                <Button variant="hero" class="w-full">Get Started</Button>
                            </router-link>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </nav>
</template>
