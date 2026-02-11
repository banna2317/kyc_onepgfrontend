<script setup lang="ts">
import { ref, computed } from "vue";
import { useToast } from "@/hooks/use-toast";

// UI Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Icons
import { ExternalLink, Shield, Eye, Copy, FileText, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-vue-next";

// Types
interface AadhaarMaskingRecord {
    id: string;
    maskedAt: string;
    requestId: string;
    originalAadhaar: string;
    maskedAadhaar: string;
    maskingType: "Standard" | "Full" | "Partial";
    status: "Success" | "Failed";
    format: "PDF" | "Image" | "Text";
}

const { toast } = useToast();

// Refs
const searchTerm = ref("");
const timeFilter = ref("this-month");
const activeTab = ref("all");
const isDialogOpen = ref(false);
const isViewDialogOpen = ref(false);
const selectedRecord = ref<AadhaarMaskingRecord | null>(null);
const isProcessing = ref(false);
const maskingResult = ref<any>(null);
const formData = ref({
    aadhaarNumber: "",
    maskingType: "standard",
    outputFormat: "text"
});

// Mock data
const maskingRecords = ref<AadhaarMaskingRecord[]>([
    { id: "1", maskedAt: "2024-01-15 14:30:25", requestId: "MSK1705327825123", originalAadhaar: "123456789012", maskedAadhaar: "XXXXXXXX9012", maskingType: "Standard", status: "Success", format: "Text" },
    { id: "2", maskedAt: "2024-01-14 09:15:42", requestId: "MSK1705220142456", originalAadhaar: "987654321098", maskedAadhaar: "XXXXXXXX1098", maskingType: "Standard", status: "Success", format: "PDF" }
]);

const filteredRecords = computed(() => {
    return maskingRecords.value.filter(record => {
        return record.originalAadhaar.includes(searchTerm.value) ||
            record.maskedAadhaar.includes(searchTerm.value) ||
            record.requestId.toLowerCase().includes(searchTerm.value.toLowerCase());
    });
});

// Badge Classes
const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case "Success": return "bg-green-100 text-green-800 border-green-200";
        case "Failed": return "bg-red-100 text-red-800 border-red-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

const getMaskingTypeBadgeClass = (type: string) => {
    switch (type) {
        case "Standard": return "bg-blue-100 text-blue-800 border-blue-200";
        case "Full": return "bg-purple-100 text-purple-800 border-purple-200";
        case "Partial": return "bg-orange-100 text-orange-800 border-orange-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

// Methods
const handleMask = async () => {
    if (!formData.value.aadhaarNumber || formData.value.aadhaarNumber.length !== 12) {
        toast({ title: "Invalid Aadhaar", description: "Please enter a valid 12-digit Aadhaar number", variant: "destructive" });
        return;
    }
    isProcessing.value = true;
    maskingResult.value = null;

    try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // mock API delay
        maskingResult.value = {
            success: true,
            maskedAadhaar: formData.value.aadhaarNumber.replace(/\d(?=\d{4})/g, "X"),
            requestId: "MSK" + Date.now(),
            cost: 1
        };
        toast({ title: "Aadhaar Masked Successfully", description: `Masked Aadhaar generated. Cost: ₹1` });
    } catch {
        toast({ title: "Error", description: "Masking failed", variant: "destructive" });
    } finally {
        isProcessing.value = false;
    }
};

const resetForm = () => {
    formData.value = { aadhaarNumber: "", maskingType: "standard", outputFormat: "text" };
    maskingResult.value = null;
    isDialogOpen.value = false;
};

const handleViewRecord = (record: AadhaarMaskingRecord) => {
    selectedRecord.value = record;
    isViewDialogOpen.value = true;
};

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Masked Aadhaar copied to clipboard" });
};
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

  <!-- LEFT SECTION -->
  <div>
    <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
      Aadhaar Masking
    </h1>

    <div class="flex flex-col sm:flex-row sm:items-center sm:gap-1 mt-2">
      <p class="text-muted-foreground">
        Secure Aadhaar number masking for privacy protection
      </p>

      <Button
        variant="link"
        class="p-0 h-auto text-blue-600 hover:text-blue-800 mt-1 sm:mt-0"
      >
        <ExternalLink class="h-3 w-3 mr-1" /> Know more
      </Button>
    </div>
  </div>

  <!-- RIGHT BUTTON -->
  <Button
    @click="isDialogOpen = true"
    class="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
  >
    <Shield class="mr-2 h-4 w-4" /> Mask Aadhaar
  </Button>
</div>


        <!-- Tabs -->
        <Tabs v-model="activeTab">
            <TabsList class="bg-transparent border-b border-border rounded-none w-full justify-start p-0">
                <TabsTrigger value="all"
                    class="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent">
                    All</TabsTrigger>
                <TabsTrigger value="batch"
                    class="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent">
                    Batch</TabsTrigger>
            </TabsList>

            <TabsContent value="all" class="space-y-4">
                <!-- Filter -->
                <div class="flex items-center gap-4 mb-2">
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
                            <SelectItem value="aadhaar">Aadhaar Number</SelectItem>
                            <SelectItem value="request-id">Request ID</SelectItem>
                            <SelectItem value="status">Status</SelectItem>
                            <SelectItem value="type">Masking Type</SelectItem>
                        </SelectContent>
                    </Select>
                   
                </div>

                <!-- Table -->
                <Card>
                    <CardContent class="p-0">
                        <Table v-if="filteredRecords.length">
                            <TableHeader>
                                <TableRow class="border-b">
                                    <TableHead>Masked At</TableHead>
                                    <TableHead>Request ID</TableHead>
                                    <TableHead>Original Aadhaar</TableHead>
                                    <TableHead>Masked Aadhaar</TableHead>
                                    <TableHead>Masking Type</TableHead>
                                    <TableHead>Format</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="record in filteredRecords" :key="record.id" class="hover:bg-muted/50">
                                    <TableCell class="font-mono text-sm">{{ record.maskedAt }}</TableCell>
                                    <TableCell class="font-mono text-sm text-blue-600">{{ record.requestId }}
                                    </TableCell>
                                    <TableCell class="font-mono">{{ record.originalAadhaar }}</TableCell>
                                    <TableCell class="font-mono font-bold">{{ record.maskedAadhaar }}</TableCell>
                                    <TableCell>
                                        <Badge :class="getMaskingTypeBadgeClass(record.maskingType)">{{
                                            record.maskingType }}</Badge>
                                    </TableCell>
                                    <TableCell>{{ record.format }}</TableCell>
                                    <TableCell>
                                        <Badge :class="getStatusBadgeClass(record.status)">{{ record.status }}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" @click="handleViewRecord(record)"
                                            class="text-blue-600 hover:text-blue-800">
                                            <Eye class="h-4 w-4 mr-1" /> View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>

                        <div v-else class="flex flex-col items-center justify-center py-16">
                            <FileText class="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <h3 class="text-lg font-semibold mb-2">No data found!</h3>
                            <p class="text-muted-foreground">Please check the selected filters</p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="batch">
                <Card>
                    <CardContent class="flex flex-col items-center justify-center py-16">
                        <FileText class="h-16 w-16 text-muted-foreground/30 mb-4" />
                        <h3 class="text-lg font-semibold mb-2">Batch masking coming soon</h3>
                        <p class="text-muted-foreground">Upload CSV files for bulk Aadhaar masking</p>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

        <!-- Masking Dialog -->
        <Dialog v-model:open="isDialogOpen">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Aadhaar Masking</DialogTitle>
                </DialogHeader>
                <div class="space-y-4">
                    <div class="space-y-2">
                        <Label for="aadhaarNumber">Aadhaar Number</Label>
                        <Input id="aadhaarNumber" v-model="formData.aadhaarNumber" maxlength="12"
                            placeholder="Enter 12-digit Aadhaar Number" />
                    </div>

                    <div class="space-y-2">
                        <Label for="maskingType">Masking Type</Label>
                        <Select v-model="formData.maskingType">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="standard">Standard (Show last 4 digits)</SelectItem>
                                <SelectItem value="partial">Partial (Show first 2 and last 4)</SelectItem>
                                <SelectItem value="full">Full (Mask all digits)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="space-y-2">
                        <Label for="outputFormat">Output Format</Label>
                        <Select v-model="formData.outputFormat">
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="image">Image</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <div class="flex items-start gap-2">
                            <AlertCircle class="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div class="text-sm text-blue-700">
                                <p class="font-medium mb-1">Privacy Protection:</p>
                                <ul class="list-disc list-inside space-y-1 text-xs">
                                    <li>Secure masking of sensitive digits</li>
                                    <li>100% accuracy and instant processing</li>
                                    <li>No data storage after masking</li>
                                    <li>Compliance with privacy regulations</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- ₹ Deduction Message -->
                    <div v-if="!maskingResult" class="bg-orange-50 border border-orange-200 rounded-md p-3 mt-3">
                        <p class="text-sm text-orange-600">
                            ₹ 1.00 will be deducted from your available balance
                        </p>
                    </div>

                    <!-- Masking Result -->
                    <div v-if="maskingResult" class="space-y-4 p-4 bg-muted/30 rounded-lg border mt-4">
                        <div class="flex items-center gap-2">
                            <CheckCircle v-if="maskingResult.success" class="h-5 w-5 text-green-600" />
                            <XCircle v-else class="h-5 w-5 text-red-600" />

                            <span class="font-semibold">
                                {{ maskingResult.success ? "Masking Successful" : "Masking Failed" }}
                            </span>
                        </div>

                        <!-- Masking Success Box -->
                        <div v-if="maskingResult.success" class="space-y-3">
                            <div class="p-3 bg-background rounded border">
                                <div class="flex justify-between items-center">
                                    <div>
                                        <p class="text-sm text-muted-foreground mb-1">Masked Aadhaar:</p>
                                        <p class="font-mono text-lg font-bold">
                                            {{ maskingResult.maskedAadhaar }}
                                        </p>
                                    </div>

                                    <button class="border rounded-md px-2 py-1 text-sm flex items-center"
                                        @click="copyToClipboard(maskingResult.maskedAadhaar)">
                                        <Copy class="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-muted-foreground">Request ID:</span>
                                    <span class="font-mono">{{ maskingResult.requestId }}</span>
                                </div>

                                <div class="flex justify-between">
                                    <span class="text-muted-foreground">Cost:</span>
                                    <span class="font-medium text-green-600">
                                        ₹{{ maskingResult.cost }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 pt-4">
                        <Button variant="outline" @click="resetForm" :disabled="isProcessing">{{ maskingResult ? 'Close'
                            : 'Cancel' }}</Button>
                        <Button v-if="!maskingResult" @click="handleMask"
                            :disabled="!formData.aadhaarNumber || formData.aadhaarNumber.length !== 12 || isProcessing"
                            class="bg-purple-600 hover:bg-purple-700">
                            <Loader2 v-if="isProcessing" class="mr-2 h-4 w-4 animate-spin" />
                            <span v-else>Mask Aadhaar</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        <!-- View Record Dialog -->
        <Dialog v-model:open="isViewDialogOpen">
            <DialogContent class="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Aadhaar Masking Details</DialogTitle>
                </DialogHeader>
                <div v-if="selectedRecord" class="space-y-4">
                    <div class="grid grid-cols-1 gap-4">
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Request ID</span>
                            <span class="font-mono text-sm text-blue-600">{{ selectedRecord.requestId }}</span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Masked At</span>
                            <span class="font-mono text-sm">{{ selectedRecord.maskedAt }}</span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Original Aadhaar</span>
                            <span class="font-mono">{{ selectedRecord.originalAadhaar }}</span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Masked Aadhaar</span>
                            <div class="flex items-center gap-2">
                                <span class="font-mono font-bold">{{ selectedRecord.maskedAadhaar }}</span>
                                <Button variant="ghost" size="sm"
                                    @click="copyToClipboard(selectedRecord.maskedAadhaar)">
                                    <Copy class="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Masking Type</span>
                            <Badge :class="getMaskingTypeBadgeClass(selectedRecord.maskingType)">{{
                                selectedRecord.maskingType }}</Badge>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Output Format</span>
                            <span class="font-medium">{{ selectedRecord.format }}</span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Status</span>
                            <Badge :class="getStatusBadgeClass(selectedRecord.status)">{{ selectedRecord.status }}
                            </Badge>
                        </div>
                        <div class="flex justify-between items-center py-2">
                            <span class="text-muted-foreground font-medium">Cost</span>
                            <span class="font-semibold text-green-600">₹1.00</span>
                        </div>
                    </div>
                    <div class="flex justify-end pt-4">
                        <Button variant="outline" @click="isViewDialogOpen = false">Close</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </div>
</template>
