<script setup>
import { ref } from "vue"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Wallet,
  CreditCard,
  TrendingUp,
  Clock,
  Plus,
  Upload,
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign
} from "lucide-vue-next"

const isBulkUploadOpen = ref(false)
const isCreateDialogOpen = ref(false)

const beneficiariesList = [
  { id: "BEN-001", name: "Rajesh Kumar", account: "50100012345678", bank: "HDFC Bank", verified: true },
  { id: "BEN-002", name: "Priya Sharma", account: "60200023456789", bank: "ICICI Bank", verified: true },
  { id: "BEN-003", name: "Amit Patel", account: "70300034567890", bank: "Axis Bank", verified: true },
]

const stats = [
  {
    title: "Available Balance",
    value: "₹2,45,670",
    change: "+12.5%",
    trend: "up",
    icon: Wallet,
    description: "Ready to use"
  }
]

const recentPayouts = [
  { id: "PAY_001", beneficiary: "John Doe", amount: "₹5,000", status: "success", time: "2 mins ago", mode: "IMPS" },
  { id: "PAY_002", beneficiary: "Acme Corp", amount: "₹25,000", status: "processing", time: "5 mins ago", mode: "NEFT" },
  { id: "PAY_003", beneficiary: "Jane Smith", amount: "₹3,500", status: "failed", time: "8 mins ago", mode: "UPI" },
  { id: "PAY_004", beneficiary: "Tech Solutions", amount: "₹50,000", status: "success", time: "12 mins ago", mode: "RTGS" }
]

