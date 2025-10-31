<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Toaster, toast } from "vue-sonner";
import { cn } from "@/lib/utils";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import {
  Plus,
  Wallet,
  Upload,
  Download,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-vue-next";

const payoutsData = [
  {
    id: "PO-2024-001234",
    beneficiary: "Rajesh Kumar",
    accountNumber: "XXXX5678",
    amount: 50000,
    mode: "IMPS",
    status: "completed",
    utr: "UTR2024010112345",
    createdAt: "2024-10-01 10:30 AM",
    completedAt: "2024-10-01 10:31 AM",
  },
  {
    id: "PO-2024-001235",
    beneficiary: "Priya Sharma",
    accountNumber: "XXXX9012",
    amount: 75000,
    mode: "NEFT",
    status: "processing",
    utr: "-",
    createdAt: "2024-10-01 11:15 AM",
    completedAt: "-",
  },
  {
    id: "PO-2024-001236",
    beneficiary: "Amit Patel",
    accountNumber: "XXXX3456",
    amount: 25000,
    mode: "UPI",
    status: "failed",
    utr: "-",
    createdAt: "2024-10-01 09:45 AM",
    completedAt: "-",
    failureReason: "Insufficient balance in source account",
  },
  {
    id: "PO-2024-001237",
    beneficiary: "Sunita Desai",
    accountNumber: "XXXX7890",
    amount: 100000,
    mode: "RTGS",
    status: "pending",
    utr: "-",
    createdAt: "2024-10-01 12:00 PM",
    completedAt: "-",
  },
  {
    id: "PO-2024-001238",
    beneficiary: "Vikram Singh",
    accountNumber: "XXXX2345",
    amount: 35000,
    mode: "IMPS",
    status: "completed",
    utr: "UTR2024010112346",
    createdAt: "2024-09-30 04:20 PM",
    completedAt: "2024-09-30 04:21 PM",
  },
];

const beneficiariesList = [
  { id: "BEN-001", name: "Rajesh Kumar", account: "50100012345678", bank: "HDFC Bank", verified: true },
  { id: "BEN-002", name: "Priya Sharma", account: "60200023456789", bank: "ICICI Bank", verified: true },
  { id: "BEN-003", name: "Amit Patel", account: "70300034567890", bank: "Axis Bank", verified: true },
  { id: "BEN-004", name: "Sunita Desai", account: "80400045678901", bank: "SBI", verified: true },
  { id: "BEN-005", name: "Vikram Singh", account: "90500056789012", bank: "Kotak Mahindra", verified: true },
];

// --- State ---
const isCreateDialogOpen = ref(false);
const isBulkUploadOpen = ref(false);
const isDetailDialogOpen = ref(false);
const selectedPayout = ref<any>(null);
const searchQuery = ref("");
const statusFilter = ref("all");

const route = useRoute();
const router = useRouter();

// --- Lifecycle: Handle modal query ---
onMounted(() => {
  const modal = route.query.modal;
  if (modal === "bulk") isBulkUploadOpen.value = true;
  else if (modal === "new") isCreateDialogOpen.value = true;
});

// --- Helper Functions ---
const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return CheckCircle;
    case "processing":
      return Clock;
    case "failed":
      return XCircle;
    case "pending":
      return RefreshCw;
    default:
      return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "processing":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "failed":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    default:
      return "";
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-success/10 text-success hover:bg-success/20 border-success/20";
    case "processing":
      return "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20";
    case "failed":
      return "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20";
    case "pending":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20";
    default:
      return "";
  }
};

