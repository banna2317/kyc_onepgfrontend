<script setup lang="ts">
import { ref, computed } from "vue";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@/components/ui/dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { SelectItem } from "@/components/ui/select";
import { SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { TableBody } from "@/components/ui/table";
import { TableCell } from "@/components/ui/table";
import { TableHead } from "@/components/ui/table";
import { TableHeader } from "@/components/ui/table";
import { TableRow } from "@/components/ui/table";

import { SearchIcon, FilterIcon, ChevronDownIcon, FileTextIcon, PlayIcon, CheckCircle2Icon, XCircleIcon, ClockIcon, UserIcon } from "lucide-vue-next";

interface VerificationRecord {
  id: string;
  verificationId: string;
  aadhaarNumber: string;
  nameProvided: string;
  nameAtAadhaar: string;
  nameMatchResult: string;
  status: "Success" | "Failed" | "Pending";
  verifiedAt: string;
}

const searchTerm = ref("");
const selectedFilter = ref("all");
const timeFilter = ref("this-month");
const isDialogOpen = ref(false);

const formData = ref({
  aadhaarNumber: "",
  nameToVerify: "",
  phoneNumber: "",
  consentGiven: false
});

// Mock records
const verificationRecords = ref<VerificationRecord[]>([]);

const filteredRecords = computed(() => {
  return verificationRecords.value.filter(record => {
    const matchesSearch =
      record.aadhaarNumber.includes(searchTerm.value) ||
      record.nameProvided.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      record.verificationId.includes(searchTerm.value);

    const matchesFilter =
      selectedFilter.value === "all" ||
      (selectedFilter.value === "success" && record.status === "Success") ||
      (selectedFilter.value === "failed" && record.status === "Failed") ||
      (selectedFilter.value === "pending" && record.status === "Pending");

    return matchesSearch && matchesFilter;
  });
});

const handleVerify = () => {
  console.log("Starting Aadhaar OKYC verification:", formData.value);
  isDialogOpen.value = false;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

      <!-- LEFT SIDE -->
      <div>
        <h1 class="text-3xl font-bold tracking-tight flex items-center space-x-3">
          <UserIcon class="h-8 w-8 text-primary" />
          <span>Aadhaar OKYC</span>
        </h1>

        <p class="text-muted-foreground mt-1">
          Aadhaar verification details and statuses are shown here.
          <a href="#" class="text-primary hover:underline">Know more</a>
        </p>
      </div>

      <!-- RIGHT SIDE BUTTON -->
      <div class="flex md:block">
        <Button variant="outline" size="sm" class="text-primary border-primary w-full md:w-auto">
          <PlayIcon class="h-4 w-4 mr-2" />
          How to verify Aadhaar?
        </Button>
      </div>

    </div>


    <!-- Tabs Section -->
    <div class="border-b border-border">
      <div class="flex space-x-8">
        <button class="px-1 py-3 text-sm font-medium border-b-2 border-primary text-primary">All</button>
        <button class="px-1 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">Batch</button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 overflow-x-auto md:overflow-visible">

      <!-- FILTERS WRAPPER -->
      <div class="flex items-center space-x-4 flex-nowrap">
        <Select v-model="timeFilter">
          <SelectTrigger class="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="last-3-months">Last 3 Months</SelectItem>
            <SelectItem value="last-year">Last Year</SelectItem>
          </SelectContent>
        </Select>

        <Select v-model="selectedFilter">
          <SelectTrigger class="w-48">
            <FilterIcon class="h-4 w-4 mr-2" />
            <SelectValue placeholder="Search & Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <!-- BUTTON -->
      <Dialog v-model:open="isDialogOpen">
        <DialogTrigger asChild>
          <Button class="bg-primary hover:bg-primary/90 whitespace-nowrap">
            Verify Aadhaar OKYC
          </Button>
        </DialogTrigger>

        <DialogContent class="max-w-md">
          <DialogHeader>
            <DialogTitle>Aadhaar OKYC Verification</DialogTitle>
          </DialogHeader>

          <div class="space-y-4">
            <div>
              <Label for="aadhaar">Aadhaar Number</Label>
              <Input id="aadhaar" v-model="formData.aadhaarNumber" maxlength="12"
                placeholder="Enter 12-digit Aadhaar number" />
            </div>

            <div>
              <Label for="name">Name to Verify</Label>
              <Input id="name" v-model="formData.nameToVerify" placeholder="Enter name as per Aadhaar" />
            </div>

            <div>
              <Label for="phone">Phone Number</Label>
              <Input id="phone" v-model="formData.phoneNumber" placeholder="Enter phone number linked to Aadhaar" />
            </div>

            <div class="flex items-center space-x-2">
              <input type="checkbox" id="consent" v-model="formData.consentGiven" class="rounded border-border" />
              <Label for="consent" class="text-sm">I consent to Aadhaar verification</Label>
            </div>

            <Button class="w-full"
              :disabled="!formData.aadhaarNumber || !formData.nameToVerify || !formData.phoneNumber || !formData.consentGiven"
              @click="handleVerify">
              Start Verification
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>


    <!-- Table Section -->
    <Card>
      <CardContent class="p-0">
        <div v-if="filteredRecords.length === 0" class="flex flex-col items-center justify-center py-16 space-y-4">
          <div class="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
            <FileTextIcon class="h-8 w-8 text-muted-foreground" />
          </div>
          <div class="text-center">
            <h3 class="text-lg font-medium text-muted-foreground">No data found!</h3>
            <p class="text-sm text-muted-foreground mt-1">Please check the selected filters</p>
          </div>
        </div>

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Verified At</TableHead>
              <TableHead>Verification ID</TableHead>
              <TableHead>Aadhaar No.</TableHead>
              <TableHead>Name Provided</TableHead>
              <TableHead>Name at Aadhaar</TableHead>
              <TableHead>Name Match Result</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="record in filteredRecords" :key="record.id">
              <TableCell>{{ record.verifiedAt }}</TableCell>
              <TableCell class="font-mono text-sm">{{ record.verificationId }}</TableCell>
              <TableCell class="font-mono">{{ record.aadhaarNumber }}</TableCell>
              <TableCell>{{ record.nameProvided }}</TableCell>
              <TableCell>{{ record.nameAtAadhaar }}</TableCell>
              <TableCell>
                <Badge variant="outline" class="text-xs">{{ record.nameMatchResult }}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  :variant="record.status === 'Success' ? 'default' : record.status === 'Failed' ? 'destructive' : 'secondary'"
                  :class="{
                    'bg-green-100 text-green-800 border-green-200': record.status === 'Success',
                    'bg-red-100 text-red-800 border-red-200': record.status === 'Failed',
                    'bg-yellow-100 text-yellow-800 border-yellow-200': record.status === 'Pending'
                  }">
                  <CheckCircle2Icon v-if="record.status === 'Success'" class="h-3 w-3 mr-1" />
                  <XCircleIcon v-if="record.status === 'Failed'" class="h-3 w-3 mr-1" />
                  <ClockIcon v-if="record.status === 'Pending'" class="h-3 w-3 mr-1" />
                  {{ record.status }}
                </Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
