<script setup lang="ts">
import { ref, computed } from "vue"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import {
  Search,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Eye,
  CreditCard,
  AlertCircle,
  User,
} from "lucide-vue-next"

import { useToast } from "@/hooks/use-toast"

interface PANVerificationRecord {
  id: string
  verifiedAt: string
  verificationId: string
  panNumber: string
  nameOnPAN: string
  nameProvided: string
  nameMatchResult: "Full Match" | "Partial Match" | "No Match"
  panStatus: "Valid" | "Invalid" | "Cancelled"
  category: "Individual" | "Company" | "Firm" | "Trust"
  dateOfBirth: string
  fatherName: string
  status: "Success" | "Failed"
}

interface VerifyForm {
  panNumber: string
  nameToMatch: string
  dateOfBirth: string
}

const { toast } = useToast()

// STATE
const searchTerm = ref("")
const timeFilter = ref("this-month")
const activeTab = ref("all")
const isDialogOpen = ref(false)
const isViewDialogOpen = ref(false)
const selectedRecord = ref<PANVerificationRecord | null>(null)
const isVerifying = ref(false)
const verificationResult = ref<any>(null)

const formData = ref<VerifyForm>({
  panNumber: "",
  nameToMatch: "",
  dateOfBirth: "",
})

// MOCK RECORDS
const verificationRecords = ref<PANVerificationRecord[]>([
  {
    id: "1",
    verifiedAt: "2024-01-15 14:30:25",
    verificationId: "PAN1705327825123",
    panNumber: "ABCDE1234F",
    nameOnPAN: "JOHN DOE",
    nameProvided: "John Doe",
    nameMatchResult: "Full Match",
    panStatus: "Valid",
    category: "Individual",
    dateOfBirth: "15/08/1990",
    fatherName: "MICHAEL DOE",
    status: "Success",
  },
  {
    id: "2",
    verifiedAt: "2024-01-14 09:15:42",
    verificationId: "PAN1705220142456",
    panNumber: "XYZAB5678C",
    nameOnPAN: "JANE SMITH KUMAR",
    nameProvided: "Jane Smith",
    nameMatchResult: "Partial Match",
    panStatus: "Valid",
    category: "Individual",
    dateOfBirth: "22/03/1985",
    fatherName: "ROBERT SMITH",
    status: "Success",
  },
])

// FILTERED RECORDS
const filteredRecords = computed(() => {
  const search = searchTerm.value.toLowerCase()
  return verificationRecords.value.filter((record) => {
    return (
      record.panNumber.toLowerCase().includes(search) ||
      record.nameOnPAN.toLowerCase().includes(search) ||
      record.nameProvided.toLowerCase().includes(search)
    )
  })
})

// MOCK VERIFY (supabase HATAYA)
const handleVerify = async () => {
  if (!formData.value.panNumber || formData.value.panNumber.length !== 10) {
    toast({
      title: "Invalid PAN",
      description: "Please enter a valid 10-character PAN number",
      variant: "destructive",
    })
    return
  }

  isVerifying.value = true
  verificationResult.value = null

  try {
    // yaha pe normally API call hota (supabase/functions)
    // abhi ke liye mock response:
    await new Promise((resolve) => setTimeout(resolve, 1200))

    const mock = {
      success: true,
      nameOnPAN: "JOHN DOE",
      panStatus: "Valid",
      category: "Individual",
      nameMatch: "Full Match",
      cost: 5.0,
    }

    verificationResult.value = mock

    if (mock.success) {
      toast({
        title: "PAN Verified Successfully",
        description: `PAN verification completed. Cost: ₹${mock.cost}`,
      })
    } else {
      toast({
        title: "Verification Failed",
        description: "PAN verification failed",
        variant: "destructive",
      })
    }
  } catch (e) {
    console.error("Verification error:", e)
    toast({
      title: "Error",
      description: "Failed to verify PAN. Please try again.",
      variant: "destructive",
    })
  } finally {
    isVerifying.value = false
  }
}

const resetForm = () => {
  formData.value = {
    panNumber: "",
    nameToMatch: "",
    dateOfBirth: "",
  }
  verificationResult.value = null
  isDialogOpen.value = false
}

const handleViewRecord = (record: PANVerificationRecord) => {
  selectedRecord.value = record
  isViewDialogOpen.value = true
}

// Badge helpers (string return, v-html use)
const getPANStatusBadge = (status: string) => {
  switch (status) {
    case "Valid":
      return `<span class="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Valid</span>`
    case "Invalid":
      return `<span class="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Invalid</span>`
    case "Cancelled":
      return `<span class="inline-flex items-center rounded-full border border-orange-200 bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">Cancelled</span>`
    default:
      return `<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">${status}</span>`
  }
}

