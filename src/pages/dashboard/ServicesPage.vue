<script setup lang="ts">
import { ref, computed, type Component } from "vue"
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
  Search,
  Grid3X3,
  CreditCard,
  User,
  FileText,
  Camera,
  Building2,
  Play,
  Code,
  Clock,
  Zap,
  X,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-vue-next"

import { useToast } from "@/hooks/use-toast"

// =============================
// Interfaces
// =============================
interface Service {
  id: string
  name: string
  category: "Identity" | "Financial" | "Biometric" | "Documents" | "Business"
  description: string
  icon: Component
  price: string
  latency: string
  accuracy: string
}

interface FormData {
  accountNumber: string
  ifsc: string
  accountHolderName: string
  phoneNumber: string
  countryCode: string
}

// =============================
// Services List
// =============================
const services: Service[] = [
  // Identity Services
  {
    id: "aadhaar-okyc",
    name: "Aadhaar OKYC",
    category: "Identity",
    description: "OTP-based Aadhaar verification",
    icon: User,
    price: "₹3.50",
    latency: "2-3s",
    accuracy: "99.8%",
  },
  {
    id: "aadhaar-masking",
    name: "Aadhaar Masking",
    category: "Identity",
    description: "Secure Aadhaar number masking",
    icon: User,
    price: "₹1.00",
    latency: "<1s",
    accuracy: "100%",
  },
  {
    id: "pan-360",
    name: "PAN 360",
    category: "Identity",
    description: "Enhanced PAN verification with profile data",
    icon: FileText,
    price: "₹5.00",
    latency: "3-4s",
    accuracy: "99.5%",
  },
  {
    id: "pan-lite",
    name: "PAN Lite",
    category: "Identity",
    description: "Basic PAN validation",
    icon: FileText,
    price: "₹2.00",
    latency: "1-2s",
    accuracy: "99.2%",
  },

  // Financial Services
  {
    id: "bank-verification",
    name: "Bank Account Verification",
    category: "Financial",
    description: "Verify bank account details",
    icon: CreditCard,
    price: "₹4.00",
    latency: "5-8s",
    accuracy: "98.5%",
  },
  {
    id: "reverse-penny",
    name: "Reverse Penny Drop",
    category: "Financial",
    description: "Account verification via small transaction",
    icon: CreditCard,
    price: "₹6.00",
    latency: "10-15s",
    accuracy: "99.0%",
  },
  {
    id: "ifsc-lookup",
    name: "IFSC Lookup",
    category: "Financial",
    description: "Get bank branch details from IFSC",
    icon: Building2,
    price: "₹0.50",
    latency: "<1s",
    accuracy: "100%",
  },
  {
    id: "upi-vpa",
    name: "UPI VPA Match",
    category: "Financial",
    description: "Verify UPI ID and get holder name",
    icon: CreditCard,
    price: "₹3.00",
    latency: "2-3s",
    accuracy: "97.8%",
  },

  // Biometric Services
  {
    id: "face-match",
    name: "Face Match",
    category: "Biometric",
    description: "Compare faces between two images",
    icon: Camera,
    price: "₹2.50",
    latency: "1-2s",
    accuracy: "99.1%",
  },
  {
    id: "face-liveness",
    name: "Face Liveness",
    category: "Biometric",
    description: "Detect live vs spoofed faces",
    icon: Camera,
    price: "₹3.00",
    latency: "2-3s",
    accuracy: "98.8%",
  },

  // Document Services
  {
    id: "dl-verification",
    name: "Driving License",
    category: "Documents",
    description: "Verify driving license details",
    icon: FileText,
    price: "₹4.50",
    latency: "3-5s",
    accuracy: "98.2%",
  },
  {
    id: "voter-id",
    name: "Voter ID",
    category: "Documents",
    description: "Verify voter ID card",
    icon: FileText,
    price: "₹4.00",
    latency: "3-4s",
    accuracy: "97.9%",
  },
  {
    id: "passport",
    name: "Passport Verification",
    category: "Documents",
    description: "Verify passport details",
    icon: FileText,
    price: "₹5.50",
    latency: "4-6s",
    accuracy: "98.5%",
  },

  // Business Services
  {
    id: "gstin",
    name: "GSTIN Verification",
    category: "Business",
    description: "Verify GST registration details",
    icon: Building2,
    price: "₹3.50",
    latency: "2-4s",
    accuracy: "99.2%",
  },
  {
    id: "cin-lookup",
    name: "CIN Lookup",
    category: "Business",
    description: "Corporate Identity Number verification",
    icon: Building2,
    price: "₹4.00",
    latency: "3-5s",
    accuracy: "99.0%",
  },
  {
    id: "employment-360",
    name: "Employment 360",
    category: "Business",
    description: "Recent employment verification",
    icon: Building2,
    price: "₹8.00",
    latency: "24-48h",
    accuracy: "95.5%",
  },
]

