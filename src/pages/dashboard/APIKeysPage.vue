<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"
import { useToast } from "@/hooks/use-toast"
import axios from "@/axios";
// UI Components (Shadcn Vue)
import { PinInput, PinInputGroup, PinInputSeparator, PinInputSlot } from '@/components/ui/pin-input';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
  Plus, Copy, Trash2, Eye, EyeOff, Loader2
} from "lucide-vue-next"

interface APIKey {
  id: string
  name: string
  key_value: string
  environment: "sandbox" | "production"
  permissions: string[]
  ip_whitelist: string[]
  description?: string
  status: "active" | "inactive"
  last_used_at?: string
  created_at: string
  updated_at: string
}

const { toast } = useToast()

const activeTab = ref("keys")
const showSecrets = ref<Record<string, boolean>>({})
const dialogOpen = ref(false)
const keys = ref<APIKey[]>([])
const loading = ref(true)
const creating = ref(false)

// Form Data
const formData = reactive({
  name: "",
  environment: "sandbox" as "sandbox" | "production",
  permissions: ["read", "write"],
  ipWhitelist: "",
  description: ""
})

// Generate API Key
const generateAPIKey = (env: string) => {
  const prefix = env === "production" ? "ok_live_" : "ok_test_"
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return prefix + result
}

// Fetch API Keys (NO SUPABASE)
const fetchAPIKeys = async () => {
  try {
    // Replace with your backend API call using axios
    // Example:
    // const res = await axios.get("/api/api-keys")
    // keys.value = res.data

    keys.value = [] // placeholder empty array
  } catch (e) {
    toast({
      title: "Error",
      description: "Failed to fetch API keys",
      variant: "destructive"
    })
  } finally {
    loading.value = false
  }
}

onMounted(fetchAPIKeys)

