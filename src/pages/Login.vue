<template>
  <div class="min-h-screen bg-gradient-surface flex items-center justify-center p-4 relative">
    <!-- Background Elements -->
    <div class="absolute inset-0 bg-gradient-hero opacity-5"></div>
    <div class="absolute top-0 right-0 -translate-y-12 translate-x-12">
      <div class="h-96 w-96 rounded-full bg-gradient-primary opacity-10 blur-3xl"></div>
    </div>

    <div class="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center relative">
      <!-- Left Side -->
      <div class="hidden lg:block space-y-8">
        <div>
          <div class="flex items-center space-x-2 mb-6">
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
              <Building2 class="h-6 w-6 text-white" />
            </div>
            <span class="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              OnePG Payout
            </span>
          </div>
          <h1 class="text-4xl font-bold mb-4">
            Payouts made simple for
            <span class="bg-gradient-primary bg-clip-text text-transparent"> growing businesses</span>
          </h1>
          <p class="text-lg text-muted-foreground">
            Join thousands of businesses using OnePG Payout for their payment infrastructure.
          </p>
        </div>

        <div class="space-y-6">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="flex items-start space-x-4"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <component :is="feature.icon" class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 class="font-semibold mb-1">{{ feature.title }}</h3>
              <p class="text-sm text-muted-foreground">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side -->
      <Card class="w-full max-w-md mx-auto bg-card/80 backdrop-blur-xl shadow-2xl border-0">
        <CardHeader class="text-center">
          <div class="flex lg:hidden items-center justify-center space-x-2 mb-4">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Building2 class="h-5 w-5 text-white" />
            </div>
            <span class="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              OnePG Payout
            </span>
          </div>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs v-model="activeTab" class="w-full">
            <TabsList class="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <!-- LOGIN TAB -->
            <TabsContent value="login">
              <form @submit.prevent="handleLogin" class="space-y-4">
                <div class="space-y-2 text-left">
                  <Label for="email">Email</Label>
                  <div class="relative">
                    <Mail class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input v-model="login.email" id="email" type="email" placeholder="you@company.com" class="pl-10" required />
                  </div>
                </div>

                <div class="space-y-2 text-left">
                  <Label for="password">Password</Label>
                  <div class="relative">
                    <Lock class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      v-model="login.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Enter your password"
                      class="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="absolute right-0 top-0 h-full px-3"
                      @click="showPassword = !showPassword"
                    >
                      <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label for="remember" class="text-sm">Remember me</Label>
                  </div>
                  <a href="#" class="text-sm text-primary hover:underline">Forgot password?</a>
                </div>

                <Button type="submit" class="w-full flex justify-center items-center group" :disabled="isLoading">
                  {{ isLoading ? 'Signing in...' : 'Sign In' }}
                  <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </TabsContent>

            <!-- SIGNUP TAB -->
            <TabsContent value="signup">
              <form @submit.prevent="handleSignup" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2 text-left">
                    <Label for="firstName">First Name</Label>
                    <Input v-model="signup.firstName" id="firstName" placeholder="John" required />
                  </div>
                  <div class="space-y-2 text-left">
                    <Label for="lastName">Last Name</Label>
                    <Input v-model="signup.lastName" id="lastName" placeholder="Doe" required />
                  </div>
                </div>

                <div class="space-y-2 text-left">
                  <Label for="company">Company Name</Label>
                  <Input v-model="signup.company" id="company" placeholder="Acme Inc." required />
                </div>

                <div class="space-y-2 text-left">
                  <Label for="signupEmail">Email</Label>
                  <div class="relative">
                    <Mail class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input v-model="signup.email" type="email" placeholder="you@company.com" class="pl-10" required />
                  </div>
                </div>

                <div class="space-y-2 text-left">
                  <Label for="signupPassword">Password</Label>
                  <div class="relative">
                    <Lock class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      v-model="signup.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Create a strong password"
                      class="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      class="absolute right-0 top-0 h-full px-3"
                      @click="showPassword = !showPassword"
                    >
                      <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div class="flex items-start space-x-2">
                  <Checkbox id="terms" required />
                  <Label for="terms" class="text-sm leading-5">
                    I agree to the
                    <a href="/legal/terms" class="text-primary hover:underline">Terms & Conditions</a>
                    and
                    <a href="/legal/privacy" class="text-primary hover:underline">Privacy Policy</a>
                  </Label>
                </div>

                <Button type="submit" class="w-full flex justify-center items-center group" :disabled="isLoading">
                  {{ isLoading ? 'Creating Account...' : 'Create Account' }}
                  <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div class="mt-6 text-center text-sm text-muted-foreground">
            Need help? Contact our
            <a href="/support" class="text-primary hover:underline">support team</a>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// Lucide icons (installed via lucide-vue-next)
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Users,
  Zap,
} from "lucide-vue-next";

// shadcn-vue components (import each from its file)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const showPassword = ref(false);
const isLoading = ref(false);
const activeTab = ref("login");

const login = ref({
  email: "",
  password: "",
});

const signup = ref({
  firstName: "",
  lastName: "",
  company: "",
  email: "",
  password: "",
});

const features = [
  {
    icon: Shield,
    title: "Bank-grade Security",
    description: "Your data is protected with enterprise-level encryption",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Add team members with role-based access control",
  },
  {
    icon: Zap,
    title: "Instant Processing",
    description: "Process payouts in real-time with 99.9% uptime",
  },
];

const handleLogin = async () => {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
    window.location.href = "/";
  }, 2000);
};

const handleSignup = async () => {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
    window.location.href = "/onboarding";
  }, 2000);
};
</script>
