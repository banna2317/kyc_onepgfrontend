<script setup lang="ts">
import { h, ref, computed, onMounted } from "vue";
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
import axios from "@/axios";
import { Eye, FileText, ExternalLink, Loader2 } from "lucide-vue-next";
import { useToast } from "@/hooks/use-toast";
import AppPagination from '@/components/AppPagination.vue';
import FilterDropdown from "@/components/FilterDropdown.vue";
const appliedFilters = ref<{
    searchType: string
    searchValue: string
    statuses: string[]
} | null>(null);
const gstin = ref("");
const allRecords = ref<any[]>([]);
const currentPage = ref(1);
const totalRecords = ref(0);
const perPage = 5;

const isDialogOpen = ref(false);
const isViewDialogOpen = ref(false);
const selectedRecord = ref<any>(null);
const isVerifying = ref(false);

async function handleVerify() {
    isVerifying.value = true;
    if (!gstin.value.trim()) {
        toast({
            title: "Error",
            description: "Please enter GST Number",
            variant: "destructive"
        });
        return;
    }
    try {
        const response = await axios.post("/gst-verification", {

            gstin: gstin.value,

        });

        getrecords();
        toast({
            title: "Success",
            description: response.data.message,
        });
        isDialogOpen.value = false;
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
    }
}

