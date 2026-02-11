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
import AppPagination from '@/components/AppPagination.vue'
import FilterDropdown from "@/components/FilterDropdown.vue"
import { PaginationNext } from '@/components/ui/pagination';
import { PaginationPrevious } from '@/components/ui/pagination';
import { Eye, FileText, ExternalLink, Loader2, CheckCircle, XCircle } from "lucide-vue-next";
import { useToast } from "@/hooks/use-toast";

interface VerificationRecord {
  id: string;
  verifiedAt: string;
  verificationId: string;
  upi: string;
  nameAtBank: string;
  accountStatus: "Active" | "Inactive" | "Dormant";
}
const appliedFilters = ref<{
  searchType: string
  searchValue: string
  statuses: string[]
} | null>(null);
const { toast } = useToast();

const searchTerm = ref("");
const timeFilter = ref("this-month");
const activeTab = ref("all");
const isDialogOpen = ref(false);
const isViewDialogOpen = ref(false);
const selectedRecord = ref<any>(null);
const isVerifying = ref(false);
const verificationResult = ref<any>(null);
const allRecords = ref<any[]>([]);
const currentPage = ref(1);
const totalRecords = ref(0);
const perPage = 5;

const formData = ref({
  upi: "",
});

// 🔍 Search Filter
const filteredRecords = computed(() =>
  allRecords.value.filter((record) => {
    const term = searchTerm.value.toLowerCase();
    return (
      (record.upi || "").toLowerCase().includes(term)

    );
  })
);

async function getrecords(page = 1) {
  try {
    const response = await axios.post(`/bank-upi-records?page=${page}`, {
            search_type: appliedFilters.value?.searchType || "",
            search_value: appliedFilters.value?.searchValue || "",
            statuses: appliedFilters.value?.statuses || [],
        });
    const res = response.data.data;

    totalRecords.value = res.total;
    currentPage.value = res.current_page;


    allRecords.value = res.data.map((record: any) => ({
      id: record.id,
      verifiedAt: formatDate(record.created_at),               // ✅ maps to template
      verificationId: record.verification_id,     // ✅ maps to template
      upi: record.upi_id,       // ✅ maps to template


      nameAtBank: record.name_at_bank,            // ✅ maps to template

      accountStatus: (() => {
        if (record.account_exists === true || record.account_exists === "true") return "Active";
        if (record.account_exists === false || record.account_exists === "false") return "Inactive";
        return record.account_exists || "Dormant";
      })(),
    }));

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

  } catch (error) {
    console.error("API Error:", error);
  }
}

onMounted(() => {
  getrecords();
});

function getStatusBadge(status: string) {
  const classes: Record<string, string> = {
    Active: "bg-green-100 text-green-800 border-green-200",
    Inactive: "bg-red-100 text-red-800 border-red-200",
    Dormant: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };
  return classes[status] || "border";
}

function getNameMatchBadge(result: string) {
  const classes: Record<string, string> = {
    Match: "bg-green-100 text-green-800 border border-green-200",
    Partial: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    "No Match": "bg-red-100 text-red-800 border border-red-200",
  };
  return classes[result] || "border";
}

