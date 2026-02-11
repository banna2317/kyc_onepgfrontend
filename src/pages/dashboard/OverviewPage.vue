<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { format } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Key,
  Webhook,
  Play,
  BarChart3,
  Users,
  Calendar,
  ChevronDown,
} from "lucide-vue-next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import axios from "@/axios";

import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import {
  startOfMonth, endOfMonth, subMonths,
  subDays, subWeeks, startOfDay, endOfDay
} from 'date-fns';

const presetRanges = [
  { label: 'Today', range: [startOfDay(new Date()), endOfDay(new Date())] },
  { label: 'Last 7 Days', range: [subDays(new Date(), 6), new Date()] },
  { label: 'Last 3 Weeks', range: [subWeeks(new Date(), 3), new Date()] },
  { label: 'This Month', range: [startOfMonth(new Date()), endOfMonth(new Date())] },
  {
    label: 'Last Month',
    range: [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))]
  },
];

const date = ref([startOfDay(new Date()), endOfDay(new Date())]);
// reactive states


const walletBalance = ref("0.00");
const kpis = ref([
  { title: "Total Verifications", value: "0", change: "", trend: "up", icon: Shield },
  { title: "Success Count", value: "0", change: "", trend: "up", icon: CheckCircle2 },
  { title: "Failed Count", value: "0", change: "", trend: "down", icon: AlertTriangle },
  { title: "Success Rate", value: "0%", change: "", trend: "up", icon: TrendingUp },
]);

const recentVerifications = ref([]);


async function getrecords() {
  try {
    // Date format parameters taiyar karein
    const payload = {
      start_date: date.value && date.value[0] ? format(date.value[0], "yyyy-MM-dd") : null,
      end_date: date.value && date.value[1] ? format(date.value[1], "yyyy-MM-dd") : null,
    };

    console.log("Fetching data for:", payload);

    // API call mein payload bhejein
    const response = await axios.post('/overviewdata', payload);

    console.log('API', response);
    if (response.data.status) {
      const data = response.data.data;

      // Update wallet balance
      walletBalance.value = data.walletBalance;

      // Update KPIs dynamically
      kpis.value = [
        {
          title: "Total Verifications",
          value: data.totalVerifications,
          change: "",
          trend: "up",
          icon: Shield,
        },
        {
          title: "Success Count",
          value: data.successCount,
          change: "",
          trend: "up",
          icon: CheckCircle2,
        },
        {
          title: "Failed Count",
          value: data.failedCount,
          change: "",
          trend: "down",
          icon: AlertTriangle,
        },
        {
          title: "Success Rate",
          value: data.successRate + "%",
          change: "",
          trend: "up",
          icon: TrendingUp,
        },
      ];

      // Map backend latestVerifications to frontend format
      recentVerifications.value = data.latestVerifications.map((v: any) => ({
        id: v.verification_id,
        type: v.model,
        status: v.status.charAt(0).toUpperCase() + v.status.slice(1), // Capitalize first letter
        time: format(new Date(v.created_at), "MMM d, yyyy HH:mm"), // Format time nicely
      }));
    }
    // Yahan response handle karein (e.g., kpis.value = response.data.kpis)
  } catch (err) {
    console.error("Error fetching records:", err);
  }
}
watch(date, () => {
  getrecords();
});
onMounted(() => {
  getrecords();
});

</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="space-y-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <!-- LEFT SIDE -->
        <div>
          <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>

          <p class="text-sm sm:text-base text-muted-foreground mt-1">
            Monitor your verification metrics and get started with OnePG SecureID
          </p>
        </div>

        <div>
            <div class="flex items-center justify-between">

                <div class="p-1">
                  <VueDatePicker v-model="date" range :enable-time-picker="false" auto-apply teleport="body"
                    :z-index="9999" :preset-ranges="presetRanges">
                    <template #trigger>
                      <div
                        class="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-all border border-gray-200 shadow-sm">
                        <Calendar class="h-5 w-5 text-primary" />

                        <div>
                          <!-- ❌ Removed "Selected Period" -->

                          <p class="text-sm font-semibold text-gray-700">
                            <template v-if="date && date[0] && date[1]">
                              {{ format(date[0], "MMM d, yyyy") }} - {{ format(date[1], "MMM d, yyyy") }}
                            </template>
                            <template v-else>
                              {{ format(new Date(), "EEEE, MMMM do, yyyy") }}
                            </template>
                          </p>
                        </div>

                        <ChevronDown class="h-4 w-4 text-muted-foreground" />
                      </div>
                    </template>

                    <template #left-sidebar>
                      <div class="flex flex-col border-r border-gray-200 p-2 min-w-[140px] bg-white h-full">
                        <button v-for="(p, index) in presetRanges" :key="index" @click="date = p.range"
                          class="text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors font-medium mb-1">
                          {{ p.label }}
                        </button>
                      </div>
                    </template>

                  </VueDatePicker>
                </div>

              </div>

        </div>

        <!-- RIGHT SIDE (Wallet Balance) -->
        <div class="flex md:block items-start md:items-end gap-2 md:gap-0">
          <div class="text-left md:text-right">
            <p class="text-xs sm:text-sm text-muted-foreground">
              Wallet Balance
            </p>

            <p class="text-xl sm:text-2xl font-bold">
              ₹{{ walletBalance }}
            </p>
          </div>
        </div>

      </div>


      <!-- Date Section -->

    </div>

    <!-- KPI Cards Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card v-for="kpi in kpis" :key="kpi.title" class="glass-card">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">
            {{ kpi.title }}
          </CardTitle>
          <component :is="kpi.icon" class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ kpi.value }}</div>
          <div class="flex items-center text-xs text-muted-foreground mt-1">
            <component :is="kpi.trend === 'up' ? TrendingUp : TrendingDown" :class="[
              'mr-1 h-3 w-3',
              kpi.trend === 'up' ? 'text-emerald-500' : 'text-red-500',
            ]" />
            <span :class="kpi.trend === 'up' ? 'text-emerald-500' : 'text-red-500'">
              {{ kpi.change }}
            </span>
            <span class="ml-1">from yesterday</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Activity Section -->
    <Card class="glass-card">
      <CardHeader>
        <CardTitle>Recent Verifications</CardTitle>
        <p class="text-sm text-muted-foreground">
          Latest verification requests and their status
        </p>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div v-for="verification in recentVerifications" :key="verification.id"
            class="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
            <div class="flex-1">
              <p class="font-medium">{{ verification.id }}</p>
              <p class="text-sm text-muted-foreground">{{ verification.type }}</p>
            </div>
            <div class="flex items-center space-x-4">
              <Badge :variant="verification.status === 'Success'
                ? 'secondary'
                : verification.status === 'Pending'
                  ? 'outline'
                  : 'destructive'
                " :class="{
                  'bg-emerald-50 text-emerald-700 border-emerald-200':
                    verification.status === 'Success',
                  'bg-amber-50 text-amber-700 border-amber-200':
                    verification.status === 'Pending',
                }">
                {{ verification.status }}
              </Badge>
              <span class="text-sm text-muted-foreground min-w-0">
                {{ verification.time }}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.glass-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
</style>