const getStatusIcon = (status) => {
  switch (status) {
    case "success":
      return CheckCircle
    case "processing":
      return Clock
    case "failed":
      return XCircle
    default:
      return AlertTriangle
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case "success":
      return "text-success bg-success/10"
    case "processing":
      return "text-warning bg-warning/10"
    case "failed":
      return "text-destructive bg-destructive/10"
    default:
      return "text-muted-foreground bg-muted"
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div>
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="text-muted-foreground">Welcome back! Here's what's happening with your payouts.</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Bulk Upload Dialog -->
        <Dialog v-model:open="isBulkUploadOpen">
          <DialogTrigger as-child>
            <Button variant="outline" class="group">
              <Upload class="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Bulk Payout Upload</DialogTitle>
              <DialogDescription>
                Upload a CSV file with payout details. Download the template to see the required format.
              </DialogDescription>
            </DialogHeader>
            <div class="space-y-4 py-4">
              <Button variant="outline" class="w-full">Download CSV Template</Button>
              <div
                class="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload class="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p class="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                <p class="text-xs text-muted-foreground">CSV file up to 10MB</p>
              </div>
              <div class="bg-muted p-4 rounded-lg space-y-2">
                <p class="text-sm font-medium">Upload Guidelines:</p>
                <ul class="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Maximum 1000 payouts per file</li>
                  <li>Ensure all beneficiaries are verified</li>
                  <li>Total amount should not exceed wallet balance</li>
                  <li>Use format: beneficiary_id, amount, mode, reference</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" @click="isBulkUploadOpen = false">Cancel</Button>
              <Button @click="isBulkUploadOpen = false">Process Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <!-- Create Payout Dialog -->
        <Dialog v-model:open="isCreateDialogOpen">
          <DialogTrigger as-child>
            <Button variant="hero" class="group">
              <Plus class="mr-2 h-4 w-4" />
              New Payout
              <ArrowUpRight
                class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Payout</DialogTitle>
              <DialogDescription>
                Send money to a verified beneficiary. Funds will be transferred instantly.
              </DialogDescription>
            </DialogHeader>
            <div class="space-y-4 py-4">
              <div class="space-y-2">
                <Label for="beneficiary">Select Beneficiary</Label>
                <Select>
                  <SelectTrigger id="beneficiary">
                    <SelectValue placeholder="Choose beneficiary" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="ben in beneficiariesList" :key="ben.id" :value="ben.id">
                      {{ ben.name }} - {{ ben.bank }} ({{ ben.account.slice(-4) }})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label for="amount">Amount (₹)</Label>
                <Input id="amount" type="number" placeholder="Enter amount" min="1" />
                <p class="text-xs text-muted-foreground">Available balance: ₹12,45,678</p>
              </div>

              <div class="space-y-2">
                <Label for="mode">Transfer Mode</Label>
                <Select defaultValue="imps">
                  <SelectTrigger id="mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imps">IMPS (Instant)</SelectItem>
                    <SelectItem value="neft">NEFT (2-4 hours)</SelectItem>
                    <SelectItem value="rtgs">RTGS (For ₹2L+)</SelectItem>
                    <SelectItem value="upi">UPI (Instant)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label for="reference">Reference (Optional)</Label>
                <Input id="reference" placeholder="Internal reference or notes" />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" @click="isCreateDialogOpen = false">Cancel</Button>
              <Button @click="isCreateDialogOpen = false">Create Payout</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card v-for="(stat, index) in stats" :key="index" class="hover:shadow-smooth transition-all duration-300">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium text-muted-foreground">{{ stat.title }}</CardTitle>
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <component :is="stat.icon" class="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stat.value }}</div>
          <div class="flex items-center space-x-2 text-xs">
            <span class="flex items-center" :class="stat.trend === 'up' ? 'text-success' : 'text-destructive'">
              <component :is="stat.trend === 'up' ? ArrowUpRight : ArrowDownRight" class="mr-1 h-3 w-3" />
              {{ stat.change }}
            </span>
            <span class="text-muted-foreground">{{ stat.description }}</span>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Recent Payouts -->
      <Card class="lg:col-span-2">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Recent Payouts</CardTitle>
              <CardDescription>Your latest payout transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" as-child>
              <a href="/dashboard/merchant/payouts">View All</a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="(payout, index) in recentPayouts" :key="index"
              class="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors" :class="{
                'hover:bg-success/10 hover:text-success': payout.status === 'success',
                'hover:bg-warning/10 hover:text-warning': payout.status === 'processing',
                'hover:bg-destructive/10 hover:text-destructive': payout.status === 'failed',
                'hover:bg-accent': !['success', 'processing', 'failed'].includes(payout.status),
              }">
              <div class="flex items-center space-x-3">
                <component :is="getStatusIcon(payout.status)" class="h-4 w-4" :class="getStatusColor(payout.status)" />
                <div>
                  <div class="font-medium">{{ payout.beneficiary }}</div>
                  <div class="text-sm text-muted-foreground">{{ payout.id }} • {{ payout.mode }}</div>
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium">{{ payout.amount }}</div>
                <div class="text-sm text-muted-foreground">{{ payout.time }}</div>
              </div>
              <Badge :class="getStatusColor(payout.status)">{{ payout.status }}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Quick Actions -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>

          <CardContent class="space-y-3">
            <!-- Create Payout -->
            <Button variant="outline"
              class="w-full justify-start group relative overflow-hidden transition-all duration-300 hover:border-primary hover:text-primary hover:shadow-glow"
              as-child>
              <a href="/dashboard/merchant/payouts">
                <CreditCard
                  class="mr-3 h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary" />
                Create Payout
                <ArrowUpRight
                  class="ml-auto h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </Button>

            <!-- Add Beneficiary -->
            <Button variant="outline"
              class="w-full justify-start group relative overflow-hidden transition-all duration-300 hover:border-success hover:text-success hover:shadow-glow"
              as-child>
              <a href="/dashboard/merchant/beneficiaries">
                <Users
                  class="mr-3 h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-success" />
                Add Beneficiary
                <ArrowUpRight
                  class="ml-auto h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </Button>

            <!-- Fund Wallet -->
            <Button variant="outline"
              class="w-full justify-start group relative overflow-hidden transition-all duration-300 hover:border-warning hover:text-warning hover:shadow-glow"
              as-child>
              <a href="/dashboard/merchant/wallet">
                <Wallet
                  class="mr-3 h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-warning" />
                Fund Wallet
                <ArrowUpRight
                  class="ml-auto h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </Button>

            <!-- View Reports -->
            <Button variant="outline"
              class="w-full justify-start group relative overflow-hidden transition-all duration-300 hover:border-purple-500 hover:text-purple-500 hover:shadow-glow
"
              as-child>
              <a href="/dashboard/merchant/reports">
                <BarChart3
                  class="mr-3 h-4 w-4 transition-transform duration-300 group-hover:scale-110 group-hover:text-purple-500" />
                View Reports
                <ArrowUpRight
                  class="ml-auto h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </Button>
          </CardContent>
        </Card>



        <!-- Monthly Summary -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg flex items-center">
              <DollarSign class="mr-2 h-5 w-5 text-success" />
              Monthly Summary
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">Total Volume</span>
              <span class="font-medium">₹15,67,890</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">Successful</span>
              <span class="font-medium text-success">1,234</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">Failed</span>
              <span class="font-medium text-destructive">12</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">Fees Paid</span>
              <span class="font-medium">₹4,567</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