const getNameMatchBadge = (result: string) => {
  switch (result) {
    case "Full Match":
      return `<span class="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Full Match</span>`
    case "Partial Match":
      return `<span class="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">Partial Match</span>`
    case "No Match":
      return `<span class="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">No Match</span>`
    default:
      return `<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">${result}</span>`
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

      <!-- LEFT CONTENT -->
      <div>
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight">PAN 360</h1>

        <div class="flex flex-col sm:flex-row sm:items-center gap-1 mt-2">
          <p class="text-muted-foreground">
            Enhanced PAN verification with complete profile data
          </p>

          <Button variant="link" class="p-0 h-auto text-blue-600 hover:text-blue-800 sm:ml-1">
            <ExternalLink class="h-3 w-3 mr-1" />
            Know more
          </Button>
        </div>
      </div>

      <!-- RIGHT BUTTON -->
      <Button class="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto" @click="isDialogOpen = true">
        <User class="mr-2 h-4 w-4" />
        Verify PAN
      </Button>
    </div>


    <!-- Tabs -->
    <Tabs v-model="activeTab">
      <TabsList class="bg-transparent border-b border-border rounded-none w-full justify-start p-0">
        <TabsTrigger value="all"
          class="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent">
          All
        </TabsTrigger>
        <TabsTrigger value="batch"
          class="rounded-none border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:bg-transparent">
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
              <SelectItem value="pan-number">PAN Number</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="match-result">Match Result</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Table -->
        <Card>
          <CardContent class="p-0">
            <template v-if="filteredRecords.length">
              <Table>
                <TableHeader>
                  <TableRow class="border-b">
                    <TableHead class="text-left font-medium text-muted-foreground">
                      Verified At
                    </TableHead>
                    <TableHead class="text-left font-medium text-muted-foreground">
                      Verification ID
                    </TableHead>
                    <TableHead class="text-left font-medium text-muted-foreground">
                      PAN Number
                    </TableHead>
                    <TableHead class="text-left font-medium text-muted-foreground">
                      Name on PAN
                    </TableHead>
                    <TableHead class="text-left font-medium text-muted-foreground">
                      Name Provided
                    </TableHead>
                    <TableHead class="text-left font-medium text-muted-foreground">
                      Name Match
                    </TableHead>
                    <TableHead class="text-left font-medium text-muted-foreground">
                      PAN Status
                    </TableHead>
                    <TableHead class="text-left font-medium text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  <TableRow v-for="record in filteredRecords" :key="record.id" class="hover:bg-muted/50">
                    <TableCell class="font-mono text-sm">
                      {{ record.verifiedAt }}
                    </TableCell>
                    <TableCell class="font-mono text-sm text-blue-600">
                      {{ record.verificationId }}
                    </TableCell>
                    <TableCell class="font-mono font-bold">
                      {{ record.panNumber }}
                    </TableCell>
                    <TableCell>
                      {{ record.nameOnPAN }}
                    </TableCell>
                    <TableCell>
                      {{ record.nameProvided }}
                    </TableCell>
                    <TableCell>
                      <Badge :class="getNameMatchBadge(record.nameMatchResult)">
                        {{ record.nameMatchResult }}
                      </Badge>

                    </TableCell>
                    <TableCell>
                      <Badge :class="getPANStatusBadge(record.panStatus)">
                        {{ record.panStatus }}
                      </Badge>

                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" class="text-blue-600 hover:text-blue-800"
                        @click="handleViewRecord(record)">
                        <Eye class="h-4 w-4 mr-1" />
                        View
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
                  <User class="h-12 w-12 text-muted-foreground/50 absolute top-2 left-2" />
                </div>
                <h3 class="text-lg font-semibold mb-2">No data found!</h3>
                <p class="text-muted-foreground">
                  Please check the selected filters
                </p>
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
            <h3 class="text-lg font-semibold mb-2">
              Batch verification coming soon
            </h3>
            <p class="text-muted-foreground">
              Upload CSV files for bulk PAN verification
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <!-- Verification Dialog -->
    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>PAN 360 Verification</DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div class="space-y-2">
            <Label for="panNumber">PAN Number</Label>
            <Input id="panNumber" placeholder="Enter 10-character PAN" type="text" maxlength="10"
              :value="formData.panNumber"
              @input="(e: any) => formData.panNumber = e.target.value.toUpperCase().slice(0, 10)" />
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <Label for="nameToMatch">Name to Match</Label>
              <span class="text-sm text-muted-foreground">Optional</span>
            </div>
            <Input id="nameToMatch" placeholder="Enter name for verification" v-model="formData.nameToMatch" />
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <Label for="dateOfBirth">Date of Birth</Label>
              <span class="text-sm text-muted-foreground">Optional</span>
            </div>
            <Input id="dateOfBirth" type="date" v-model="formData.dateOfBirth" />
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div class="flex items-start gap-2">
              <AlertCircle class="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div class="text-sm text-blue-700">
                <p class="font-medium mb-1">PAN 360 includes:</p>
                <ul class="list-disc list-inside space-y-1 text-xs">
                  <li>Complete name verification</li>
                  <li>Date of birth validation</li>
                  <li>Father's name details</li>
                  <li>PAN status and category</li>
                  <li>Enhanced profile data</li>
                </ul>
              </div>
            </div>
          </div>

          <div v-if="!verificationResult" class="bg-orange-50 border border-orange-200 rounded-md p-3">
            <p class="text-sm text-orange-600">
              ₹ 5.00 will be deducted from your available balance
            </p>
          </div>

          <div v-if="verificationResult" class="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <div class="flex items-center gap-2">
              <CheckCircle v-if="verificationResult.success" class="h-5 w-5 text-green-600" />
              <XCircle v-else class="h-5 w-5 text-red-600" />
              <span class="font-semibold">
                {{ verificationResult.success ? "Verification Successful" : "Verification Failed" }}
              </span>
            </div>

            <div v-if="verificationResult.success" class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Name on PAN:</span>
                <span class="font-medium">
                  {{ verificationResult.nameOnPAN }}
                </span>
              </div>

              <div class="flex justify-between">
                <span class="text-muted-foreground">PAN Status:</span>
                <span :class="[
                  'font-medium',
                  verificationResult.panStatus === 'Valid'
                    ? 'text-green-600'
                    : 'text-red-600',
                ]">
                  {{ verificationResult.panStatus }}
                </span>
              </div>

              <div class="flex justify-between">
                <span class="text-muted-foreground">Category:</span>
                <span class="font-medium">
                  {{ verificationResult.category }}
                </span>
              </div>

              <div v-if="verificationResult.nameMatch" class="flex justify-between">
                <span class="text-muted-foreground">Name Match:</span>
                <span :class="[
                  'font-medium',
                  verificationResult.nameMatch === 'Full Match'
                    ? 'text-green-600'
                    : 'text-orange-600',
                ]">
                  {{ verificationResult.nameMatch }}
                </span>
              </div>

              <div class="flex justify-between">
                <span class="text-muted-foreground">Cost:</span>
                <span class="font-medium text-green-600">
                  ₹{{ verificationResult.cost }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <Button variant="outline" @click="resetForm" :disabled="isVerifying">
              {{ verificationResult ? "Close" : "Cancel" }}
            </Button>

            <Button v-if="!verificationResult" class="bg-purple-600 hover:bg-purple-700" @click="handleVerify"
              :disabled="!formData.panNumber ||
                formData.panNumber.length !== 10 ||
                isVerifying
                ">
              <Loader2 v-if="isVerifying" class="mr-2 h-4 w-4 animate-spin" />
              {{ isVerifying ? "Verifying..." : "Verify PAN" }}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- View Record Details Dialog -->
    <Dialog v-model:open="isViewDialogOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>PAN 360 Verification Details</DialogTitle>
        </DialogHeader>

        <div v-if="selectedRecord" class="space-y-4">
          <div class="grid grid-cols-1 gap-4">
            <div class="flex justify-between items-center py-2 border-b border-border/50">
              <span class="text-muted-foreground font-medium">Verification ID</span>
              <span class="font-mono text-sm text-blue-600">
                {{ selectedRecord.verificationId }}
              </span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-border/50">
              <span class="text-muted-foreground font-medium">Verified At</span>
              <span class="font-mono text-sm">
                {{ selectedRecord.verifiedAt }}
              </span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-border/50">
              <span class="text-muted-foreground font-medium">PAN Number</span>
              <span class="font-mono font-bold">
                {{ selectedRecord.panNumber }}
              </span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-border/50">
              <span class="text-muted-foreground font-medium">Name on PAN</span>
              <span class="font-medium">
                {{ selectedRecord.nameOnPAN }}
              </span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-border/50">
              <span class="text-muted-foreground font-medium">Name Provided</span>
              <span class="font-medium">
                {{ selectedRecord.nameProvided }}
              </span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-border/50">
              <span class="text-muted-foreground font-medium">Name Match Result</span>
              <Badge :class="getNameMatchBadge(selectedRecord.nameMatchResult)">
                {{ selectedRecord.nameMatchResult }}
              </Badge>

            </div>

            <div class="flex justify-between items-center py-2 border-b border-border/50">
              <span class="text-muted-foreground font-medium">PAN Status</span>
              <Badge :class="getPANStatusBadge(selectedRecord.panStatus)">
                {{ selectedRecord.panStatus }}
              </Badge>

            </div>

            <div class="flex justify-between items-center py-2 border-b border-border/50">
              <span class="text-muted-foreground font-medium">Category</span>
              <span class="font-medium">
                {{ selectedRecord.category }}
              </span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-border/50">
              <span class="text-muted-foreground font-medium">Date of Birth</span>
              <span class="font-medium">
                {{ selectedRecord.dateOfBirth }}
              </span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-border/50">
              <span class="text-muted-foreground font-medium">Father's Name</span>
              <span class="font-medium">
                {{ selectedRecord.fatherName }}
              </span>
            </div>

            <div class="flex justify-between items-center py-2">
              <span class="text-muted-foreground font-medium">Cost</span>
              <span class="font-semibold text-green-600">
                ₹5.00
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