const searchTerm = ref("")
const selectedCategory = ref("all")
const isDialogOpen = ref(false)
const selectedService = ref<string | null>(null)

const formData = ref<FormData>({
  accountNumber: "",
  ifsc: "",
  accountHolderName: "",
  phoneNumber: "",
  countryCode: "+91",
})

const isVerifying = ref(false)
const verificationResult = ref<any>(null)

const { toast } = useToast()

const categories = ["all", "Identity", "Financial", "Biometric", "Documents", "Business"]

const filteredServices = computed(() => {
  return services.filter((service) => {
    const search = searchTerm.value.toLowerCase()
    const matchesSearch =
      service.name.toLowerCase().includes(search) ||
      service.description.toLowerCase().includes(search)

    const matchesCategory =
      selectedCategory.value === "all" ||
      service.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})


const getCategoryColor = (category: string) => {
  switch (category) {
    case "Identity":
      return "bg-primary/10 text-primary border-primary/20"
    case "Financial":
      return "bg-accent/10 text-accent border-accent/20"
    case "Biometric":
      return "bg-warning/10 text-warning border-warning/20"
    case "Documents":
      return "bg-success/10 text-success border-success/20"
    case "Business":
      return "bg-destructive/10 text-destructive border-destructive/20"
    default:
      return "bg-secondary/10 text-secondary-foreground border-secondary/20"
  }
}


const handleVerify = async () => {
  isVerifying.value = true
  verificationResult.value = null

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // MOCK RESPONSE
  const mock = {
    success: true,
    accountHolderName: "Rahul Sharma",
    bankName: "HDFC Bank",
    branchName: "Mumbai",
    nameMatch: true,
    cost: 4.0,
  }

  verificationResult.value = mock

  toast({
    title: "Verification Successful",
    description: `Account verified successfully. Cost: ₹${mock.cost}`,
  })

  isVerifying.value = false
}

const resetForm = () => {
  formData.value = {
    accountNumber: "",
    ifsc: "",
    accountHolderName: "",
    phoneNumber: "",
    countryCode: "+91",
  }
  verificationResult.value = null
  isDialogOpen.value = false
}
</script>


<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Services Catalog</h1>
        <p class="text-muted-foreground mt-2">
          Complete verification services for identity, financial, and business checks
        </p>
      </div>
      <Button @click="isDialogOpen = true">
        <Zap class="mr-2 h-4 w-4" />
        Try Now
      </Button>
    </div>

    <!-- Filters -->
    <Card class="glass-card">
      <CardContent class="pt-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="relative flex-1">
            <Search
              class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              placeholder="Search services..."
              v-model="searchTerm"
              class="pl-10"
            />
          </div>

          <Select v-model="selectedCategory">
            <SelectTrigger class="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ category === "all" ? "All Categories" : category }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Services Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        v-for="service in filteredServices"
        :key="service.id"
        class="group hover:shadow-xl transition-all duration-300 border-border/50 bg-card/95 backdrop-blur-sm"
      >
        <CardHeader class="pb-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div
                class="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20"
              >
                <component :is="service.icon" class="h-5 w-5" />
              </div>
              <div class="space-y-2">
                <CardTitle class="text-lg font-semibold group-hover:text-primary transition-colors">
                  {{ service.name }}
                </CardTitle>
                <Badge
                  :class="`${getCategoryColor(service.category)} text-xs font-medium`"
                  variant="outline"
                >
                  {{ service.category }}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent class="space-y-4">
          <p class="text-sm text-muted-foreground leading-relaxed">
            {{ service.description }}
          </p>

          <div class="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border">
            <div class="text-center">
              <div class="flex items-center justify-center mb-1">
                <CreditCard class="h-3 w-3 text-muted-foreground mr-1" />
                <span class="text-xs text-muted-foreground">Price</span>
              </div>
              <span class="text-sm font-semibold text-foreground">
                {{ service.price }}
              </span>
            </div>
            <div class="text-center">
              <div class="flex items-center justify-center mb-1">
                <Clock class="h-3 w-3 text-muted-foreground mr-1" />
                <span class="text-xs text-muted-foreground">Speed</span>
              </div>
              <span class="text-sm font-medium text-foreground">
                {{ service.latency }}
              </span>
            </div>
            <div class="text-center">
              <div class="flex items-center justify-center mb-1">
                <Zap class="h-3 w-3 text-muted-foreground mr-1" />
                <span class="text-xs text-muted-foreground">Accuracy</span>
              </div>
              <span class="text-sm font-medium text-green-600 dark:text-green-400">
                {{ service.accuracy }}
              </span>
            </div>
          </div>

          <Button
            class="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200"
            variant="outline"
            @click="isDialogOpen = true"
          >
            <Play class="mr-2 h-4 w-4" />
            Try Service
          </Button>
        </CardContent>
      </Card>
    </div>

    <!-- No Services -->
    <Card
      v-if="filteredServices.length === 0"
      class="glass-card"
    >
      <CardContent class="flex flex-col items-center justify-center py-12">
        <Search class="h-12 w-12 text-muted-foreground mb-4" />
        <h3 class="text-lg font-semibold mb-2">No services found</h3>
        <p class="text-muted-foreground text-center">
          Try adjusting your search or filter criteria
        </p>
      </CardContent>
    </Card>

    <!-- Bank Verification Dialog -->
    <Dialog v-model:open="isDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Bank Account</DialogTitle>
        </DialogHeader>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Account Number"
                v-model="formData.accountNumber"
              />
            </div>
            <div class="space-y-2">
              <Label for="ifsc">IFSC</Label>
              <Input
                id="ifsc"
                placeholder="IFSC"
                v-model="formData.ifsc"
              />
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <Label for="accountHolderName">Account Holder Name</Label>
              <span class="text-sm text-muted-foreground">Optional</span>
            </div>
            <Input
              id="accountHolderName"
              placeholder="Account Holder Name"
              v-model="formData.accountHolderName"
            />
          </div>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <Label for="phoneNumber">Phone Number</Label>
              <span class="text-sm text-muted-foreground">Optional</span>
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
                  <SelectItem value="+86">🇨🇳 +86</SelectItem>
                  <SelectItem value="+81">🇯🇵 +81</SelectItem>
                  <SelectItem value="+82">🇰🇷 +82</SelectItem>
                  <SelectItem value="+49">🇩🇪 +49</SelectItem>
                  <SelectItem value="+33">🇫🇷 +33</SelectItem>
                </SelectContent>
              </Select>
              <Input
                id="phoneNumber"
                placeholder="Phone Number"
                v-model="formData.phoneNumber"
                class="rounded-l-none"
              />
            </div>
          </div>

          <div
            v-if="!verificationResult"
            class="bg-orange-50 border border-orange-200 rounded-md p-3"
          >
            <p class="text-sm text-orange-600">
              ₹ 4.00 will be deducted from your available balance
            </p>
          </div>

          <div
            v-if="verificationResult"
            class="space-y-4 p-4 bg-muted/30 rounded-lg border"
          >
            <div class="flex items-center gap-2">
              <CheckCircle
                v-if="verificationResult.success"
                class="h-5 w-5 text-green-600"
              />
              <XCircle
                v-else
                class="h-5 w-5 text-red-600"
              />
              <span class="font-semibold">
                {{ verificationResult.success ? "Verification Successful" : "Verification Failed" }}
              </span>
            </div>

            <div
              v-if="verificationResult.success"
              class="space-y-2 text-sm"
            >
              <div class="flex justify-between">
                <span class="text-muted-foreground">Account Holder:</span>
                <span class="font-medium">
                  {{ verificationResult.accountHolderName }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Bank:</span>
                <span class="font-medium">
                  {{ verificationResult.bankName }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Branch:</span>
                <span class="font-medium">
                  {{ verificationResult.branchName }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Name Match:</span>
                <span
                  :class="[
                    'font-medium',
                    verificationResult.nameMatch ? 'text-green-600' : 'text-orange-600',
                  ]"
                >
                  {{
                    verificationResult.nameMatch === null
                      ? "N/A"
                      : verificationResult.nameMatch
                        ? "Yes"
                        : "No"
                  }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Cost:</span>
                <span class="font-medium">
                  ₹{{ verificationResult.cost }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              @click="resetForm"
              :disabled="isVerifying"
            >
              {{ verificationResult ? "Close" : "Cancel" }}
            </Button>

            <Button
              v-if="!verificationResult"
              @click="handleVerify"
              :disabled="!formData.accountNumber || !formData.ifsc || isVerifying"
            >
              <Loader2
                v-if="isVerifying"
                class="mr-2 h-4 w-4 animate-spin"
              />
              {{ isVerifying ? "Verifying..." : "Verify" }}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