async function getrecords(page = 1) {
    try {

        const response = await axios.post(`/gst-verification-records?page=${page}`, {
            search_type: appliedFilters.value?.searchType || "",
            search_value: appliedFilters.value?.searchValue || "",
            statuses: appliedFilters.value?.statuses || [],
        });
        const res = response.data.data;
        allRecords.value = res.data;
        totalRecords.value = res.total;
        currentPage.value = res.current_page;
    } catch (err) {

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

const { toast } = useToast();

async function handleViewRecord(id) {
    try {

        const response = await axios.post("/gst-verification-recordID", { id: id });

        if (response.data.status === true) {
            selectedRecord.value = response.data.data;
            isViewDialogOpen.value = true;

        }

    } catch (err) {

    }
}
const handleFilter = async (filters: {
    searchType: string
    searchValue: string
    statuses: string[]
}) => {
    console.log("FILTER FROM CHILD →", filters)
    appliedFilters.value = { ...filters }
    try {
        const response = await axios.post("/filterdata", {
            dataType: "gst_verification",
            search_type: filters.searchType,
            search_value: filters.searchValue,
            statuses: filters.statuses,
        })

        console.log("API RESPONSE →", response)

        const res = response.data.data
        allRecords.value = res.data;
        totalRecords.value = res.total;
        currentPage.value = res.current_page;

    } catch (error) {
        console.error("API ERROR →", error)
    }
}

</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            <div>
                <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">GSTIN Number
                    Verification</h1>

                <div class="flex flex-col sm:flex-row sm:items-center gap-1 mt-2">
                    <p class="text-sm sm:text-base text-muted-foreground">
                        Verify GSTIN.
                    </p>

                    <Button variant="link" class="p-0 h-auto text-blue-600 hover:text-blue-800">
                        <ExternalLink class="h-3 w-3 mr-1" />
                        Know more
                    </Button>
                </div>
            </div>

            <Button @click="isDialogOpen = true" class="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
                Verify GST
            </Button>
        </div>

        <div class="flex items-center gap-4">
            <FilterDropdown :search-options="[
                { label: 'GSTIN Number', value: 'gstin' },
                { label: 'Verification ID', value: 'verification_id' }
            ]" @apply="handleFilter" />

            <div v-if="appliedFilters" class="flex flex-wrap gap-2 mb-3 text-sm">
                <span class="px-2 py-1 bg-gray-100 rounded">
                    Search By:
                    <b>{{ appliedFilters.searchType }}</b>
                </span>

                <span v-if="appliedFilters.searchValue" class="px-2 py-1 bg-gray-100 rounded">
                    Value:
                    <b>{{ appliedFilters.searchValue }}</b>
                </span>

                <span v-if="appliedFilters.statuses.length" class="px-2 py-1 bg-gray-100 rounded">
                    Status:
                    <b>{{ appliedFilters.statuses.join(', ') }}</b>
                </span>
            </div>
        </div>
        <!-- Tabs -->
        <Tabs default-value="records">

            <TabsContent value="records" class="space-y-4">

                <Card>
                    <CardContent class="p-0">
                        <template v-if="allRecords.length > 0">
                            <Table>
                                <TableHeader>
                                    <TableRow class="border-b">
                                        <TableHead>Verified At</TableHead>
                                        <TableHead>Verification ID</TableHead>
                                        <TableHead>Company ID Number</TableHead>
                                        <TableHead>Legal Name</TableHead>



                                        <TableHead>Status</TableHead>

                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow v-for="record in allRecords" :key="record.id" class="hover:bg-muted/50">
                                        <TableCell class="font-mono text-sm">{{ formatDate(record.created_at) }}
                                        </TableCell>
                                        <TableCell class="font-mono text-sm text-blue-600">{{ record.verification_id }}
                                        </TableCell>
                                        <TableCell class="font-mono">{{ record.gstin }}</TableCell>
                                        <TableCell class="font-mono">{{ record.legal_name ?? "N/A" }}</TableCell>

                                        <TableCell>{{ record.status }}</TableCell>


                                        <TableCell>
                                            <Button variant="ghost" size="sm" @click="handleViewRecord(record)"
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
                    <DialogTitle>Verify GST </DialogTitle>
                </DialogHeader>

                <div class="space-y-4">
                    <!-- Account Holder -->
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <Label for="gst">GST Number </Label>

                        </div>
                        <Input id="gst" placeholder="Enter GST Number" v-model="gstin" />
                    </div>

                    <div class="flex justify-end gap-3 pt-4">
                        <Button @click="handleVerify" :disabled="!gstin" class="bg-purple-600 hover:bg-purple-700">
                            <Loader2 v-if="isVerifying" class="mr-2 h-4 w-4 animate-spin" />
                            <template v-if="!isVerifying">Verify</template>
                            <template v-else>Verifying...</template>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        <Dialog v-model:open="isViewDialogOpen">
            <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Verification Details</DialogTitle>
                </DialogHeader>

                <div v-if="selectedRecord" class="space-y-4">

                    <div class="grid grid-cols-1 gap-4">

                        <!-- Verification ID -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Verification ID</span>
                            <span class="font-mono text-sm text-blue-600">
                                {{ selectedRecord.verification_id }}
                            </span>
                        </div>

                        <!-- Verified At -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Verified At</span>
                            <span class="font-mono text-sm">
                                {{ formatDate(selectedRecord.created_at) }}
                            </span>
                        </div>


                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">GST Number</span>
                            <span class="font-mono">
                                {{ selectedRecord.gstin ?? "N/A" }}
                            </span>
                        </div>
                        <!-- PAN Number -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.pan_number">
                            <span class="text-muted-foreground font-medium">PAN Number</span>
                            <span class="font-mono">
                                {{ selectedRecord.pan_number }}
                            </span>
                        </div>

                        <!-- Business Name -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.business_name">
                            <span class="text-muted-foreground font-medium">Business Name</span>
                            <span class="font-mono">
                                {{ selectedRecord.business_name }}
                            </span>
                        </div>

                        <!-- Legal Name -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.legal_name">
                            <span class="text-muted-foreground font-medium">Legal Name</span>
                            <span class="font-mono">
                                {{ selectedRecord.legal_name }}
                            </span>
                        </div>

                        <!-- Center Jurisdiction -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.center_jurisdiction">
                            <span class="text-muted-foreground font-medium">Centre Jurisdiction</span>
                            <span class="font-mono">
                                {{ selectedRecord.center_jurisdiction }}
                            </span>
                        </div>

                        <!-- State Jurisdiction -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.state_jurisdiction">
                            <span class="text-muted-foreground font-medium">State Jurisdiction</span>
                            <span class="font-mono">
                                {{ selectedRecord.state_jurisdiction }}
                            </span>
                        </div>

                        <!-- Date of Registration -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.date_of_registration">
                            <span class="text-muted-foreground font-medium">Date of Registration</span>
                            <span class="font-mono">
                                {{ formatDate(selectedRecord.date_of_registration) }}
                            </span>
                        </div>

                        <!-- Constitution of Business -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.constitution_of_business">
                            <span class="text-muted-foreground font-medium">Business Constitution</span>
                            <span class="font-mono">
                                {{ selectedRecord.constitution_of_business }}
                            </span>
                        </div>

                        <!-- Taxpayer Type -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.taxpayer_type">
                            <span class="text-muted-foreground font-medium">Taxpayer Type</span>
                            <span class="font-mono">
                                {{ selectedRecord.taxpayer_type }}
                            </span>
                        </div>

                        <!-- GSTIN Status -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.gstin_status">
                            <span class="text-muted-foreground font-medium">GSTIN Status</span>
                            <span class="font-mono capitalize">
                                {{ selectedRecord.gstin_status }}
                            </span>
                        </div>

                        <!-- Date of Cancellation -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.date_of_cancellation && selectedRecord.date_of_cancellation !== '1800-01-01'">
                            <span class="text-muted-foreground font-medium">Date of Cancellation</span>
                            <span class="font-mono">
                                {{ formatDate(selectedRecord.date_of_cancellation) }}
                            </span>
                        </div>

                        <!-- Field Visit Conducted -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.field_visit_conducted">
                            <span class="text-muted-foreground font-medium">Field Visit Conducted</span>
                            <span class="font-mono">
                                {{ selectedRecord.field_visit_conducted }}
                            </span>
                        </div>

                        <!-- Nature of Business Activities -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.nature_bus_activities?.length">
                            <span class="text-muted-foreground font-medium">Nature of Business</span>
                            <span class="font-mono">
                                {{ selectedRecord.nature_bus_activities.join(', ') }}
                            </span>
                        </div>

                        <!-- Core Business Activity Code -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.nature_of_core_business_activity_code">
                            <span class="text-muted-foreground font-medium">Core Business Code</span>
                            <span class="font-mono">
                                {{ selectedRecord.nature_of_core_business_activity_code }}
                            </span>
                        </div>

                        <!-- Core Business Activity Description -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.nature_of_core_business_activity_description">
                            <span class="text-muted-foreground font-medium">Core Activity Description</span>
                            <span class="font-mono">
                                {{ selectedRecord.nature_of_core_business_activity_description }}
                            </span>
                        </div>

                        <!-- Address -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.address">
                            <span class="text-muted-foreground font-medium">Address</span>
                            <span class="font-mono">
                                {{ selectedRecord.address }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-border/50"
                            v-if="selectedRecord.address">
                            <span class="text-muted-foreground font-medium">Fees</span>
                            <span class="font-mono">
                                {{ selectedRecord.fees }}
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
        <div class="flex flex-col gap-6">
            <AppPagination :total="totalRecords" :items-per-page="perPage" @change="getrecords" />
        </div>
    </div>
</template>
