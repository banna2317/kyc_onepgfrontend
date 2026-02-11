<script setup lang="ts">
import { ref, computed } from "vue"
import { useToast } from "@/hooks/use-toast"

// shadcn-vue Components
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

// Icons (lucide-vue-next)
import { Search, FileText, Calendar, Clock, Check, X } from "lucide-vue-next"

interface VerificationRecord {
    id: string
    documentType: string
    verifiedAt: string
    status: "success" | "failed" | "pending"
    documentNumber: string
    cost: string
}

interface VerificationType {
    id: string
    name: string
    checked: boolean
}

const { toast } = useToast()
const isDialogOpen = ref(false)
const searchTerm = ref("")

const verificationTypes = ref([
    { id: "aadhaar", name: "Aadhaar ", checked: false },
    { id: "pan", name: "Pan ", checked: false },
    { id: "dl", name: "Driving License ", checked: false },
]);

// Mock Records
const verificationRecords = ref<VerificationRecord[]>([
    {
        id: "DL001",
        documentType: "Aadhaar",
        verifiedAt: "2024-01-15 14:30",
        status: "success",
        documentNumber: "XXXX-XXXX-1234",
        cost: "₹8.00",
    },
    {
        id: "DL002",
        documentType: "PAN",
        verifiedAt: "2024-01-14 11:20",
        status: "success",
        documentNumber: "ABCDE1234F",
        cost: "₹8.00",
    },
    {
        id: "DL003",
        documentType: "Driving License",
        verifiedAt: "2024-01-13 16:45",
        status: "failed",
        documentNumber: "DL-0123456789",
        cost: "₹8.00",
    },
    {
        id: "DL004",
        documentType: "Aadhaar",
        verifiedAt: "2024-01-12 09:15",
        status: "pending",
        documentNumber: "XXXX-XXXX-5678",
        cost: "₹8.00",
    },
])

const filteredRecords = computed(() => {
    return verificationRecords.value.filter((record) => {
        const s = searchTerm.value.toLowerCase()
        return (
            record.documentType.toLowerCase().includes(s) ||
            record.documentNumber.toLowerCase().includes(s) ||
            record.id.toLowerCase().includes(s)
        )
    })
})

const handleVerificationTypeChange = (id: string, checked: boolean) => {
    verificationTypes.value = verificationTypes.value.map((type) =>
        type.id === id ? { ...type, checked } : type
    )
}

const handleVerifyNow = () => {
    const selected = verificationTypes.value.filter(t => t.checked)

    console.log("Selected:", selected)

    if (selected.length === 0) {
        toast({
            title: "No verification types selected",
            description: "Please select at least one verification type to proceed.",
            variant: "destructive",
        })
        return
    }

    toast({
        title: "Verification initiated",
        description: `Started verification for: ${selected.map(t => t.name).join(", ")}`,
    })

    isDialogOpen.value = false

    verificationTypes.value = verificationTypes.value.map(t => ({
        ...t,
        checked: false,
    }))
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case "success":
            return {
                label: "Success",
                variant: "default",
                class: "bg-green-100 text-green-800 border-green-200",
                icon: Check,
            }
        case "failed":
            return {
                label: "Failed",
                variant: "destructive",
                class: "",
                icon: X,
            }
        case "pending":
            return {
                label: "Pending",
                variant: "secondary",
                class: "",
                icon: Clock,
            }
        default:
            return {
                label: status,
                variant: "outline",
                class: "",
                icon: null,
            }
    }
}
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

            <!-- LEFT -->
            <div>
                <h1 class="text-2xl md:text-3xl font-semibold text-foreground">
                    DigiLocker Document Verification
                </h1>
                <p class="text-muted-foreground mt-1">
                    Verify documents directly from DigiLocker with our secure API integration
                </p>
            </div>

            <!-- RIGHT BUTTON -->
            <Button @click="isDialogOpen = true" class="flex items-center gap-2 w-full sm:w-auto">
                <FileText class="w-4 h-4" />
                Verify Document
            </Button>
        </div>


        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardHeader class="pb-2">
                    <CardTitle class="text-sm text-muted-foreground">Total Verifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{{ verificationRecords.length }}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="pb-2">
                    <CardTitle class="text-sm text-muted-foreground">Successful</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-green-600">
                        {{verificationRecords.filter((r) => r.status === "success").length}}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="pb-2">
                    <CardTitle class="text-sm text-muted-foreground">Failed</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-red-600">
                        {{verificationRecords.filter((r) => r.status === "failed").length}}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="pb-2">
                    <CardTitle class="text-sm text-muted-foreground">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold text-yellow-600">
                        {{verificationRecords.filter((r) => r.status === "pending").length}}
                    </div>
                </CardContent>
            </Card>
        </div>

        <!-- Search Bar -->
        <div class="flex gap-4">
            <div class="relative flex-1">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search by document type, number, or verification ID..." v-model="searchTerm"
                    class="pl-10" />
            </div>
        </div>

        <!-- Table -->
        <Card>
            <CardHeader>
                <CardTitle class="flex items-center gap-2">
                    <Calendar class="w-5 h-5" />
                    Verification History
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table v-if="filteredRecords.length > 0">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Verification ID</TableHead>
                            <TableHead>Document Type</TableHead>
                            <TableHead>Document Number</TableHead>
                            <TableHead>Verified At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Cost</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        <TableRow v-for="record in filteredRecords" :key="record.id">
                            <TableCell class="font-medium">{{ record.id }}</TableCell>
                            <TableCell>{{ record.documentType }}</TableCell>
                            <TableCell class="font-mono text-sm">{{ record.documentNumber }}</TableCell>
                            <TableCell>{{ record.verifiedAt }}</TableCell>

                            <TableCell>
                                <Badge :variant="getStatusBadge(record.status).variant"
                                    :class="getStatusBadge(record.status).class"
                                    class="inline-flex items-center gap-1 px-3 py-0.5 w-auto max-w-max">
                                    <component :is="getStatusBadge(record.status).icon" class="w-3 h-3" />
                                    {{ getStatusBadge(record.status).label }}
                                </Badge>
                            </TableCell>

                            <TableCell>{{ record.cost }}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <div v-else class="text-center py-8 text-muted-foreground">
                    No verification records found
                </div>
            </CardContent>
        </Card>

        <!-- Dialog -->
        <Dialog v-model:open="isDialogOpen">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Verification Types</DialogTitle>
                    <p class="text-sm text-muted-foreground">
                        Select Verification Types you want to verify through our DigiLocker API
                    </p>
                </DialogHeader>

                <div class="space-y-4 py-4">
                    <div v-for="type in verificationTypes" :key="type.id" class="flex items-center space-x-2">
                        <Checkbox v-model="type.checked" :id="type.id" />

                        <label :for="type.id" class="text-sm font-medium">
                            {{ type.name }}
                        </label>
                    </div>
                </div>

                <div class="flex justify-end gap-2">
                    <Button variant="outline" @click="isDialogOpen = false">Cancel</Button>
                    <Button @click="handleVerifyNow">Verify Now</Button>
                </div>
            </DialogContent>
        </Dialog>

    </div>
</template>
