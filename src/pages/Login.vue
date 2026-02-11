<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { GlassCard } from "@/components/GlassCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "../hooks/use-toast"; // or wherever your toast is
import { useAuthStore } from "@/stores/auth"; // or wherever your auth composable is
import axios from "../axios";
const isLogin = ref(true);
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const loading = ref(false);

const auth = useAuthStore();
const { toast } = useToast();
const router = useRouter();
const result = ref(null);



const handleSubmit = async () => {
  loading.value = true;

  try {
    if (!isLogin.value) {
      // Sign up validations
      if (password.value !== confirmPassword.value) {
        toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
        return;
      }
      if (password.value.length < 6) {
        toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
        return;
      }

      const { error } = await auth.signUp(email.value, password.value);
      if (error) {
        toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Account created", description: "Continue onboarding to set up your account" });
      router.push("/onboarding");
    } else {
      // Login
      const { error } = await auth.login(email.value, password.value);
      if (error) {
        toast({ title: "Sign in failed", description: error.message || "Please check credentials", variant: "destructive" });
        return;
      }
      toast({ title: "Signed in", description: "Welcome back! Redirecting..." });
      router.push("/app");
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4"
    role="main" aria-label="Authentication page">
    <div class="w-full max-w-md space-y-8">
      <!-- Header -->
      <header class="text-center">
        <router-link to="/payment" class="inline-block mb-8" aria-label="Go back to homepage">
          <div class="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">OnePG</div>
        </router-link>
        <h1 class="text-3xl font-bold" id="auth-title">{{ isLogin ? "Welcome Back" : "Create Account" }}</h1>
        <p class="text-muted-foreground mt-2" id="auth-description">
          {{ isLogin ? "Sign in to your merchant account" : "Start your merchant verification journey" }}
        </p>
      </header>

      <!-- Auth Form -->
      <Card class="p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6" role="form" :aria-labelledby="'auth-title'"
          :aria-describedby="'auth-description'">
          <fieldset class="space-y-4">
            <legend class="sr-only">{{ isLogin ? "Sign in credentials" : "Account creation details" }}</legend>

            <!-- Email -->
            <div>
              <Label for="email" class="flex items-center gap-2">
                <Mail class="h-4 w-4" aria-hidden="true" /> Email Address
              </Label>
              <Input id="email" type="email" v-model="email" placeholder="Enter your email" required class="mt-1"
                :aria-describedby="!email ? 'email-hint' : undefined" autocomplete="email" />
              <p v-if="!email" id="email-hint" class="sr-only">Please enter a valid email address</p>
            </div>

            <!-- Password -->
            <div>
              <Label for="password" class="flex items-center gap-2">
                <Lock class="h-4 w-4" aria-hidden="true" /> Password
              </Label>
              <div class="relative mt-1">
                <Input id="password" :type="showPassword ? 'text' : 'password'" v-model="password"
                  placeholder="Enter your password" required minlength="6"
                  :autocomplete="isLogin ? 'current-password' : 'new-password'"
                  aria-describedby="password-visibility" />
                <Button type="button" variant="ghost" size="sm"
                  class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  @click="showPassword = !showPassword" :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  id="password-visibility">
                  <component :is="showPassword ? EyeOff : Eye" class="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div v-if="!isLogin">
              <Label for="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" :type="showPassword ? 'text' : 'password'" v-model="confirmPassword"
                placeholder="Confirm your password" required minlength="6" class="mt-1" autocomplete="new-password"
                aria-describedby="confirm-password-hint" />
              <p id="confirm-password-hint" class="sr-only">Re-enter your password to confirm it matches</p>
            </div>
          </fieldset>

          <!-- Submit -->
          <Button type="submit" class="w-full" size="lg" :disabled="loading"
            :aria-describedby="loading ? 'loading-status' : undefined">
            <template v-if="loading">
              <Loader2 class="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              <span id="loading-status" aria-live="polite">{{ isLogin ? "Signing In..." : "Creating Account..."
              }}</span>
            </template>
            <template v-else>
              <User class="mr-2 h-4 w-4" aria-hidden="true" />
              {{ isLogin ? "Sign In" : "Create Account" }}
            </template>
          </Button>

       
          <div v-if="isLogin" id="demo-login-info" class="text-xs text-muted-foreground text-center mt-2">
            <p class="sr-only">Demo account credentials: Email and password are both needythings.store@gmail.com</p>
            <p aria-hidden="true" class="opacity-75">Quick demo access available</p>
          </div>
        </form>

        <!-- Switch Auth Mode -->
        <div class="mt-6 text-center">
          <p class="text-sm text-muted-foreground">
            {{ isLogin ? "Don't have an account? " : "Already have an account? " }}

            <RouterLink :to="isLogin ? '/onboarding' : '/login'">
              <Button variant="link" class="p-0 h-auto font-semibold text-primary">
                {{ isLogin ? "Sign up" : "Sign in" }}
              </Button>
            </RouterLink>
          </p>
        </div>
      </Card>

      <!-- Email Verification Notice -->
      <div v-if="!isLogin" role="complementary" aria-label="Email verification information">
        <Card class="p-4">
          <div class="flex items-start gap-3">
            <Mail class="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
            <div class="text-sm">
              <h2 class="font-medium mb-1">Email Verification Required</h2>
              <p class="text-muted-foreground">
                After creating your account, you'll receive a verification email. Please click the link to verify your
                email
                before signing in.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <!-- Security Badge -->
      <div class="flex justify-center" role="complementary" aria-label="Security information">
        <Badge variant="outline" class="text-xs">
          <Lock class="h-3 w-3 mr-1" aria-hidden="true" /> 256-bit SSL Encrypted
        </Badge>
      </div>
    </div>
  </div>
</template>
