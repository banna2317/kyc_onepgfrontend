<script setup lang="ts">
import { ref, onMounted,watch, computed } from "vue";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Wallet, Download, Plus } from "lucide-vue-next";
import { useToast } from "@/hooks/use-toast";
import axios from "@/axios";

const { toast } = useToast();

const autoTopUp = ref(true);
const topUpAmount = ref("");
const isTopUpOpen = ref(false);

const walletBalance = ref(0);
const monthlySpend = ref(1847.30);
const dailyLimit = ref(5000.0);
const todayUsage = ref(347.5);
const currentTab = ref("usage");
const invoices = ref([
    { id: "INV-2024-001", date: "2024-01-15", amount: 2850.0, status: "paid", services: "Identity Verification", downloadUrl: "#" },
    { id: "INV-2024-002", date: "2024-01-01", amount: 3120.5, status: "paid", services: "KYC Services", downloadUrl: "#" },
    { id: "INV-2023-012", date: "2023-12-15", amount: 2640.25, status: "paid", services: "Verification Bundle", downloadUrl: "#" }
]);

const usageByService = ref([
    { service: "Aadhaar OKYC", count: 1247, cost: 4364.5, avgCost: 3.5 },
    { service: "PAN Verification", count: 892, cost: 4460.0, avgCost: 5.0 },
    { service: "Bank Verification", count: 534, cost: 2136.0, avgCost: 4.0 },
    { service: "Face Match", count: 1156, cost: 2890.0, avgCost: 2.5 },
    { service: "UPI VPA Match", count: 423, cost: 1269.0, avgCost: 3.0 }
]);

const handleTopUpWallet = () => {
    isTopUpOpen.value = true;
};

async function handleTopUpSubmit() {
    const amount = parseFloat(topUpAmount.value);
    if (!amount || amount <= 0) {
        toast({
            title: "Invalid Amount",
            description: "Please enter a valid amount greater than 0",
            variant: "destructive"
        });
        return;
    }
    try {
        const response = await axios.post("/user-topup", {

            amount: topUpAmount.value,

        });
        fetchInvoices();
        fetchWalletBalance();
        console.log('lok', response.data.status);

        if (response.data.status === true) {
            toast({
                title: "Success",
                description: response.data.message,
            });
            isTopUpOpen.value = false;
            topUpAmount.value = "";
        }

    } catch (err) {


         if (err.response && err.response.status === 422) {
            const errors = err.response.data.errors;
            Object.values(errors).forEach((msgArray) => {
                toast({
                    title: "Validation Error",
                    description: msgArray[0],
                    variant: "destructive",
                });
            });
            return;
        }
        if (err.response && err.response.status === 401) {
            toast({
                title: "Unauthorized",
                description: err.response.data.message || "Please login first.",
                variant: "destructive",
            });
            return;
        }
        toast({
            title: "Error",
            description: err.response?.data?.message || "Something went wrong.",
            variant: "destructive",
        }); 


    } finally {

    }
};


watch(currentTab, (newTab) => {
    if (newTab === "usage") {
        // fetchUsageData();
    } else if (newTab === "invoices") {
        fetchInvoices();
    }
});


const fetchInvoices = async () => {
    try {
        const response = await axios.post('/topup-history')

        if (response.data.status === true) {
            invoices.value = response.data.data
        }
    } catch (error) {
        console.error('API Error:', error)
    }
}

const handleDownloadAll = () => {
    toast({
        title: "Download Started",
        description: "All invoices are being downloaded"
    });
};

const handleDownloadInvoice = (invoiceId: string) => {
    toast({
        title: "Download Started",
        description: `Invoice ${invoiceId} is being downloaded`
    });
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case "success": return { text: "Paid", variant: "success" };
        case "pending": return { text: "pending", variant: "warning" };
        case "failed": return { text: "failed", variant: "destructive" };
        default: return { text: status, variant: "secondary" };
    }
};




