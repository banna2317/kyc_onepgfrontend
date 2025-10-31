<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Wallet</h1>
    </div>

    <!-- Wallet Info Cards -->
    <div class="grid gap-4 md:grid-cols-4">
      <!-- Available Balance -->
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Available Balance</CardTitle>
          <Wallet class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">₹11,95,672</div>
          <p class="text-xs text-muted-foreground mt-1">Ready for payouts</p>
        </CardContent>
      </Card>

      <!-- Account Info -->
      <Card class="h-30">
        <CardContent class="flex flex-col justify-center space-y-3 py-4 h-full">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <User class="h-4 w-4 text-muted-foreground" />
              <p class="text-xs text-muted-foreground">A/C Holder</p>
            </div>
            <p class="text-xs font-medium text-foreground">Demo user</p>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <CreditCard class="h-4 w-4 text-muted-foreground" />
              <p class="text-xs text-muted-foreground">A/C Number</p>
            </div>
            <p class="text-xs font-medium text-foreground">123456789012</p>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Building2 class="h-4 w-4 text-muted-foreground" />
              <p class="text-xs text-muted-foreground">IFSC</p>
            </div>
            <p class="text-xs font-medium text-foreground">ICIC0001234</p>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Transaction History -->
    <Card>
      <CardHeader>
        <div class="flex justify-between items-center">
          <CardTitle>Transaction History</CardTitle>
          <Button variant="outline" size="sm">
            <Download class="mr-2 h-4 w-4" />
            Download Statement
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <!-- ✅ Shadcn Table -->
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="txn in transactionsData"
              :key="txn.id"
              class="hover:bg-muted/50 cursor-pointer"
              @click="openTxnDialog(txn)"
            >
              <TableCell class="font-medium">{{ txn.id }}</TableCell>
              <TableCell>
                <Badge
                  :class="txn.type === 'credit'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'"
                >
                  <component
                    :is="txn.type === 'credit' ? ArrowDownToLine : ArrowUpFromLine"
                    class="h-3 w-3 mr-1"
                  />
                  {{ txn.type === 'credit' ? 'Credit' : 'Debit' }}
                </Badge>
              </TableCell>
              <TableCell>{{ txn.description }}</TableCell>
              <TableCell
                :class="[
                  'font-semibold',
                  txn.type === 'credit'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                ]"
              >
                {{ txn.type === 'credit' ? '+' : '-' }}₹{{ formatAmount(txn.amount) }}
              </TableCell>
              <TableCell class="font-mono">₹{{ formatAmount(txn.balance) }}</TableCell>
              <TableCell class="text-sm text-muted-foreground">{{ txn.date }}</TableCell>
              <TableCell class="font-mono text-xs">{{ txn.reference }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Transaction Details Dialog -->
    <Dialog v-model:open="isTxnDialogOpen">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <component
              :is="selectedTxn?.type === 'debit' ? TrendingDown : TrendingUp"
              class="w-5 h-5"
              :class="selectedTxn?.type === 'debit' ? 'text-destructive' : 'text-success'"
            />
            Transaction Details
          </DialogTitle>
          <DialogDescription>Complete information about this transaction</DialogDescription>
        </DialogHeader>

        <div class="space-y-4 pt-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Type</span>
            <Badge
              :variant="selectedTxn?.type === 'debit' ? 'destructive' : 'default'"
              :class="selectedTxn?.type === 'credit' ? 'bg-success text-white' : ''"
            >
              {{ selectedTxn?.type === 'debit' ? '↓ Debit' : '↑ Credit' }}
            </Badge>
          </div>

          <Separator />

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground flex items-center gap-2">
              <Wallet class="w-4 h-4" />
              Amount
            </span>
            <span
              class="text-2xl font-bold"
              :class="selectedTxn?.type === 'debit' ? 'text-destructive' : 'text-success'"
            >
              {{ selectedTxn?.type === 'debit' ? '-' : '+' }}₹{{ formatAmount(selectedTxn?.amount) }}
            </span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Balance After Transaction</span>
            <span class="text-lg font-semibold font-mono">
              ₹{{ formatAmount(selectedTxn?.balance) }}
            </span>
          </div>

          <Separator />

          <div class="space-y-2">
            <span class="text-sm text-muted-foreground flex items-center gap-2">
              <FileText class="w-4 h-4" />
              Description
            </span>
            <p class="text-sm font-medium">{{ selectedTxn?.description }}</p>
          </div>

          <Separator />

          <div class="space-y-2">
            <span class="text-sm text-muted-foreground flex items-center gap-2">
              <Hash class="w-4 h-4" />
              Transaction ID
            </span>
            <p class="text-sm font-mono bg-muted px-3 py-2 rounded">{{ selectedTxn?.id }}</p>
          </div>

          <div class="space-y-2">
            <span class="text-sm text-muted-foreground">Reference Number</span>
            <p class="text-sm font-mono bg-muted px-3 py-2 rounded">{{ selectedTxn?.reference }}</p>
          </div>

          <Separator />

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar class="w-4 h-4" />
              Date & Time
            </span>
            <span class="text-sm font-medium">{{ selectedTxn?.date }}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="isTxnDialogOpen = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Download,
  TrendingUp,
  TrendingDown,
  Building2,
  CreditCard,
  Calendar,
  Hash,
  FileText,
  User,
} from "lucide-vue-next";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const isTxnDialogOpen = ref(false);
const selectedTxn = ref(null);

const transactionsData = [
  {
    id: "TXN-001234",
    type: "debit",
    description: "Payout to Rajesh Kumar",
    amount: 50005.9,
    balance: 1195672.1,
    date: "2024-10-01 10:31 AM",
    reference: "PO-2024-001234",
  },
  {
    id: "TXN-001233",
    type: "credit",
    description: "Wallet Top-up via UPI",
    amount: 500000.0,
    balance: 1245678.0,
    date: "2024-10-01 09:15 AM",
    reference: "FUND-123456",
  },
  {
    id: "TXN-001232",
    type: "debit",
    description: "Payout to Priya Sharma",
    amount: 75005.9,
    balance: 745678.0,
    date: "2024-09-30 05:20 PM",
    reference: "PO-2024-001231",
  },
];

function openTxnDialog(txn) {
  selectedTxn.value = txn;
  isTxnDialogOpen.value = true;
}

function formatAmount(num) {
  if (!num) return "0.00";
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}
</script>
