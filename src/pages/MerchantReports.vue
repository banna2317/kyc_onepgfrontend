<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Reports & Analytics</h1>
      <div class="flex gap-2">
        <Select v-model="selectedRange" class="w-[180px]">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="last7days">Last 7 Days</SelectItem>
            <SelectItem value="last30days">Last 30 Days</SelectItem>
            <SelectItem value="thismonth">This Month</SelectItem>
            <SelectItem value="lastmonth">Last Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <Download class="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid gap-4 md:grid-cols-4">
      <Card v-for="(card, index) in summaryCards" :key="index">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">{{ card.title }}</CardTitle>
          <component :is="card.icon" class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ card.value }}</div>
          <p
            class="text-xs flex items-center mt-1"
            :class="card.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
          >
            <component :is="card.trendIcon" class="h-3 w-3 mr-1" />
            {{ card.trend }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Charts -->
    <div class="grid gap-6 md:grid-cols-2">
      <!-- Transaction Volume Chart -->
      <Card>
        <CardHeader>
          <CardTitle>Transaction Volume Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Line :data="transactionVolumeChartData" :options="chartOptions" />
        </CardContent>
      </Card>

      <!-- Success Rate Chart -->
      <Card>
        <CardHeader>
          <CardTitle>Success vs Failed Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar :data="successRateChartData" :options="chartOptions" />
        </CardContent>
      </Card>
    </div>

    <!-- Payout Mode and Beneficiaries -->
    <div class="grid gap-6 md:grid-cols-2">
      <!-- Pie Chart -->
      <Card>
        <CardHeader>
          <CardTitle>Payout Mode Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Pie :data="payoutModeChartData" :options="pieChartOptions" />

          <div class="mt-4 grid grid-cols-2 gap-2">
            <div
              v-for="mode in payoutModeData"
              :key="mode.name"
              class="flex items-center gap-2"
            >
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: mode.color }"
              ></div>
              <span class="text-sm">{{ mode.name }}</span>
              <Badge variant="outline" class="ml-auto">
                {{ mode.value }}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Top Beneficiaries -->
      <Card>
        <CardHeader>
          <CardTitle>Top Beneficiaries</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div
              v-for="(beneficiary, index) in topBeneficiariesData"
              :key="beneficiary.name"
              class="flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                  {{ index + 1 }}
                </div>
                <div>
                  <p class="font-medium">{{ beneficiary.name }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ beneficiary.count }} transactions
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold">₹{{ formatINR(beneficiary.amount) }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Reports Section -->
    <Card>
      <CardHeader>
        <CardTitle>Available Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid gap-3 md:grid-cols-2">
          <Button
            v-for="report in availableReports"
            :key="report.title"
            variant="outline"
            class="justify-start h-auto py-4"
          >
            <div class="text-left">
              <div class="font-medium">{{ report.title }}</div>
              <div class="text-xs text-muted-foreground">
                {{ report.description }}
              </div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Line, Bar, Pie } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

// ✅ Register all chart types
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement
);

// === UI Imports ===
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, TrendingUp, TrendingDown, DollarSign, CheckCircle, ArrowUpRight } from "lucide-vue-next";

// === Reactive Data ===
const selectedRange = ref("last7days");

const transactionVolumeData = [
  { month: "Apr", volume: 450000 },
  { month: "May", volume: 580000 },
  { month: "Jun", volume: 620000 },
  { month: "Jul", volume: 750000 },
  { month: "Aug", volume: 890000 },
  { month: "Sep", volume: 1020000 },
  { month: "Oct", volume: 1150000 },
];

const successRateData = [
  { month: "Apr", success: 92, failed: 8 },
  { month: "May", success: 94, failed: 6 },
  { month: "Jun", success: 93, failed: 7 },
  { month: "Jul", success: 95, failed: 5 },
  { month: "Aug", success: 96, failed: 4 },
  { month: "Sep", success: 97, failed: 3 },
  { month: "Oct", success: 98, failed: 2 },
];

const payoutModeData = [
  { name: "IMPS", value: 45, color: "#8b5cf6" },
  { name: "NEFT", value: 30, color: "#3b82f6" },
  { name: "RTGS", value: 15, color: "#10b981" },
  { name: "UPI", value: 10, color: "#f59e0b" },
];

const topBeneficiariesData = [
  { name: "Rajesh Kumar", amount: 125000, count: 15 },
  { name: "Priya Sharma", amount: 98000, count: 12 },
  { name: "Amit Patel", amount: 87000, count: 10 },
  { name: "Sunita Desai", amount: 76000, count: 9 },
  { name: "Vikram Singh", amount: 65000, count: 8 },
];

// === Chart Data ===
const transactionVolumeChartData = {
  labels: transactionVolumeData.map((d) => d.month),
  datasets: [
    {
      label: "Volume (₹)",
      data: transactionVolumeData.map((d) => d.volume),
      borderColor: "#6366f1",
      backgroundColor: "rgba(99, 102, 241, 0.2)",
      fill: true,
    },
  ],
};

const successRateChartData = {
  labels: successRateData.map((d) => d.month),
  datasets: [
    {
      label: "Success (%)",
      data: successRateData.map((d) => d.success),
      backgroundColor: "#10b981",
    },
    {
      label: "Failed (%)",
      data: successRateData.map((d) => d.failed),
      backgroundColor: "#ef4444",
    },
  ],
};

const payoutModeChartData = {
  labels: payoutModeData.map((d) => d.name),
  datasets: [
    {
      label: "Distribution",
      data: payoutModeData.map((d) => d.value),
      backgroundColor: payoutModeData.map((d) => d.color),
    },
  ],
};

// === Chart Options ===
const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: "bottom" },
  },
};

const pieChartOptions = {
  responsive: true,
  plugins: {
    legend: { position: "right" },
  },
};

// === Cards ===
const summaryCards = [
  {
    title: "Total Volume",
    icon: DollarSign,
    value: "₹11.5L",
    trend: "+12.8% from last period",
    isPositive: true,
    trendIcon: TrendingUp,
  },
  {
    title: "Total Transactions",
    icon: ArrowUpRight,
    value: "320",
    trend: "+8.5% from last period",
    isPositive: true,
    trendIcon: TrendingUp,
  },
  {
    title: "Success Rate",
    icon: CheckCircle,
    value: "98.2%",
    trend: "+2.1% from last period",
    isPositive: true,
    trendIcon: TrendingUp,
  },
  {
    title: "Total Fees",
    icon: DollarSign,
    value: "₹1,888",
    trend: "Includes GST",
    isPositive: false,
    trendIcon: TrendingDown,
  },
];

const availableReports = [
  {
    title: "Transaction Report",
    description: "Detailed list of all transactions with status and fees",
  },
  {
    title: "Beneficiary Report",
    description: "Complete beneficiary list with verification status",
  },
  {
    title: "Fee Analysis Report",
    description: "Breakdown of all fees and GST charges",
  },
  {
    title: "Reconciliation Report",
    description: "Match payouts with wallet transactions",
  },
];

// === Helper ===
function formatINR(amount) {
  return amount.toLocaleString("en-IN");
}
</script>