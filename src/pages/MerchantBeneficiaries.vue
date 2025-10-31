<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus, Upload, Search, CheckCircle, Clock, XCircle, Building2, Smartphone
} from "lucide-vue-next";

import { useToast } from "@/hooks/use-toast"


const { toast } = useToast()
// --------------------------------------

const beneficiariesData = ref([
  {
    id: "BEN-001",
    name: "Rajesh Kumar",
    type: "bank",
    accountNumber: "50100012345678",
    ifsc: "HDFC0001234",
    bankName: "HDFC Bank",
    branch: "Mumbai Main",
    status: "verified",
    verifiedAt: "2024-09-15",
    totalPayouts: 45,
    totalAmount: 2250000,
  },
  {
    id: "BEN-002",
    name: "Priya Sharma",
    type: "bank",
    accountNumber: "60200023456789",
    ifsc: "ICIC0005678",
    bankName: "ICICI Bank",
    branch: "Delhi South",
    status: "verified",
    verifiedAt: "2024-09-20",
    totalPayouts: 32,
    totalAmount: 1600000,
  },
  {
    id: "BEN-003",
    name: "Amit Patel",
    type: "upi",
    upiId: "amit.patel@paytm",
    accountNumber: "-",
    ifsc: "-",
    bankName: "Via Paytm",
    branch: "-",
    status: "verified",
    verifiedAt: "2024-09-25",
    totalPayouts: 18,
    totalAmount: 450000,
  },
  {
    id: "BEN-004",
    name: "Sunita Desai",
    type: "bank",
    accountNumber: "80400045678901",
    ifsc: "SBIN0012345",
    bankName: "State Bank of India",
    branch: "Pune Central",
    status: "pending",
    verifiedAt: "-",
    totalPayouts: 0,
    totalAmount: 0,
  },
  {
    id: "BEN-005",
    name: "Vikram Singh",
    type: "bank",
    accountNumber: "90500056789012",
    ifsc: "KKBK0001234",
    bankName: "Kotak Mahindra Bank",
    branch: "Bangalore",
    status: "failed",
    verifiedAt: "-",
    totalPayouts: 0,
    totalAmount: 0,
    failureReason: "Account name mismatch",
  },
]);

const isAddDialogOpen = ref(false);
const isBulkUploadOpen = ref(false);
const searchQuery = ref("");
const statusFilter = ref("all");

// ✅ Toast usage now works
const handleAddBeneficiary = () => {
  toast({title:"Beneficiary Added",
  description:"Penny drop verification has been initiated. This process may take a few minutes to complete."
  });
  isAddDialogOpen.value = false;
};

const handleVerify = (id: string, name: string) => {
  toast({
    description: `Verification initiated for ${name}. Please wait 2-3 minutes.`,
  });
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "verified": return CheckCircle;
    case "pending": return Clock;
    case "failed": return XCircle;
    default: return null;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "verified": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "failed": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default: return "";
  }
};

const filteredBeneficiaries = computed(() =>
  beneficiariesData.value.filter((ben) => {
    const matchesSearch =
      ben.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      ben.accountNumber.includes(searchQuery.value) ||
      (ben.upiId && ben.upiId.includes(searchQuery.value));
    const matchesStatus = statusFilter.value === "all" || ben.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  })
);
</script>


