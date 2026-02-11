<script setup lang="ts">
import { h, ref, computed, onMounted } from "vue";
import axios from "@/axios";
import { TabsTrigger } from "@/components/ui/tabs";
import { SelectItem } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";

import { TableHead } from "@/components/ui/table";
import { TableBody } from "@/components/ui/table";
import { TableCell } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { Table } from "@/components/ui/table";
import { TableHeader } from "@/components/ui/table";
import { TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CardContent from "@/components/ui/card/CardContent.vue";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";
import { TabsList } from "@/components/ui/tabs";

import { Eye, FileText, ExternalLink, Loader2, CheckCircle, XCircle } from "lucide-vue-next";
import { useToast } from "@/hooks/use-toast";



const { toast } = useToast();

const searchTerm = ref("");
const timeFilter = ref("this-month");
const activeTab = ref("all");
const isDialogOpen = ref(false);
const isViewDialogOpen = ref(false);
const selectedRecord = ref<any>(null);
const isVerifying = ref(false);
const verificationResult = ref<any>(null);
const allRecords = ref([]);
const phoneNumber = ref("");
const allupiRecords = ref([]);
const formData = ref({
    accountNumber: "",
    ifsc: "",
    accountHolderName: "",
    phoneNumber: "",
    countryCode: "+91",
});




async function getrecords() {
    try {
        const response = await axios.post("/bank-mobile-to-upi-advances-records");
        allupiRecords.value = response.data.data;

    } catch (error) {
        console.error("API Error:", error);
    }
}

onMounted(() => {
    getrecords();
});


function formatDate(isoString: string) {
    const date = new Date(isoString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-based
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const sec = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
}
// 🧾 Verify Function
async function handleVerify() {
    isVerifying.value = true;
    verificationResult.value = null;
    console.log(formData.value.phoneNumber);

    try {
        const response = await axios.post("/bank-mobile-to-upi-advances", {

            phone_number: phoneNumber.value,
        });
        getrecords();


        toast({
            title: "Success",
            description: response.data.message || "Verification completed successfully.",
        });

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
        isVerifying.value = false;
        isDialogOpen.value = false;
    }
}

// 🔄 Reset form
function resetForm() {
    formData.value = { accountNumber: "", ifsc: "", accountHolderName: "", phoneNumber: "", countryCode: "+91" };
    verificationResult.value = null;
    isDialogOpen.value = false;
}

// 👁️ View Record
async function handleViewRecord(id) {

    try {

        const response = await axios.post("/bank-mobile-to-upi-advances-recordID", { id: id });

        if (response.data.status === true) {
            selectedRecord.value = response.data.data;
            isViewDialogOpen.value = true;

        }

    } catch (err) {

    }
}
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            <div>
                <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Bank Account Mobile Number To UPI
                    Advances </h1>

                <div class="flex flex-col sm:flex-row sm:items-center gap-1 mt-2">
                    <p class="text-sm sm:text-base text-muted-foreground">
                        Bank account details and the verification statuses are shown here.
                    </p>

                    <Button variant="link" class="p-0 h-auto text-blue-600 hover:text-blue-800">
                        <ExternalLink class="h-3 w-3 mr-1" />
                        Know more
                    </Button>
                </div>
            </div>

            <Button @click="isDialogOpen = true" class="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
                Chek UPI ID
            </Button>
        </div>


        <!-- Tabs -->
        <Tabs v-model="activeTab">
            <TabsList class="bg-transparent border-b border-border rounded-none w-full justify-start p-0">
                <TabsTrigger value="all"
                    class="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600">
                    All
                </TabsTrigger>
                <TabsTrigger value="batch"
                    class="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600">
                    Batch
                </TabsTrigger>
            </TabsList>

            <!-- All Tab -->
            <TabsContent value="all" class="space-y-4">
                <!-- Filters -->
                <div class="flex items-center gap-4">
                    <Select v-model="timeFilter">
                        <SelectTrigger class="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="this-month">This Month</SelectItem>
                            <SelectItem value="last-month">Last Month</SelectItem>
                            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                            <SelectItem value="all-time">All Time</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select>
                        <SelectTrigger class="w-48">
                            <SelectValue placeholder="Search & Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="account-number">Account Number</SelectItem>
                            <SelectItem value="ifsc">IFSC Code</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <!-- Table -->
                <Card>
                    <CardContent class="p-0">
                        <template v-if="allupiRecords.length > 0">
                            <Table>
                                <TableHeader>
                                    <TableRow class="border-b">
                                        <TableHead>Verified At</TableHead>
                                        <TableHead>phone Number</TableHead>
                                        <TableHead>Verification ID</TableHead>
                                        <TableHead>UPI ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>PSP Name</TableHead>
                                        <TableHead>Bank Name</TableHead>
                                        <TableHead>IFSC</TableHead>

                                        <TableHead> Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow v-for="record in allupiRecords" :key="record.id"
                                        class="hover:bg-muted/50">

                                        <TableCell class="font-mono text-sm">{{ formatDate(record.created_at) }}
                                        </TableCell>
                                        <TableCell class="font-mono text-sm text-blue-600">{{ record.phone_number }}
                                        </TableCell>
                                        <TableCell class="font-mono text-blue-600">{{ record.verification_id }}
                                        </TableCell>
                                        <TableCell class="font-mono">{{ record.upi_id }}</TableCell>
                                        <TableCell>{{ record.name }}</TableCell>
                                        <TableCell>{{ record.psp_name }}</TableCell>
                                        <TableCell>{{ record.branch_name }}</TableCell>
                                        <TableCell>{{ record.ifsc_code }}</TableCell>
                                        <TableCell>{{ record.status }}</TableCell>

                                        <TableCell>
                                            <Button variant="ghost" size="sm" @click="handleViewRecord(record.id)"
                                                class="text-blue-600 hover:text-blue-800">
                                                <Eye class="h-4 w-4 mr-1" /> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </template>
                        <template v-else>
                            <div class="flex flex-col items-center justify-center py-16">
                                <div class="relative mb-4">
                                    <FileText class="h-16 w-16 text-muted-foreground/30" />
                                    <FileText class="h-12 w-12 text-muted-foreground/50 absolute top-2 left-2" />
                                </div>
                                <h3 class="text-lg font-semibold mb-2">No data found!</h3>
                                <p class="text-muted-foreground">Please check the selected filters</p>
                            </div>
                        </template>
                    </CardContent>
                </Card>
            </TabsContent>

            <!-- Batch Tab -->
            <TabsContent value="batch">
                <Card>
                    <CardContent class="flex flex-col items-center justify-center py-16">
                        <FileText class="h-16 w-16 text-muted-foreground/30 mb-4" />
                        <h3 class="text-lg font-semibold mb-2">Batch verification coming soon</h3>
                        <p class="text-muted-foreground">Upload CSV files for bulk verification</p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

        <!-- Verify Dialog -->
        <Dialog :open="isDialogOpen" @update:open="val => isDialogOpen = val">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>FIND UPI ID</DialogTitle>
                </DialogHeader>

                <div class="space-y-4">




                    <!-- Phone Number -->
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <Label for="phoneNumber">Phone Number</Label>

                        </div>

                        <div class="flex">
                            <Select v-model="formData.countryCode">
                                <SelectTrigger class="w-28 rounded-r-none border-r-0 bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="+91">🇮🇳 +91</SelectItem>
                                    <SelectItem value="+1">🇺🇸 +1</SelectItem>
                                    <SelectItem value="+44">🇬🇧 +44</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input id="phoneNumber" placeholder="Phone Number" v-model="phoneNumber"
                                class="rounded-l-none" />
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 pt-4">
                        <Button variant="outline" @click="resetForm" :disabled="isVerifying">
                            {{ verificationResult ? "Close" : "Cancel" }}
                        </Button>

                        <Button v-if="!verificationResult" @click="handleVerify" :disabled="!phoneNumber || isVerifying"
                            class="bg-purple-600 hover:bg-purple-700">
                            <Loader2 v-if="isVerifying" class="mr-2 h-4 w-4 animate-spin" />
                            <template v-if="!isVerifying">Verify</template>
                            <template v-else>Verifying...</template>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        <!-- View Record Dialog -->
        <Dialog v-model:open="isViewDialogOpen">
            <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Verification Details</DialogTitle>
                </DialogHeader>

                <div v-if="selectedRecord" class="space-y-4">
                    <div class="grid grid-cols-1 gap-4">
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Verification ID</span>
                            <span class="font-mono text-sm text-blue-600">
                                {{ selectedRecord.verification_id }}
                            </span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Verified At</span>
                            <span class="font-mono text-sm">
                                {{ formatDate(selectedRecord.created_at) }}
                            </span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Phone Number</span>
                            <span class="font-mono">
                                {{ selectedRecord.phone_number }}
                            </span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">UPI ID</span>
                            <span class="font-mono">
                                {{ selectedRecord.upi_id }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">BRANCH NAME</span>
                            <span class="font-mono">
                                {{ selectedRecord.branch_name }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">IFSC Code</span>
                            <span class="font-mono">
                                {{ selectedRecord.ifsc_code }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">BRANCH ADDRESS</span>
                            <span class="font-mono">
                                {{ selectedRecord.branch_address }}
                            </span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Name</span>
                            <span class="font-medium">
                                {{ selectedRecord.name }}
                            </span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Payment Service Provider Name </span>
                            <span class="font-medium">
                                {{ selectedRecord.psp_name }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Payment Service Provider Name </span>
                            <span class="font-medium">
                                {{ selectedRecord.message }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Status</span>
                            <span class="font-medium">
                                {{ selectedRecord.status }}

                            </span>
                        </div>




                    </div>

                    <div class="flex justify-end pt-4">
                        <Button variant="outline" @click="isViewDialogOpen = false">
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </div>
</template>