// --- Computed filtered payouts ---
const filteredPayouts = computed(() => {
  return payoutsData.filter((payout) => {
    const matchesSearch =
      payout.beneficiary.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      payout.id.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = statusFilter.value === "all" || payout.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});

// --- Actions ---
const handleCreatePayout = () => {
  toast({
    title: "Payout Created",
    description: "Your payout request has been submitted successfully.",
  });
  isCreateDialogOpen.value = false;
};

const handleBulkUpload = () => {
  toast({
    title: "Bulk Upload Started",
    description: "Processing 150 payout requests. You'll be notified once complete.",
  });
  isBulkUploadOpen.value = false;
};

const handleRetry = (id: string) => {
  toast({
    title: "Payout Retrying",
    description: `Retrying payout ${id}...`,
  });
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Payouts</h1>
      <div class="flex gap-3">
        <!-- Bulk Upload Dialog -->
        <Dialog v-model:open="isBulkUploadOpen">
          <DialogTrigger as-child>
            <Button variant="outline">
              <Upload class="mr-2 h-4 w-4" /> Bulk Upload
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
              <Button variant="outline" class="w-full">
                <Download class="mr-2 h-4 w-4" /> Download CSV Template
              </Button>
              <div class="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
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
              <Button @click="handleBulkUpload">Process Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <!-- Create Payout Dialog -->
        <Dialog v-model:open="isCreateDialogOpen">
          <DialogTrigger as-child>
            <Button variant="hero">
              <Plus class="mr-2 h-4 w-4" /> New Payout
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
                    <SelectItem
                      v-for="ben in beneficiariesList"
                      :key="ben.id"
                      :value="ben.id"
                    >
                      {{ ben.name }} - {{ ben.bank }} ({{ ben.account.slice(-4) }})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label for="amount">Amount (₹)</Label>
                <Input id="amount" type="number" placeholder="Enter amount" min="1" />
                <p class="text-xs text-muted-foreground">
                  Available balance: ₹12,45,678
                </p>
              </div>

              <div class="space-y-2">
                <Label for="mode">Transfer Mode</Label>
                <Select default-value="imps">
                  <SelectTrigger id="mode"><SelectValue /></SelectTrigger>
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
              <Button @click="handleCreatePayout">Create Payout</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <!-- Balance Card -->
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-4">
      <Card class="shadow-sm rounded-2xl">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Available Balance</CardTitle>
          <Wallet class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">₹11,95,672</div>
          <p class="text-xs text-muted-foreground mt-1">Ready for payouts</p>
        </CardContent>
      </Card>
    </div>

    <!-- Payout Table -->
    <Card>
      <CardHeader>
        <div class="flex flex-col sm:flex-row justify-between gap-4">
          <CardTitle>Payout Transactions</CardTitle>
          <div class="flex gap-2">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payouts..."
                v-model="searchQuery"
                class="pl-9 w-[200px]"
              />
            </div>
            <Select v-model="statusFilter">
              <SelectTrigger class="w-[150px]">
                <Filter class="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="iconlg">
              <Download class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payout ID</TableHead>
              <TableHead>Beneficiary</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>UTR</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow
              v-for="payout in filteredPayouts"
              :key="payout.id"
              class="cursor-pointer hover:bg-muted-foreground/10"
              @click="() => { selectedPayout = payout; isDetailDialogOpen = true; }"
            >
              <TableCell class="font-medium">{{ payout.id }}</TableCell>
              <TableCell>{{ payout.beneficiary }}</TableCell>
              <TableCell class="font-mono text-sm">{{ payout.accountNumber }}</TableCell>
              <TableCell class="font-semibold">
                ₹{{ payout.amount.toLocaleString("en-IN") }}
              </TableCell>
              <TableCell><Badge variant="outline">{{ payout.mode }}</Badge></TableCell>
              <TableCell>
                <Badge :class="getStatusColor(payout.status)">
                  <component :is="getStatusIcon(payout.status)" class="h-4 w-4 inline-block mr-1" />
                  {{ payout.status }}
                </Badge>
              </TableCell>
              <TableCell class="font-mono text-xs">{{ payout.utr }}</TableCell>
              <TableCell class="text-sm text-muted-foreground">{{ payout.createdAt }}</TableCell>
              <TableCell>
                <Button
                  v-if="payout.status === 'failed'"
                  variant="outline"
                  size="sm"
                  @click.stop="handleRetry(payout.id)"
                >
                  <RefreshCw class="h-3 w-3 mr-1" /> Retry
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <!-- Detail Dialog -->
        <Dialog v-model:open="isDetailDialogOpen">
          <DialogContent class="max-w-md">
            <DialogHeader>
              <DialogTitle>Payout Details</DialogTitle>
            </DialogHeader>

            <div v-if="selectedPayout" class="space-y-4">
              <div class="flex items-center justify-between pb-4 border-b">
                <div>
                  <p class="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    :class="cn('border mt-1', getStatusStyles(selectedPayout.status))"
                  >
                    {{ selectedPayout.status }}
                  </Badge>
                </div>
                <div class="text-right">
                  <p class="text-sm text-muted-foreground">Amount</p>
                  <p class="text-2xl font-bold">
                    ₹{{ selectedPayout.amount.toLocaleString('en-IN') }}
                  </p>
                </div>
              </div>

              <div class="space-y-3">
                <div>
                  <p class="text-sm text-muted-foreground">Beneficiary</p>
                  <p class="font-medium">{{ selectedPayout.beneficiary }}</p>
                </div>

                <div>
                  <p class="text-sm text-muted-foreground">Account Number</p>
                  <p class="font-mono text-sm">{{ selectedPayout.accountNumber }}</p>
                </div>

                <div>
                  <p class="text-sm text-muted-foreground">Payout ID</p>
                  <p class="font-mono text-sm">{{ selectedPayout.id }}</p>
                </div>

                <div>
                  <p class="text-sm text-muted-foreground">Payment Mode</p>
                  <p class="font-medium">{{ selectedPayout.mode }}</p>
                </div>

                <div v-if="selectedPayout.utr && selectedPayout.utr !== '-'">
                  <p class="text-sm text-muted-foreground">UTR Number</p>
                  <p class="font-mono text-sm">{{ selectedPayout.utr }}</p>
                </div>

                <div>
                  <p class="text-sm text-muted-foreground">Created At</p>
                  <p class="text-sm">{{ selectedPayout.createdAt }}</p>
                </div>

                <div v-if="selectedPayout.completedAt">
                  <p class="text-sm text-muted-foreground">Completed At</p>
                  <p class="text-sm">{{ selectedPayout.completedAt }}</p>
                </div>

                <div v-if="selectedPayout.failureReason">
                  <p class="text-sm text-muted-foreground">Failure Reason</p>
                  <p class="text-sm">{{ selectedPayout.failureReason }}</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" @click="isDetailDialogOpen = false">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  </div>
</template>