// Create API Key (NO SUPABASE)
const createAPIKey = async () => {
  if (!formData.name.trim()) {
    toast({
      title: "Error",
      description: "Please enter key name",
      variant: "destructive"
    })
    return
  }

  creating.value = true

  try {
    const keyValue = generateAPIKey(formData.environment)

    const ipList = formData.ipWhitelist
      ? formData.ipWhitelist.split("\n").map(a => a.trim()).filter(Boolean)
      : []

    const fakeRecord: APIKey = {
      id: Math.random().toString(36).substring(2),
      name: formData.name.trim(),
      key_value: keyValue,
      environment: formData.environment,
      permissions: [...formData.permissions],
      ip_whitelist: ipList,
      description: formData.description || "",
      status: "active",
      last_used_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Replace with:
    // const res = await axios.post("/api/api-keys", fakeRecord)
    // keys.value.unshift(res.data)

    keys.value.unshift(fakeRecord)

    Object.assign(formData, {
      name: "",
      environment: "sandbox",
      permissions: ["read", "write"],
      ipWhitelist: "",
      description: ""
    })

    dialogOpen.value = false

    toast({
      title: "Success",
      description: "API key created"
    })
  } catch (e) {
    toast({
      title: "Error",
      description: "Create failed",
      variant: "destructive"
    })
  } finally {
    creating.value = false
  }
}

// Delete Key (NO SUPABASE)


const toggleSecret = (id: string) => {
  showSecrets.value[id] = !showSecrets.value[id]
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  toast({
    title: "Copied",
    description: "API key copied"
  })
}

const maskKey = (v: string) =>
  `${v.slice(0, 7)}${"•".repeat(20)}${v.slice(-4)}`


// 

const isDialogOpen = ref(false);
const handleComplete = (e: string[]) => e.join("")
const otp = ref<string[]>([]);
const isOtpSubmitting = ref(false);
const isCredentialDialogOpen = ref(false);
const phoneNumber = ref("");
const apiKey = ref("");
const allRecords = ref([]);
const apiSecret = ref("");

const showApiKey = ref(false);
const showApiSecret = ref(false);

// Mask function
// const maskKey = (value) => {
//   if (!value) return "";
//   return value.substring(0, 6) + "••••••••" + value.slice(-4);
// };


async function handleSubmitOtp() {

  const otpe = otp.value.join("");

  try {

    const response = await axios.post("/submit-otp-api-key", { otp: otpe });
    console.log(response.data);

    if (response.data.status === true) {
      apiKey.value = response.data.data.api_key;
      apiSecret.value = response.data.data.api_secret;
      isDialogOpen.value = false;
      isCredentialDialogOpen.value = true;
    }


  } catch (err) {

  }


}

async function send_otp() {

  try {

    const response = await axios.post("/send-otp-api-key");

    console.log(response.data.data);

    if (response.data.status === true) {
      phoneNumber.value = response.data.data;
      toast({
        title: "OTP Sent",
        description: "An OTP has been sent to your registered email."
      });

      isDialogOpen.value = true;

    } else {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    }



  } catch (err) {

  }



}

const downloadCredentials = () => {
  const content = `
API CREDENTIALS

API KEY:
${apiKey.value}

API SECRET:
${apiSecret.value}


`;

  const blob = new Blob([content], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "api-credentials.txt";
  link.click();

  window.URL.revokeObjectURL(url);
};
async function getrecords() {
  try {

    const response = await axios.post("/credentials-api-key");
    allRecords.value = response.data.data;
    console.log(allRecords.value);



  } catch (err) {
    toast({
      title: "Error",
      description: "Failed to fetch verification records.",
      variant: "destructive",
    });
  }
}

const deleteAPIKey = async (id) => {

  try {

    const response = await axios.post("/credentials-api-key-deleted", { id: id });

    if (response.data.status === true) {
      toast({
        title: "Success",
        description: "API key deleted"
      })
      getrecords();
    }


  } catch (e) {
    toast({
      title: "Error",
      description: "Delete failed",
      variant: "destructive"
    })
  }
}

onMounted(() => {
  getrecords();
});

</script>

<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">API Keys</h1>
        <p class="text-muted-foreground mt-2">
          Manage your API keys for accessing OnePG SecureID services
        </p>
      </div>

      <Button @click="send_otp">
        <Plus class="mr-2 h-4 w-4" /> Create API Key
      </Button>

      <Dialog v-model:open="isDialogOpen">
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter OTP</DialogTitle>
            <p class="text-sm text-muted-foreground">
              An OTP has been sent to your registered email: {{ phoneNumber }}. Please enter it below to proceed.
            </p>
          </DialogHeader>

          <div class="space-y-4">
            <div>

              <div class="flex justify-center mt-4">
                <PinInput id="pin-input" v-model="otp" placeholder="○" @complete="handleComplete">
                  <PinInputGroup>
                    <PinInputSlot v-for="(id, index) in 4" :key="id" :index="index"
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

      <Dialog v-model:open="isCredentialDialogOpen">
        <DialogContent class="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>API Credentials</DialogTitle>
            <p class="text-sm text-muted-foreground">
              Please save your API credentials securely. This secret will be shown only once.
            </p>
          </DialogHeader>

          <div class="space-y-4 mt-4">

            <!-- API KEY -->
            <div class="flex justify-between items-center py-2 border-b">
              <span class="text-muted-foreground">API Key</span>

              <div class="flex items-center space-x-2 max-w-[70%]">
                <code class="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
            {{ showApiKey ? apiKey : maskKey(apiKey) }}
          </code>

                <Button variant="ghost" size="sm" @click="showApiKey = !showApiKey">
                  <EyeOff v-if="showApiKey" class="h-4 w-4" />
                  <Eye v-else class="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="sm" @click="copyToClipboard(apiKey)">
                  <Copy class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div class="flex justify-between items-center py-2 border-b">
              <span class="text-muted-foreground">API Secret</span>

              <div class="flex items-center space-x-2 max-w-[70%]">
                <code class="text-xs font-mono bg-muted px-2 py-1 rounded break-all">
            {{ showApiSecret ? apiSecret : maskKey(apiSecret) }}
          </code>

                <Button variant="ghost" size="sm" @click="showApiSecret = !showApiSecret">
                  <EyeOff v-if="showApiSecret" class="h-4 w-4" />
                  <Eye v-else class="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="sm" @click="copyToClipboard(apiSecret)">
                  <Copy class="h-4 w-4" />
                </Button>
              </div>
            </div>


            <!-- <div class="flex justify-between items-center py-2 border-b">
              <span class="text-muted-foreground">API Key</span>
              <span class="font-mono text-sm break-all text-right">
                {{ apiKey }}
              </span>
            </div>

        
            <div class="flex justify-between items-center py-2 border-b">
              <span class="text-muted-foreground">API Secret</span>
              <span class="font-mono text-sm break-all text-right">
                {{ apiSecret }}
              </span>
            </div> -->

            <!-- ENV -->
            <!-- <div class="flex justify-between items-center py-2">
              <span class="text-muted-foreground">Environment</span>
              <span class="font-semibold">
                {{ apiCredentials.environment }}
              </span>
            </div> -->

            <!-- ACTIONS -->
            <div class="flex justify-end gap-3 pt-4">
              <Button variant="outline" @click="isCredentialDialogOpen = false">
                Close
              </Button>

              <Button class="bg-purple-600 hover:bg-purple-700" @click="downloadCredentials">
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


    </div>

    <!-- Tabs -->
    <Tabs v-model="activeTab" class="space-y-6">
      <!-- <TabsList>
        <TabsTrigger value="keys">API Keys</TabsTrigger>
      </TabsList> -->

      <TabsContent value="keys">
        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <p class="text-sm text-muted-foreground">
              Manage your API keys for different environments
            </p>
          </CardHeader>

          <CardContent>
            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-8">
              <Loader2 class="h-8 w-8 animate-spin" />
            </div>

            <!-- Empty -->
            <div v-else-if="allRecords.length === 0" class="text-center py-8 text-muted-foreground">
              No API keys found. Create your first API key to get started. </div>

            <!-- Table -->
            <Table v-else>
              <TableHeader>
                <TableRow>
                  <TableHead>Verified At</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Env</TableHead>

                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                <TableRow v-for="key in allRecords" :key="key.id">

                  <!-- Name -->
                  <TableCell>
                    <!-- <p class="font-medium">{{ key.name }}</p> -->
                    <p class="text-sm text-muted-foreground">
                      {{ new Date(key.created_at).toLocaleDateString() }}
                    </p>
                  </TableCell>

                  <!-- Key -->
                  <TableCell>
                    <p class="text-sm text-muted-foreground">
                      {{ key.api_key }}
                    </p>

                  </TableCell>

                  <!-- Environment -->
                  <TableCell>
                    <Badge v-if="key.environment === 'production'" variant="destructive">
                      Production
                    </Badge>
                    <Badge v-else class="bg-primary/10 text-primary border-primary/20">
                      Sandbox
                    </Badge>
                  </TableCell>





                  <!-- Status -->
                  <TableCell>
                    <Badge :variant="key.is_active ? 'secondary' : 'outline'" :class="key.is_active
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-red-100 text-red-700 border-red-200'">
                      {{ key.is_active ? 'Active' : 'Inactive' }}
                    </Badge>
                  </TableCell>

                  <!-- Actions -->
                  <TableCell>
                    <div class="flex items-center space-x-2">

                      <!-- Delete -->
                      <AlertDialog>
                        <AlertDialogTrigger as-child>
                          <Button variant="ghost" size="sm">
                            <Trash2 class="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure? This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction @click="deleteAPIKey(key.id)">
                              Delete Key
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                    </div>
                  </TableCell>

                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
