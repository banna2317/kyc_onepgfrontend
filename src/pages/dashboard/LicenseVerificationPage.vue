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
const license_number = ref("");
const dob = ref("");
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
    if (!license_number.value.trim()) {
        toast({
            title: "Error",
            description: "Please enter License Number",
            variant: "destructive"
        });
        return;
    }
    if (!dob.value.trim()) {
        toast({
            title: "Error",
            description: "Please enter date of birth",
            variant: "destructive"
        });
        return;
    }


    try {
        const response = await axios.post("/license-verification", {

            license_number: license_number.value,
            dob: dob.value

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

        const response = await axios.post(`/license-verification-records?page=${page}`, {
            search_type: appliedFilters.value?.searchType || "",
            search_value: appliedFilters.value?.searchValue || "",
            statuses: appliedFilters.value?.statuses || [],
        });
        const res = response.data.data;
        allRecords.value = res.data;
        totalRecords.value = res.total;
        currentPage.value = res.current_page;
    } catch (err) {
        toast({
            title: "Error",
            description: "Failed to fetch verification records.",
            variant: "destructive",
        });
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

        const response = await axios.post("/license-verification-recordID", { id: id });

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
            dataType: "license_verification",
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
                <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">License Verification</h1>

                <div class="flex flex-col sm:flex-row sm:items-center gap-1 mt-2">
                    <p class="text-sm sm:text-base text-muted-foreground">
                        Verify License.
                    </p>

                    <Button variant="link" class="p-0 h-auto text-blue-600 hover:text-blue-800">
                        <ExternalLink class="h-3 w-3 mr-1" />
                        Know more
                    </Button>
                </div>
            </div>

            <Button @click="isDialogOpen = true" class="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
                Verify License
            </Button>
        </div>
        <div class="flex items-center gap-4">
            <FilterDropdown :search-options="[
                { label: 'License Number', value: 'license_number' },
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
                                        <TableHead>License Number</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>DOB</TableHead>
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
                                        <TableCell class="font-mono">{{ record.license_number }}</TableCell>
                                        <TableCell class="font-mono">{{ record.name ?? "N/A" }}</TableCell>
                                        <TableCell class="font-mono">{{ record.dob?.split("T")[0] || "N/A" }}
                                        </TableCell>
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
                    <DialogTitle>Verify License </DialogTitle>
                </DialogHeader>

                <div class="space-y-4">
                    <!-- Account Holder -->
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <Label for="License">License Number</Label>

                        </div>
                        <Input id="License" placeholder="Enter License Number" v-model="license_number" />
                    </div>
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <Label for="License">Date of Birth</Label>

                        </div>
                        <Input id="License" type="date" v-model="dob" />
                    </div>

                    <div class="flex justify-end gap-3 pt-4">
                        <Button @click="handleVerify" :disabled="!license_number"
                            class="bg-purple-600 hover:bg-purple-700">
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

                        <!-- Created At -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Verified At</span>
                            <span class="font-mono text-sm">
                                {{ selectedRecord.created_at?.substring(0, 10) }}
                            </span>
                        </div>

                        <!-- License Number -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">License Number</span>
                            <span class="font-mono">
                                {{ selectedRecord.license_number ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Name -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Name</span>
                            <span class="font-mono">
                                {{ selectedRecord.name ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Gender -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Gender</span>
                            <span class="font-mono">
                                {{ selectedRecord.gender ?? "N/A" }}
                            </span>
                        </div>

                        <!-- DOB -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">DOB</span>
                            <span class="font-mono">
                                {{ selectedRecord.dob?.substring(0, 10) ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Permanent Address -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Permanent Address</span>
                            <span class="font-mono break-words">
                                {{ selectedRecord.permanent_address ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Permanent ZIP -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Permanent ZIP</span>
                            <span class="font-mono">
                                {{ selectedRecord.permanent_zip ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Temporary Address -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Temporary Address</span>
                            <span class="font-mono break-words">
                                {{ selectedRecord.temporary_address ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Temporary ZIP -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Temporary ZIP</span>
                            <span class="font-mono">
                                {{ selectedRecord.temporary_zip ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Citizenship -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Citizenship</span>
                            <span class="font-mono">
                                {{ selectedRecord.citizenship || "N/A" }}
                            </span>
                        </div>

                        <!-- RTO Name -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">RTO / OLA Name</span>
                            <span class="font-mono">
                                {{ selectedRecord.ola_name ?? "N/A" }}
                            </span>
                        </div>

                        <!-- RTO Code -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">OLA Code</span>
                            <span class="font-mono">
                                {{ selectedRecord.ola_code ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Father / Husband Name -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Father / Husband</span>
                            <span class="font-mono break-words">
                                {{ selectedRecord.father_or_husband_name ?? "N/A" }}
                            </span>
                        </div>

                        <!-- DOI -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Date of Issue (DOI)</span>
                            <span class="font-mono">
                                {{ selectedRecord.doi?.substring(0, 10) ?? "N/A" }}
                            </span>
                        </div>

                        <!-- DOE -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Date of Expiry (DOE)</span>
                            <span class="font-mono">
                                {{ selectedRecord.doe?.substring(0, 10) ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Transport DOI -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Transport DOI</span>
                            <span class="font-mono">
                                {{ selectedRecord.transport_doi?.substring(0, 10) ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Transport DOE -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Transport DOE</span>
                            <span class="font-mono">
                                {{ selectedRecord.transport_doe?.substring(0, 10) ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Initial DOI -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Initial DOI</span>
                            <span class="font-mono">
                                {{ selectedRecord.initial_doi?.substring(0, 10) ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Blood Group -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Blood Group</span>
                            <span class="font-mono">
                                {{ selectedRecord.blood_group ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Vehicle Classes -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Vehicle Classes</span>
                            <span class="font-mono">
                                {{ Array.isArray(selectedRecord.vehicle_classes) ?
                                    selectedRecord.vehicle_classes.join(", ") :
                                    "N/A" }}
                            </span>
                        </div>

                        <!-- Additional Check -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Additional Check</span>
                            <span class="font-mono">
                                {{ JSON.stringify(selectedRecord.additional_check) }}
                            </span>
                        </div>

                        <!-- Status -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Status</span>
                            <span class="font-mono">
                                {{ selectedRecord.status }}
                            </span>
                        </div>

                        <!-- Message -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Message</span>
                            <span class="font-mono break-words">
                                {{ selectedRecord.message ?? "N/A" }}
                            </span>
                        </div>
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Fees</span>
                            <span class="font-mono break-words">
                                {{ selectedRecord.fees }}
                            </span>
                        </div>

                        <!-- Request ID -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Request ID</span>
                            <span class="font-mono">
                                {{ selectedRecord.request_id ?? "N/A" }}
                            </span>
                        </div>

                    </div>

                    <!-- Close Button -->
                    <div class="flex justify-end pt-4">
                        <Button variant="outline" @click="isViewDialogOpen = false">Close</Button>
                    </div>
                </div>


            </DialogContent>
        </Dialog>
        <div  v-if="totalRecords > perPage" class="flex flex-col gap-6">
            <AppPagination :total="totalRecords" :items-per-page="perPage" @change="getrecords" />
        </div>
    </div>
</template>