// 🧾 Verify Function
async function handleVerify() {
  isVerifying.value = true;
  verificationResult.value = null;

  try {
    const response = await axios.post("/bank-upi-verify", {
      upi: formData.value.upi
    });
    getrecords();
    // Sample response data
    if (response.data.status === true) {

      isVerifying.value = false;
    }


    toast({
      title: "Success",
      description: response.data.message,
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
    isDialogOpen.value = false
  }
}

// 🔄 Reset form
function resetForm() {
  formData.value = { upi: "", };
  verificationResult.value = null;
  isDialogOpen.value = false;
}

// 👁️ View Record
async function handleViewRecord(id) {

  try {

    const response = await axios.post("/bank-upi-recordID", { id: id });

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
      dataType: "bank_mobile_upi",
      search_type: filters.searchType,
      search_value: filters.searchValue,
      statuses: filters.statuses,
    })

    console.log("API RESPONSE →", response)

    const res = response.data.data

   totalRecords.value = res.total;
    currentPage.value = res.current_page;


    allRecords.value = res.data.map((record: any) => ({
      id: record.id,
      verifiedAt: formatDate(record.created_at),               // ✅ maps to template
      verificationId: record.verification_id,     // ✅ maps to template
      upi: record.upi_id,       // ✅ maps to template


      nameAtBank: record.name_at_bank,            // ✅ maps to template

      accountStatus: (() => {
        if (record.account_exists === true || record.account_exists === "true") return "Active";
        if (record.account_exists === false || record.account_exists === "false") return "Inactive";
        return record.account_exists || "Dormant";
      })(),
    }));

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
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Bank UPI</h1>

        <div class="flex flex-col sm:flex-row sm:items-center gap-1 mt-2">
          <p class="text-sm sm:text-base text-muted-foreground">
            Bank UPI details and the verification statuses are shown here.
          </p>

          <Button variant="link" class="p-0 h-auto text-blue-600 hover:text-blue-800">
            <ExternalLink class="h-3 w-3 mr-1" />
            Know more
          </Button>
        </div>
      </div>

      <Button @click="isDialogOpen = true" class="bg-purple-600 hover:bg-purple-700 w-full md:w-auto">
        Verify Bank UPI
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
          <FilterDropdown :search-options="[
            { label: 'UPI ID', value: 'upi_id' },
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

        <!-- Table -->
        <Card>
          <CardContent class="p-0">
            <template v-if="filteredRecords.length > 0">
              <Table>
                <TableHeader>
                  <TableRow class="border-b">
                    <TableHead>Verified At</TableHead>
                    <TableHead>Verification ID</TableHead>
                    <TableHead>Bank UPI ID.</TableHead>


                    <TableHead>Name at Bank</TableHead>

                    <TableHead>Account Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="record in filteredRecords" :key="record.id" class="hover:bg-muted/50">
                    <TableCell class="font-mono text-sm">{{ record.verifiedAt }}</TableCell>
                    <TableCell class="font-mono text-sm text-blue-600">{{ record.verificationId }}
                    </TableCell>
                    <TableCell class="font-mono">{{ record.upi }}</TableCell>


                    <TableCell>{{ record.nameAtBank }}</TableCell>

                    <TableCell>
                      <Badge :class="getStatusBadge(record.accountStatus)">
                        {{ record.accountStatus }}
                      </Badge>
                    </TableCell>
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
          <DialogTitle>Verify Bank Account</DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <!-- Account + IFSC -->
          <div class="grid grid-cols gap-4">
            <div class="space-y-2">
              <Label for="upi">UPI</Label>
              <Input id="upi" placeholder="Enter UPI ID" v-model="formData.upi" />
            </div>

          </div>





          <!-- Footer Buttons -->
          <div class="flex justify-end gap-3 pt-4">
            <Button variant="outline" @click="resetForm" :disabled="isVerifying">
              {{ verificationResult ? "Close" : "Cancel" }}
            </Button>

            <Button v-if="!verificationResult" @click="handleVerify" :disabled="!formData.upi || isVerifying"
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
      <DialogContent class="sm:max-w-lg">
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
                {{ selectedRecord.created_at?.substring(0, 10) }}
              </span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-border/50">
              <span class="text-muted-foreground font-medium">Account Number</span>
              <span class="font-mono">
                {{ selectedRecord.upi_id }}
              </span>
            </div>





            <div class="flex justify-between items-center py-2 border-b border-border/50">
              <span class="text-muted-foreground font-medium">Name at Bank</span>
              <span class="font-medium">
                {{ selectedRecord.name_at_bank }}
              </span>
            </div>


            <div class="flex justify-between items-center py-2 border-b border-border/50">
              <span class="text-muted-foreground font-medium">Account Status</span>
              <Badge :class="getStatusBadge(selectedRecord.account_exists)">
                {{ selectedRecord.account_exists }}
              </Badge>
              <!-- <component :is="getStatusBadge(selectedRecord.accountStatus)" /> -->
            </div>
            <div class="flex justify-between items-center py-2 border-b border-border/50">
              <span class="text-muted-foreground font-medium">IFSC Code</span>
              <span class="font-mono">
                {{ selectedRecord.message }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-border/50">
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

    <div  v-if="totalRecords > perPage" class="flex flex-col gap-6">
      <AppPagination :total="totalRecords" :items-per-page="perPage" @change="getrecords" />
    </div>

  </div>
</template>
