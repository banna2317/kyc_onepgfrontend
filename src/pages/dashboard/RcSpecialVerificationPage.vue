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

const rc_number = ref("");
const allRecords = ref<any[]>([]);
const currentPage = ref(1);
const totalRecords = ref(0);
const perPage = 5;
const appliedFilters = ref<{
    searchType: string
    searchValue: string
    statuses: string[]
} | null>(null);
const isDialogOpen = ref(false);
const isViewDialogOpen = ref(false);
const selectedRecord = ref<any>(null);
const isVerifying = ref(false);

async function handleVerify() {
    isVerifying.value = true;
    if (!rc_number.value.trim()) {
        toast({
            title: "Error",
            description: "Please enter Pancard Number",
            variant: "destructive"
        });
        return;
    }


    try {
        const response = await axios.post("/rc-special", {

            rc_number: rc_number.value,

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

        const response = await axios.post(`/rc-special-records?page=${page}`, {
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
    console.log(id);
    try {

        const response = await axios.post("/rc-special-recordID", { id: id });

        if (response.data.status === true) {
            console.log(response.data.data);

            selectedRecord.value = response.data.data;
            isViewDialogOpen.value = true;

        }

    } catch (err) {

    }
    // selectedRecord.value = record;
    // isViewDialogOpen.value = true;
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
            dataType: "rc_special_verification",
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
                <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">RC Special Verification</h1>

                <div class="flex flex-col sm:flex-row sm:items-center gap-1 mt-2">
                    <p class="text-sm sm:text-base text-muted-foreground">
                        Verify RC Special.
                    </p>

                    <Button variant="link" class="p-0 h-auto text-blue-600 hover:text-blue-800">
                        <ExternalLink class="h-3 w-3 mr-1" />
                        Know more
                    </Button>
                </div>
            </div>

            <Button @click="isDialogOpen = true" class="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
                Verify RC
            </Button>
        </div>

        <div class="flex items-center gap-4">
            <FilterDropdown :search-options="[
                { label: 'RC Number', value: 'rc_number' },
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
                                        <TableHead>RC Number</TableHead>
                                        <TableHead>Registration Date</TableHead>
                                        <TableHead>Full Name</TableHead>
                                        <TableHead>Maker Model</TableHead>

                                        <TableHead>RC Status</TableHead>


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
                                        <TableCell class="font-mono">{{ record.rc_number }}</TableCell>
                                        <TableCell class="font-mono">{{ record.registration_date }}</TableCell>
                                        <TableCell class="font-mono">{{ record.owner_name }}</TableCell>
                                        <TableCell class="font-mono">{{ record.maker_model }}</TableCell>

                                        <TableCell class="font-mono">{{ record.rc_status }}</TableCell>
                                        <!-- <TableCell class="font-mono">{{ record.category ?? "N/A" }}</TableCell> -->
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
                    <DialogTitle>Verify RC Number</DialogTitle>
                </DialogHeader>

                <div class="space-y-4">
                    <!-- Account Holder -->
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <Label for="rc">RC Number</Label>

                        </div>
                        <Input id="rc" placeholder="Enter Rc Number" v-model="rc_number" />
                    </div>

                    <div class="flex justify-end gap-3 pt-4">
                        <Button @click="handleVerify" :disabled="!rc_number" class="bg-purple-600 hover:bg-purple-700">
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
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Verified At</span>
                            <span class="font-mono">{{ formatDate(selectedRecord.created_at) }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Verification ID</span>
                            <span class="font-mono">{{ selectedRecord.verification_id }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">RC Number</span>
                            <span class="font-mono">{{ selectedRecord.rc_number }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Fit Up To</span>
                            <span class="font-mono">{{ selectedRecord.fit_up_to }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Registration Date</span>
                            <span class="font-mono">{{ selectedRecord.registration_date }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Owner Name</span>
                            <span class="font-mono">{{ selectedRecord.owner_name }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Father Name</span>
                            <span class="font-mono">{{ selectedRecord.father_name }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Present Address</span>
                            <span class="font-mono break-all">{{ selectedRecord.present_address }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Permanent Address</span>
                            <span class="font-mono break-all">{{ selectedRecord.permanent_address }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Mobile Number</span>
                            <span class="font-mono">{{ selectedRecord.mobile_number }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Vehicle Category</span>
                            <span class="font-mono">{{ selectedRecord.vehicle_category }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Vehicle Chassis Number</span>
                            <span class="font-mono">{{ selectedRecord.vehicle_chasi_number }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Vehicle Engine Number</span>
                            <span class="font-mono">{{ selectedRecord.vehicle_engine_number }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Maker Description</span>
                            <span class="font-mono">{{ selectedRecord.maker_description }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Maker Model</span>
                            <span class="font-mono">{{ selectedRecord.maker_model }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Body Type</span>
                            <span class="font-mono">{{ selectedRecord.body_type }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Fuel Type</span>
                            <span class="font-mono">{{ selectedRecord.fuel_type }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Color</span>
                            <span class="font-mono">{{ selectedRecord.color }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Norms Type</span>
                            <span class="font-mono">{{ selectedRecord.norms_type }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Financer</span>
                            <span class="font-mono">{{ selectedRecord.financer }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Financed</span>
                            <span class="font-mono">{{ selectedRecord.financed ? "Yes" : "No" }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Insurance Company</span>
                            <span class="font-mono">{{ selectedRecord.insurance_company }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Insurance Policy Number</span>
                            <span class="font-mono">{{ selectedRecord.insurance_policy_number }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Insurance Upto</span>
                            <span class="font-mono">{{ selectedRecord.insurance_upto }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Manufacturing Date</span>
                            <span class="font-mono">{{ selectedRecord.manufacturing_date }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Manufacturing Date Formatted</span>
                            <span class="font-mono">{{ selectedRecord.manufacturing_date_formatted }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Registered At</span>
                            <span class="font-mono">{{ selectedRecord.registered_at }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Latest By</span>
                            <span class="font-mono">{{ selectedRecord.latest_by }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Less Info</span>
                            <span class="font-mono">{{ selectedRecord.less_info ? "Yes" : "No" }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Tax Upto</span>
                            <span class="font-mono">{{ selectedRecord.tax_upto }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Tax Paid Upto</span>
                            <span class="font-mono">{{ selectedRecord.tax_paid_upto }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Cubic Capacity</span>
                            <span class="font-mono">{{ selectedRecord.cubic_capacity }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Vehicle Gross Weight</span>
                            <span class="font-mono">{{ selectedRecord.vehicle_gross_weight }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Number of Cylinders</span>
                            <span class="font-mono">{{ selectedRecord.no_cylinders }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Seat Capacity</span>
                            <span class="font-mono">{{ selectedRecord.seat_capacity }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Sleeper Capacity</span>
                            <span class="font-mono">{{ selectedRecord.sleeper_capacity }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Standing Capacity</span>
                            <span class="font-mono">{{ selectedRecord.standing_capacity }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Wheelbase</span>
                            <span class="font-mono">{{ selectedRecord.wheelbase }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Unladen Weight</span>
                            <span class="font-mono">{{ selectedRecord.unladen_weight }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Vehicle Category Description</span>
                            <span class="font-mono">{{ selectedRecord.vehicle_category_description }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">PUCC Number</span>
                            <span class="font-mono">{{ selectedRecord.pucc_number }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">PUCC Upto</span>
                            <span class="font-mono">{{ selectedRecord.pucc_upto }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Permit Number</span>
                            <span class="font-mono">{{ selectedRecord.permit_number }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Permit Issue Date</span>
                            <span class="font-mono">{{ selectedRecord.permit_issue_date }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Permit Valid From</span>
                            <span class="font-mono">{{ selectedRecord.permit_valid_from }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Permit Valid Upto</span>
                            <span class="font-mono">{{ selectedRecord.permit_valid_upto }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Permit Type</span>
                            <span class="font-mono">{{ selectedRecord.permit_type }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">National Permit Number</span>
                            <span class="font-mono">{{ selectedRecord.national_permit_number }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">National Permit Upto</span>
                            <span class="font-mono">{{ selectedRecord.national_permit_upto }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">National Permit Issued By</span>
                            <span class="font-mono">{{ selectedRecord.national_permit_issued_by }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Non Use Status</span>
                            <span class="font-mono">{{ selectedRecord.non_use_status ? "Yes" : "No" }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Non Use From</span>
                            <span class="font-mono">{{ selectedRecord.non_use_from }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Non Use To</span>
                            <span class="font-mono">{{ selectedRecord.non_use_to }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Blacklist Status</span>
                            <span class="font-mono">{{ selectedRecord.blacklist_status ? "Yes" : "No" }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">NOC Number</span>
                            <span class="font-mono">{{ selectedRecord.noc_details }}</span>
                        </div>



                        <!-- Nested Challan Details -->
                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Total Challans</span>
                            <span class="font-mono">{{ selectedRecord.challan_details }}</span>
                        </div>



                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Owner Number</span>
                            <span class="font-mono">{{ selectedRecord.owner_number }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">RC Status</span>
                            <span class="font-mono">{{ selectedRecord.rc_status }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Masked Name</span>
                            <span class="font-mono">{{ selectedRecord.masked_name }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Variant</span>
                            <span class="font-mono">{{ selectedRecord.variant }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">RTO Code</span>
                            <span class="font-mono">{{ selectedRecord.rto_code }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Status</span>
                            <span class="font-mono">{{ selectedRecord.status }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Message</span>
                            <span class="font-mono">{{ selectedRecord.message }}</span>
                        </div>

                        <div class="flex flex-col border-b p-2">
                            <span class="text-muted-foreground font-medium">Fees</span>
                            <span class="font-mono">{{ selectedRecord.fees }}</span>
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
        <div v-if="totalRecords > perPage" class="flex flex-col gap-6">
            <AppPagination :total="totalRecords" :items-per-page="perPage" @change="getrecords" />
        </div>
    </div>
</template>
