<script setup lang="ts">
import { h, ref, computed, onMounted } from "vue";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'vue-input-otp'
import { TabsTrigger } from "@/components/ui/tabs";
import { SelectItem } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { PinInput, PinInputGroup, PinInputSeparator, PinInputSlot } from '@/components/ui/pin-input';
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
import AppPagination from '@/components/AppPagination.vue';
import FilterDropdown from "@/components/FilterDropdown.vue";
import { Eye, FileText, ExternalLink, Loader2 } from "lucide-vue-next";
import { useToast } from "@/hooks/use-toast";
const isOtpSubmitting = ref(false);
let tempAadhar = ""; // store aadhaar for OTP submit
const aadhaar_number = ref("");
const verification_id = ref("");
const allRecords = ref<any[]>([]);
const currentPage = ref(1);
const totalRecords = ref(0);
const perPage = 5;
const handleComplete = (e: string[]) => e.join("")
const otp = ref<string[]>([]);
const isDialogOpen = ref(false);
const isViewDialogOpen = ref(false);
const selectedRecord = ref<any>(null);
const isVerifying = ref(false);
const isOtpDialogOpen = ref(false);
const appliedFilters = ref<{
    searchType: string
    searchValue: string
    statuses: string[]
} | null>(null);
async function handleVerify() {
    isVerifying.value = true;
    if (!aadhaar_number.value.trim()) {
        toast({
            title: "Error",
            description: "Please enter Pancard Number",
            variant: "destructive"
        });
        return;
    }
    try {
        const response = await axios.post("/aadhaar-v2/generate-otp", {
            aadhaar_number: aadhaar_number.value,
        });
        console.log(response.data.verification_id);
        if (response.data.status == true) {
            toast({
                title: "Success",
                description: "OTP send successfully!",
            });
            isOtpDialogOpen.value = true;
            verification_id.value = response.data.verification_id
        } else {

            toast({
                title: "Success",
                description: response.data.message,
            });

        }

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

        const response = await axios.post(`/aadhaar-verification-records?page=${page}`, {
            search_type: appliedFilters.value?.searchType || "",
            search_value: appliedFilters.value?.searchValue || "",
            statuses: appliedFilters.value?.statuses || [],
        });
        const res = response.data.data;
        allRecords.value = res.data;
        totalRecords.value = res.total;
        currentPage.value = res.current_page;


    } catch (err) {
        // toast({
        //     title: "Error",
        //     description: "Failed to fetch verification records.",
        //     variant: "destructive",
        // });
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
        const response = await axios.post("/aadhaar-verification-recordsID", { id: id });
        if (response.data.status === true) {
            selectedRecord.value = response.data.data;
            isViewDialogOpen.value = true;
        }
    } catch (err) {
    }
}
async function handleSubmitOtp() {
    isOtpSubmitting.value = true;
    const otpe = otp.value.join("");
    try {
        const response = await axios.post("/aadhaar-v2/submit-otp", {
            otp: otpe,
            verification_id: verification_id.value
        });
        console.log(response);
        if (response.data.status == true) {
            toast({
                title: "Success",
                description: "Aadhaar verified successfully!",
            });
            isOtpDialogOpen.value = false;
            otp.value = [];
        }
    } catch (err) {
        toast({
            title: "Error",
            description: err.response?.data?.message || "Invalid OTP",
            variant: "destructive",
        });
    } finally {
        isOtpSubmitting.value = false;

        getrecords();
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
            dataType: "aadhaar_otp_verification",
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
                <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Aadhaar v2 Verification</h1>

                <div class="flex flex-col sm:flex-row sm:items-center gap-1 mt-2">
                    <p class="text-sm sm:text-base text-muted-foreground">
                        Verify Aadhaar v2.
                    </p>

                    <Button variant="link" class="p-0 h-auto text-blue-600 hover:text-blue-800">
                        <ExternalLink class="h-3 w-3 mr-1" />
                        Know more
                    </Button>
                </div>
            </div>

            <Button @click="isDialogOpen = true" class="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
                Verify Aadhar
            </Button>
        </div>

        <div class="flex items-center gap-4">
            <FilterDropdown :search-options="[
                { label: 'Aadhaar Number', value: 'aadhaar_number' },
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
                                        <TableHead>Aadhar Number</TableHead>
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
                                        <TableCell class="font-mono">{{ record.aadhaar_number }}</TableCell>
                                        <TableCell class="font-mono">{{ record.full_name ?? "N/A" }}</TableCell>
                                        <TableCell class="font-mono"> {{ record.dob ? formatDate(record.dob) : 'N/A' }}
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
                    <DialogTitle>Verify Aadhaar</DialogTitle>
                </DialogHeader>

                <div class="space-y-4">
                    <!-- Account Holder -->
                    <div class="space-y-2">
                        <div class="flex items-center gap-2">
                            <Label for="adhar">Aadhaar Number</Label>

                        </div>
                        <Input id="adhar" placeholder="Enter Aadhaar Number" v-model="aadhaar_number" />
                    </div>

                    <div class="flex justify-end gap-3 pt-4">
                        <Button @click="handleVerify" :disabled="!aadhaar_number"
                            class="bg-purple-600 hover:bg-purple-700">
                            <Loader2 v-if="isVerifying" class="mr-2 h-4 w-4 animate-spin" />
                            <template v-if="!isVerifying">Verify</template>
                            <template v-else>Verifying...</template>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        <!-- OTP Dialog -->
        <Dialog v-model:open="isOtpDialogOpen">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Enter OTP</DialogTitle>
                </DialogHeader>

                <div class="space-y-4">
                    <div>

                        <div class="flex justify-center mt-4">
                            <PinInput id="pin-input" v-model="otp" placeholder="○" @complete="handleComplete">
                                <PinInputGroup>
                                    <PinInputSlot v-for="(id, index) in 6" :key="id" :index="index"
                                        class="w-12 h-12 m-2 text-xl border rounded-xl flex items-center justify-center" />
                                </PinInputGroup>
                            </PinInput>
                        </div>
                    </div>

                    <div class="flex justify-end pt-4">
                        <Button @click="handleSubmitOtp" :disabled="!otp" class="bg-purple-600 hover:bg-purple-700">
                            <Loader2 v-if="isOtpSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                            <template v-if="!isOtpSubmitting">Submit OTP</template>
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
                                {{ formatDate(selectedRecord.created_at) }}
                            </span>
                        </div>

                        <!-- Aadhaar Number -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Aadhaar Number</span>
                            <span class="font-mono">
                                {{ selectedRecord.aadhaar_number }}
                            </span>
                        </div>

                        <!-- Full Name -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Full Name</span>
                            <span class="font-mono">
                                {{ selectedRecord.full_name ?? "N/A" }}
                            </span>
                        </div>

                        <!-- DOB -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Date of Birth</span>
                            <span class="font-mono">
                                {{ formatDate(selectedRecord.dob) }}
                            </span>
                        </div>

                        <!-- Gender -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Gender</span>
                            <span class="font-mono">
                                {{ selectedRecord.gender ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Address -->
                        <div v-if="selectedRecord.address"
                            class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Country</span>
                            <span class="font-mono">{{ JSON.parse(selectedRecord.address).country ?? "N/A" }}</span>
                        </div>

                        <div v-if="selectedRecord.address"
                            class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">District</span>
                            <span class="font-mono">{{ JSON.parse(selectedRecord.address).dist ?? "N/A" }}</span>
                        </div>

                        <div v-if="selectedRecord.address"
                            class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">State</span>
                            <span class="font-mono">{{ JSON.parse(selectedRecord.address).state ?? "N/A" }}</span>
                        </div>

                        <div v-if="selectedRecord.address"
                            class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Post Office</span>
                            <span class="font-mono">{{ JSON.parse(selectedRecord.address).po ?? "N/A" }}</span>
                        </div>

                        <div v-if="selectedRecord.address"
                            class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Location</span>
                            <span class="font-mono">{{ JSON.parse(selectedRecord.address).loc ?? "N/A" }}</span>
                        </div>

                        <div v-if="selectedRecord.address"
                            class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">VTC</span>
                            <span class="font-mono">{{ JSON.parse(selectedRecord.address).vtc ?? "N/A" }}</span>
                        </div>

                        <div v-if="selectedRecord.address"
                            class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Subdistrict</span>
                            <span class="font-mono">{{ JSON.parse(selectedRecord.address).subdist ?? "N/A" }}</span>
                        </div>

                        <div v-if="selectedRecord.address"
                            class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Street</span>
                            <span class="font-mono">{{ JSON.parse(selectedRecord.address).street ?? "N/A" }}</span>
                        </div>

                        <div v-if="selectedRecord.address"
                            class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">House</span>
                            <span class="font-mono">{{ JSON.parse(selectedRecord.address).house ?? "N/A" }}</span>
                        </div>

                        <div v-if="selectedRecord.address"
                            class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Landmark</span>
                            <span class="font-mono">{{ JSON.parse(selectedRecord.address).landmark ?? "N/A" }}</span>
                        </div>

                        <!-- Zip -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Zip / Pincode</span>
                            <span class="font-mono">
                                {{ selectedRecord.zip ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Face Status -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Face Status</span>
                            <span class="font-mono">
                                {{ selectedRecord.face_status ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Face Score -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Face Score</span>
                            <span class="font-mono">
                                {{ selectedRecord.face_score ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Email Hash -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Email Hash</span>
                            <span class="font-mono">
                                {{ selectedRecord.email_hash ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Mobile Hash -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Mobile Hash</span>
                            <span class="font-mono">
                                {{ selectedRecord.mobile_hash
                                    ? selectedRecord.mobile_hash.substring(0, 6) + '****' +
                                    selectedRecord.mobile_hash.slice(-4)
                                    : 'N/A'
                                }}
                            </span>
                        </div>

                        <!-- Mobile Verified -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Mobile Verified</span>
                            <span class="font-mono">
                                {{ selectedRecord.mobile_verified ? "Yes" : "No" }}
                            </span>
                        </div>

                        <!-- Share Code -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Share Code</span>
                            <span class="font-mono">
                                {{ selectedRecord.share_code ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Reference ID -->


                        <!-- Status -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Status</span>
                            <span class="font-mono">
                                {{ selectedRecord.status ?? "N/A" }}
                            </span>
                        </div>

                        <!-- Message -->
                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Message</span>
                            <span class="font-mono">
                                {{ selectedRecord.message ?? "N/A" }}
                            </span>
                        </div>

                        <div class="flex justify-between items-center py-2 border-b border-border/50">
                            <span class="text-muted-foreground font-medium">Fees</span>
                            <span class="font-mono">
                                {{ selectedRecord.fees ?? "N/A" }}
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