<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Beneficiaries</h1>
      <div class="flex gap-3">
        <!-- Bulk Upload -->
        <Dialog v-model:open="isBulkUploadOpen">
          <DialogTrigger asChild>
            <Button variant="outline">
              <Upload class="mr-2 h-4 w-4" /> Bulk Upload
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Bulk Beneficiary Upload</DialogTitle>
              <DialogDescription>
                Upload multiple beneficiaries at once using a CSV file. All beneficiaries will be verified automatically.
              </DialogDescription>
            </DialogHeader>
            <div class="space-y-4 py-4">
              <Button variant="outline" class="w-full">Download CSV Template</Button>
              <div class="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload class="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p class="text-sm font-medium mb-1">Click to upload or drag and drop</p>
                <p class="text-xs text-muted-foreground">CSV file up to 5MB</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" @click="isBulkUploadOpen = false">Cancel</Button>
              <Button>Process Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <!-- Add Beneficiary -->
        <Dialog v-model:open="isAddDialogOpen">
          <DialogTrigger asChild>
            <Button variant="hero">
              <Plus class="mr-2 h-4 w-4" /> Add Beneficiary
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Beneficiary</DialogTitle>
              <DialogDescription>
                Add a bank account or UPI ID. Penny drop verification will be performed automatically.
              </DialogDescription>
            </DialogHeader>

            <Tabs default-value="bank" class="w-full">
              <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="bank"><Building2 class="h-4 w-4 mr-2" /> Bank Account</TabsTrigger>
                <TabsTrigger value="upi"><Smartphone class="h-4 w-4 mr-2" /> UPI</TabsTrigger>
              </TabsList>

              <TabsContent value="bank" class="space-y-4">
                <div class="space-y-2">
                  <Label for="name">Beneficiary Name</Label>
                  <Input id="name" placeholder="As per bank records" />
                </div>
                <div class="space-y-2">
                  <Label for="account">Account Number</Label>
                  <Input id="account" placeholder="Enter account number" />
                </div>
                <div class="space-y-2">
                  <Label for="confirm-account">Confirm Account Number</Label>
                  <Input id="confirm-account" placeholder="Re-enter account number" />
                </div>
                <div class="space-y-2">
                  <Label for="ifsc">IFSC Code</Label>
                  <Input id="ifsc" placeholder="e.g., HDFC0001234" class="uppercase" />
                </div>
                <div class="space-y-2">
                  <Label for="account-type">Account Type</Label>
                  <Select default-value="savings">
                    <SelectTrigger id="account-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="current">Current</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="bg-muted p-3 rounded-lg text-xs text-muted-foreground">
                  A ₹1 penny drop will be sent to verify the account.
                </div>
              </TabsContent>

              <TabsContent value="upi" class="space-y-4">
                <div class="space-y-2">
                  <Label for="upi-name">Beneficiary Name</Label>
                  <Input id="upi-name" placeholder="Full name" />
                </div>
                <div class="space-y-2">
                  <Label for="upi-id">UPI ID</Label>
                  <Input id="upi-id" placeholder="name@upi" />
                </div>
                <div class="bg-muted p-3 rounded-lg text-xs text-muted-foreground">
                  UPI ID will be verified instantly.
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" @click="isAddDialogOpen = false">Cancel</Button>
              <Button @click="handleAddBeneficiary">Add & Verify</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid gap-4 md:grid-cols-4">
      <Card v-for="(card, i) in [
          { title: 'Total Beneficiaries', icon: Building2, count: beneficiariesData.length, text: 'Active accounts' },
          { title: 'Verified', icon: CheckCircle, count: beneficiariesData.filter(b => b.status==='verified').length, text: 'Ready for payouts' },
          { title: 'Pending', icon: Clock, count: beneficiariesData.filter(b => b.status==='pending').length, text: 'Under verification' },
          { title: 'Failed', icon: XCircle, count: beneficiariesData.filter(b => b.status==='failed').length, text: 'Needs attention' },
        ]" :key="i">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">{{ card.title }}</CardTitle>
          <component :is="card.icon" class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ card.count }}</div>
          <p class="text-xs text-muted-foreground mt-1">{{ card.text }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- Table -->
    <Card>
      <CardHeader>
        <div class="flex flex-col sm:flex-row justify-between gap-4">
          <CardTitle>Beneficiary List</CardTitle>
          <div class="flex gap-2">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search beneficiaries..."
                v-model="searchQuery"
                class="pl-9 w-[200px]"
              />
            </div>
            <Select v-model="statusFilter">
              <SelectTrigger class="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beneficiary ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Account Details</TableHead>
              <TableHead>Bank/Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Payouts</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow v-for="ben in filteredBeneficiaries" :key="ben.id">
              <TableCell class="font-medium">{{ ben.id }}</TableCell>
              <TableCell class="font-medium">{{ ben.name }}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  <component :is="ben.type === 'bank' ? Building2 : Smartphone" class="h-3 w-3 mr-1" />
                  {{ ben.type === 'bank' ? 'Bank' : 'UPI' }}
                </Badge>
              </TableCell>
              <TableCell class="font-mono text-sm">
                <template v-if="ben.type === 'bank'">
                  <div>{{ ben.accountNumber }}</div>
                  <div class="text-xs text-muted-foreground">{{ ben.ifsc }}</div>
                </template>
                <template v-else>{{ ben.upiId }}</template>
              </TableCell>
              <TableCell>
                <div>
                  <div class="font-medium">{{ ben.bankName }}</div>
                  <div v-if="ben.branch !== '-'" class="text-xs text-muted-foreground">{{ ben.branch }}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge :class="getStatusColor(ben.status)">
                  <span class="flex items-center gap-1">
                    <component v-if="getStatusIcon(ben.status)" :is="getStatusIcon(ben.status)" class="h-4 w-4" />
                    {{ ben.status }}
                  </span>
                </Badge>
                <p v-if="ben.failureReason" class="text-xs text-red-600 mt-1">{{ ben.failureReason }}</p>
              </TableCell>
              <TableCell>{{ ben.totalPayouts }}</TableCell>
              <TableCell class="font-semibold">₹{{ ben.totalAmount.toLocaleString("en-IN") }}</TableCell>
              <TableCell>
                <Button
                  v-if="ben.status === 'pending' || ben.status === 'failed'"
                  variant="outline"
                  size="sm"
                  @click="handleVerify(ben.id, ben.name)"
                >
                  {{ ben.status === 'pending' ? 'Verify' : 'Retry' }}
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