const usagePercentageForService = (cost: number) => (cost / monthlySpend.value) * 100;
const fetchWalletBalance = async () => {
    try {
        const response = await axios.post('/user-wallet')

        if (response.data.status === true) {
            walletBalance.value = response.data.data
        }
    } catch (error) {
        console.error('API Error:', error)
    }
}
onMounted(() => {

    fetchWalletBalance();

});
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-bold tracking-tight">Billing & Usage</h1>
                <p class="text-muted-foreground mt-2">Manage your wallet balance, usage, and billing preferences</p>
            </div>
            <Dialog v-model:open="isTopUpOpen">
                <DialogTrigger asChild>
                    <Button @click="handleTopUpWallet">
                        <Plus class="mr-2 h-4 w-4" />
                        Top Up Wallet
                    </Button>
                </DialogTrigger>
                <DialogContent class="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Top Up Wallet</DialogTitle>
                        <DialogDescription class="text-sm text-muted-foreground">
                            Enter the amount you want to add to your wallet balance.
                        </DialogDescription>
                    </DialogHeader>
                    <div class="grid gap-4 py-4">
                        <div class="grid gap-2">
                            <Label for="amount">Amount (₹)</Label>
                            <Input id="amount" type="number" placeholder="Enter amount" v-model="topUpAmount" min="1"
                                step="0.01" />
                        </div>
                        <div class="text-sm text-muted-foreground">Minimum top-up amount: ₹100</div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" @click="isTopUpOpen = false">Cancel</Button>
                        <Button @click="handleTopUpSubmit">Add to Wallet</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>

        <!-- Wallet Balance -->
        <div class="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-sm">
            <Card class="glass-card">
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">Wallet Balance</CardTitle>
                    <Wallet class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">₹{{ walletBalance.toLocaleString() }}</div>
                    <p class="text-xs text-muted-foreground">Production environment</p>
                </CardContent>
            </Card>
        </div>

        <!-- Tabs -->
        <Tabs v-model="currentTab" class="space-y-6">
            <TabsList>
                <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
            </TabsList>

            <TabsContent value="usage">
                <Card class="glass-card">
                    <CardHeader>
                        <CardTitle>Usage Breakdown by Service</CardTitle>
                        <p class="text-sm text-muted-foreground">Current month usage and costs per verification service
                        </p>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Usage Count</TableHead>
                                    <TableHead>Total Cost</TableHead>
                                    <TableHead>Avg per Request</TableHead>
                                    <TableHead>% of Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="item in usageByService" :key="item.service">
                                    <TableCell class="font-medium">{{ item.service }}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{{ item.count.toLocaleString() }}</Badge>
                                    </TableCell>
                                    <TableCell class="font-mono">₹{{ item.cost.toLocaleString() }}</TableCell>
                                    <TableCell class="font-mono text-sm text-muted-foreground">₹{{
                                        item.avgCost.toFixed(2) }}</TableCell>
                                    <TableCell>
                                        <div class="flex items-center space-x-2">
                                            <Progress :value="usagePercentageForService(item.cost)" class="h-2 w-16" />
                                            <span class="text-sm">{{ usagePercentageForService(item.cost).toFixed(1)
                                            }}%</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="invoices">
                <Card class="glass-card">
                    <CardHeader class="w-full">
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
                            <!-- Left: Title & Description -->
                            <div class="flex flex-col">
                                <CardTitle class="">Invoice History</CardTitle>
                                <p class="text-sm text-muted-foreground">Download and manage your billing invoices</p>
                            </div>

                            <!-- Right: Download Button -->
                            <Button variant="outline" class="flex items-center" @click="handleDownloadAll">
                                <Download class="mr-2 h-4 w-4" />
                                Download All
                            </Button>
                        </div>
                    </CardHeader>



                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice ID</TableHead>
                                    <TableHead>Date</TableHead>
                                  
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="invoice in invoices" :key="invoice.id">
                                    <TableCell class="font-mono text-sm">{{ invoice.invoice_id }}</TableCell>
                                    <TableCell class="text-sm">{{ new Date(invoice.created_at).toLocaleString('en-IN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
  }) }}</TableCell>
                                 
                                    <TableCell class="font-mono">₹{{ invoice.amount.toLocaleString() }}</TableCell>
                                    <TableCell>
                                        <Badge :class="{
                                            'bg-success/10 text-success border-success/20': getStatusBadge(invoice.status).variant === 'success',
                                            'bg-warning/10 text-warning border-warning/20': getStatusBadge(invoice.status).variant === 'warning',
                                            'bg-destructive text-destructive border-destructive/20': getStatusBadge(invoice.status).variant === 'destructive',
                                            'bg-secondary/10 text-secondary border-secondary/20': getStatusBadge(invoice.status).variant === 'secondary'
                                        }">
                                            {{ getStatusBadge(invoice.status).text }}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" @click="handleDownloadInvoice(invoice.id)">
                                            <Download class="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
</template>
