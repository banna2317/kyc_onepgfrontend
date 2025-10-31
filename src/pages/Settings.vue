<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold">Settings</h1>
    </div>

    <Tabs defaultValue="business" class="w-full">
      <TabsList class="grid w-full grid-cols-5">
        <TabsTrigger value="business">Business</TabsTrigger>
        <TabsTrigger value="api">API Keys</TabsTrigger>
        <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <!-- Business Tab -->
      <TabsContent value="business" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Update your business details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label for="business-name">Business Name</Label>
                <Input id="business-name" :modelValue="businessInfo.name" @update:modelValue="businessInfo.name = $event" />
              </div>
              <div class="space-y-2">
                <Label for="business-type">Business Type</Label>
                <Input id="business-type" :modelValue="businessInfo.type" disabled />
              </div>
              <div class="space-y-2">
                <Label for="gst">GST Number</Label>
                <Input id="gst" :modelValue="businessInfo.gst" @update:modelValue="businessInfo.gst = $event" />
              </div>
              <div class="space-y-2">
                <Label for="pan">PAN Number</Label>
                <Input id="pan" :modelValue="businessInfo.pan" disabled />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="address">Registered Address</Label>
              <Input id="address" :modelValue="businessInfo.address" @update:modelValue="businessInfo.address = $event" />
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label for="contact-email">Contact Email</Label>
                <Input id="contact-email" type="email" :modelValue="businessInfo.email" @update:modelValue="businessInfo.email = $event" />
              </div>
              <div class="space-y-2">
                <Label for="contact-phone">Contact Phone</Label>
                <Input id="contact-phone" :modelValue="businessInfo.phone" @update:modelValue="businessInfo.phone = $event" />
              </div>
            </div>

            <Button @click="saveBusinessInfo">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bank Account Details</CardTitle>
            <CardDescription>
              Account for receiving settlement and refunds
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <Label>Account Holder Name</Label>
                <Input :modelValue="bankInfo.holderName" disabled />
              </div>
              <div class="space-y-2">
                <Label>Account Number</Label>
                <Input :modelValue="bankInfo.accountNumber" disabled />
              </div>
              <div class="space-y-2">
                <Label>IFSC Code</Label>
                <Input :modelValue="bankInfo.ifsc" disabled />
              </div>
              <div class="space-y-2">
                <Label>Bank Name</Label>
                <Input :modelValue="bankInfo.bankName" disabled />
              </div>
            </div>
            <div class="bg-muted p-3 rounded-lg">
              <p class="text-sm text-muted-foreground">
                To change bank details, please contact support with updated bank documents.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- API Keys Tab -->
      <TabsContent value="api" class="space-y-4">
        <Card>
          <CardHeader>
            <div class="flex justify-between items-center">
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage your API keys for integration
                </CardDescription>
              </div>
              <Dialog :open="isAddKeyDialogOpen" @update:open="setIsAddKeyDialogOpen">
                <DialogTrigger as-child>
                  <Button variant="hero">
                    <Plus class="mr-2 h-4 w-4" />
                    Create API Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New API Key</DialogTitle>
                    <DialogDescription>
                      Generate a new API key for your integration
                    </DialogDescription>
                  </DialogHeader>
                  <div class="space-y-4 py-4">
                    <div class="space-y-2">
                      <Label for="key-name">Key Name</Label>
                      <Input id="key-name" placeholder="e.g., Production Server" v-model="newKeyName" />
                    </div>
                    <div class="space-y-2">
                      <Label for="key-type">Environment</Label>
                      <select id="key-type" class="w-full p-2 border rounded" v-model="newKeyType">
                        <option value="live">Live</option>
                        <option value="test">Test</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" @click="setIsAddKeyDialogOpen(false)">
                      Cancel
                    </Button>
                    <Button @click="createApiKey">
                      Generate Key
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="key in apiKeysData" :key="key.id">
                  <TableCell class="font-medium">{{ key.name }}</TableCell>
                  <TableCell class="font-mono text-sm">
                    <div class="flex items-center gap-2">
                      {{ showApiKey ? key.id : '••••••••••••••••' }}
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-6 w-6"
                        @click="showApiKey = !showApiKey"
                      >
                        <EyeOff v-if="showApiKey" class="h-3 w-3" />
                        <Eye v-else class="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-6 w-6"
                        @click="handleCopyApiKey(key.id)"
                      >
                        <Copy class="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge :variant="key.type === 'live' ? 'default' : 'outline'">
                      {{ key.type }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-sm">{{ key.created }}</TableCell>
                  <TableCell class="text-sm text-muted-foreground">
                    {{ key.lastUsed }}
                  </TableCell>
                  <TableCell>
                    <Badge class="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {{ key.status }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div class="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        @click="handleRegenerateKey(key.name)"
                      >
                        <RefreshCw class="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm" @click="deleteApiKey(key.id)">
                        <Trash2 class="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>IP Whitelist</CardTitle>
            <CardDescription>
              Restrict API access to specific IP addresses
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label>Enable IP Whitelist</Label>
                <p class="text-sm text-muted-foreground">
                  Only allow API calls from whitelisted IPs
                </p>
              </div>
              <Switch v-model="ipWhitelistEnabled" />
            </div>
            <div class="space-y-2">
              <Label for="ip-address">Add IP Address</Label>
              <div class="flex gap-2">
                <Input id="ip-address" placeholder="e.g., 203.0.113.1" v-model="newIpAddress" />
                <Button @click="addIpAddress">Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Webhooks Tab -->
      <TabsContent value="webhooks" class="space-y-4">
        <Card>
          <CardHeader>
            <div class="flex justify-between items-center">
              <div>
                <CardTitle>Webhook Endpoints</CardTitle>
                <CardDescription>
                  Receive real-time notifications for payout events
                </CardDescription>
              </div>
              <Dialog :open="isAddWebhookOpen" @update:open="setIsAddWebhookOpen">
                <DialogTrigger as-child>
                  <Button variant="hero">
                    <Plus class="mr-2 h-4 w-4" />
                    Add Webhook
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Webhook Endpoint</DialogTitle>
                    <DialogDescription>
                      Configure a new webhook to receive event notifications
                    </DialogDescription>
                  </DialogHeader>
                  <div class="space-y-4 py-4">
                    <div class="space-y-2">
                      <Label for="webhook-url">Webhook URL</Label>
                      <Input id="webhook-url" placeholder="https://api.yoursite.com/webhooks" v-model="newWebhookUrl" />
                    </div>
                    <div class="space-y-2">
                      <Label>Events to Subscribe</Label>
                      <div class="space-y-2">
                        <div class="flex items-center space-x-2" v-for="event in webhookEvents" :key="event.id">
                          <input type="checkbox" :id="event.id" v-model="event.selected" />
                          <label :for="event.id" class="text-sm">{{ event.name }}</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" @click="setIsAddWebhookOpen(false)">
                      Cancel
                    </Button>
                    <Button @click="addWebhook">
                      Add Webhook
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="webhook in webhooksData" :key="webhook.id">
                  <TableCell class="font-mono text-sm">{{ webhook.url }}</TableCell>
                  <TableCell>
                    <div class="flex gap-1 flex-wrap">
                      <Badge v-for="event in webhook.events" :key="event" variant="outline" class="text-xs">
                        {{ event }}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge class="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {{ webhook.status }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-sm">{{ webhook.created }}</TableCell>
                  <TableCell>
                    <div class="flex gap-2">
                      <Button variant="outline" size="sm">Test</Button>
                      <Button variant="outline" size="sm" @click="deleteWebhook(webhook.id)">
                        <Trash2 class="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Team Tab -->
      <TabsContent value="team" class="space-y-4">
        <Card>
          <CardHeader>
            <div class="flex justify-between items-center">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage team access and permissions
                </CardDescription>
              </div>
              <Dialog :open="isAddMemberOpen" @update:open="setIsAddMemberOpen">
                <DialogTrigger as-child>
                  <Button
                    variant="hero"
                    @click="resetMemberForm"
                  >
                    <Plus class="mr-2 h-4 w-4" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{{ isEditingMember ? 'Edit Team Member' : 'Invite Team Member' }}</DialogTitle>
                    <DialogDescription>
                      {{ isEditingMember ? 'Update member details and role' : 'Send an invitation to join your team' }}
                    </DialogDescription>
                  </DialogHeader>
                  <div class="space-y-4 py-4">
                    <div class="space-y-2">
                      <Label for="member-email">Email Address</Label>
                      <Input
                        id="member-email"
                        type="email"
                        placeholder="email@company.com"
                        v-model="memberEmail"
                        :disabled="isEditingMember"
                      />
                    </div>
                    <div class="space-y-2">
                      <Label for="member-role">Role</Label>
                      <select
                        id="member-role"
                        class="w-full p-2 border rounded"
                        v-model="memberRole"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="operator">Operator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" @click="setIsAddMemberOpen(false)">
                      Cancel
                    </Button>
                    <Button @click="handleMemberAction">
                      {{ isEditingMember ? 'Update Member' : 'Send Invitation' }}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="member in teamMembersData" :key="member.id">
                  <TableCell class="font-medium">{{ member.name }}</TableCell>
                  <TableCell>{{ member.email }}</TableCell>
                  <TableCell>
                    <Badge :variant="member.role === 'admin' ? 'default' : 'outline'">
                      {{ member.role }}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge class="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {{ member.status }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-sm text-muted-foreground">
                    {{ member.lastLogin }}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      @click="editMember(member)"
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Security Tab -->
      <TabsContent value="security" class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label>Enable 2FA</Label>
                <p class="text-sm text-muted-foreground">
                  Require authentication code in addition to password
                </p>
              </div>
              <Switch v-model="twoFactorEnabled" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Login Notifications</CardTitle>
            <CardDescription>
              Get notified of login activity on your account
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label>Email Notifications</Label>
                <p class="text-sm text-muted-foreground">
                  Receive email alerts for new logins
                </p>
              </div>
              <Switch v-model="emailNotifications" />
            </div>
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label>Unknown Device Alerts</Label>
                <p class="text-sm text-muted-foreground">
                  Get alerted when logging in from new devices
                </p>
              </div>
              <Switch v-model="unknownDeviceAlerts" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Management</CardTitle>
            <CardDescription>
              Manage active sessions and devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline">
              View Active Sessions
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import { useToast } from "@/hooks/use-toast"

// ✅ Import UI components the correct way
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// ✅ Import icons from lucide-vue-next
import {
  Key,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Plus,
  Shield,
  Webhook,
  Users,
  Building2,
  Mail,
  Phone,
} from "lucide-vue-next"

const { toast } = useToast()

// -----------------------------
// ✅ Reactive State
// -----------------------------
const showApiKey = ref(false)
const isAddKeyDialogOpen = ref(false)
const isAddWebhookOpen = ref(false)
const isAddMemberOpen = ref(false)
const isEditingMember = ref(false)
const selectedMember = ref<any>(null)
const memberEmail = ref("")
const memberRole = ref("viewer")
const newKeyName = ref("")
const newKeyType = ref("live")
const newWebhookUrl = ref("")
const newIpAddress = ref("")
const ipWhitelistEnabled = ref(false)
const twoFactorEnabled = ref(false)
const emailNotifications = ref(true)
const unknownDeviceAlerts = ref(true)

const businessInfo = reactive({
  name: "Acme Corporation Pvt Ltd",
  type: "Private Limited",
  gst: "27AABCU9603R1ZM",
  pan: "AABCU9603R",
  address: "123 Business Park, Mumbai, Maharashtra 400001",
  email: "contact@acmecorp.com",
  phone: "+91 98765 43210",
})

const bankInfo = reactive({
  holderName: "Acme Corporation Pvt Ltd",
  accountNumber: "123456789012",
  ifsc: "HDFC0001234",
  bankName: "HDFC Bank",
})

const apiKeysData = ref([
  {
    id: "key_live_1234567890abcdef",
    name: "Production API Key",
    type: "live",
    created: "2024-01-15",
    lastUsed: "2024-10-01 10:30 AM",
    status: "active",
  },
  {
    id: "key_test_abcdef1234567890",
    name: "Development API Key",
    type: "test",
    created: "2024-01-15",
    lastUsed: "2024-09-30 03:20 PM",
    status: "active",
  },
])

const webhooksData = ref([
  {
    id: "webhook_001",
    url: "https://api.yoursite.com/webhooks/payout",
    events: ["payout.success", "payout.failed", "payout.processing"],
    status: "active",
    created: "2024-01-20",
  },
])

const teamMembersData = ref([
  {
    id: "user_001",
    name: "Amit Sharma",
    email: "amit.sharma@company.com",
    role: "admin",
    status: "active",
    lastLogin: "2024-10-01 09:15 AM",
  },
  {
    id: "user_002",
    name: "Priya Gupta",
    email: "priya.gupta@company.com",
    role: "operator",
    status: "active",
    lastLogin: "2024-10-01 08:45 AM",
  },
])

const webhookEvents = ref([
  { id: "event1", name: "payout.success", selected: true },
  { id: "event2", name: "payout.failed", selected: true },
  { id: "event3", name: "payout.processing", selected: false },
])

// -----------------------------
// ✅ Methods
// -----------------------------
const handleCopyApiKey = (key: string) => {
  navigator.clipboard.writeText(key)
  toast({
    title: "Copied!",
    description: "API key copied to clipboard",
  })
}

const handleRegenerateKey = (name: string) => {
  toast({
    title: "API Key Regenerated",
    description: `${name} has been regenerated. Update your integrations with the new key.`,
  })
}

const createApiKey = () => {
  toast({
    title: "API Key Created",
    description: "Your new API key has been generated.",
  })
  isAddKeyDialogOpen.value = false
  newKeyName.value = ""
  newKeyType.value = "live"
}

const deleteApiKey = (id: string) => {
  apiKeysData.value = apiKeysData.value.filter((key) => key.id !== id)
  toast({ title: "API Key Deleted", description: "The API key has been removed." })
}

const addWebhook = () => {
  const selectedEvents = webhookEvents.value
    .filter((event) => event.selected)
    .map((event) => event.name)

  webhooksData.value.push({
    id: `webhook_${Date.now()}`,
    url: newWebhookUrl.value,
    events: selectedEvents,
    status: "active",
    created: new Date().toISOString().split("T")[0],
  })

  toast({
    title: "Webhook Added",
    description: "Your webhook endpoint has been configured.",
  })
  isAddWebhookOpen.value = false
  newWebhookUrl.value = ""
  webhookEvents.value.forEach((event) => {
    event.selected = event.id === "event1" || event.id === "event2"
  })
}

const deleteWebhook = (id: string) => {
  webhooksData.value = webhooksData.value.filter((webhook) => webhook.id !== id)
  toast({ title: "Webhook Deleted", description: "The webhook has been removed." })
}

const addIpAddress = () => {
  if (newIpAddress.value) {
    toast({
      title: "IP Address Added",
      description: `${newIpAddress.value} has been added to whitelist.`,
    })
    newIpAddress.value = ""
  }
}

const resetMemberForm = () => {
  isEditingMember.value = false
  selectedMember.value = null
  memberEmail.value = ""
  memberRole.value = "viewer"
}

const editMember = (member: any) => {
  isEditingMember.value = true
  selectedMember.value = member
  memberEmail.value = member.email
  memberRole.value = member.role
  isAddMemberOpen.value = true
}

const handleMemberAction = () => {
  if (isEditingMember.value) {
    const member = teamMembersData.value.find((m) => m.id === selectedMember.value.id)
    if (member) {
      member.role = memberRole.value
    }
    toast({
      title: "Member Updated",
      description: `${selectedMember.value.name} has been updated.`,
    })
  } else {
    toast({ title: "Invitation Sent", description: "Team member has been invited." })
  }
  isAddMemberOpen.value = false
  resetMemberForm()
}

const saveBusinessInfo = () => {
  toast({ title: "Changes Saved", description: "Business information has been updated." })
}

const setIsAddKeyDialogOpen = (value: boolean) => {
  isAddKeyDialogOpen.value = value
}

const setIsAddWebhookOpen = (value: boolean) => {
  isAddWebhookOpen.value = value
}

const setIsAddMemberOpen = (value: boolean) => {
  isAddMemberOpen.value = value
}
</script>
