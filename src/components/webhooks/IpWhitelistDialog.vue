<script setup lang="ts">
import { ref, watch } from "vue"
import { Shield, X } from "lucide-vue-next"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Webhook {
  id: string
  url: string
  status: string
  ip_whitelist?: string[]
  created_at: string
}

const props = defineProps<{
  isOpen: boolean
  webhook: Webhook | null
  onUpdate: (webhookId: string, ipList: string[]) => Promise<void>
}>()

const emit = defineEmits<{
  (e: "update:isOpen", value: boolean): void
}>()

const ipInput = ref("")
const ipList = ref<string[]>([])
const isUpdating = ref(false)

watch(
  () => props.webhook,
  (val) => {
    ipList.value = val?.ip_whitelist ? [...val.ip_whitelist] : []
  },
  { immediate: true }
)

const addIp = () => {
  const ip = ipInput.value.trim()
  if (!ip) return
  if (!ipList.value.includes(ip)) {
    ipList.value.push(ip)
  }
  ipInput.value = ""
}

const removeIp = (index: number) => {
  ipList.value.splice(index, 1)
}

const handleClose = () => {
  emit("update:isOpen", false)
  ipInput.value = ""
  ipList.value = []
}

const handleUpdate = async () => {
  if (!props.webhook) return

  isUpdating.value = true
  try {
    await props.onUpdate(props.webhook.id, ipList.value)
    emit("update:isOpen", false)
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <Dialog :open="props.isOpen"  @update:open="emit('update:isOpen', $event)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Configure IP Whitelist</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <!-- Webhook URL -->
        <div>
          <Label>Webhook URL</Label>
          <p class="text-sm text-muted-foreground mt-1 font-mono bg-muted p-2 rounded">
            {{ props.webhook?.url }}
          </p>
        </div>

        <!-- Add IP -->
        <div>
          <Label>Add IP Address</Label>

          <div class="flex gap-2 mt-2">
            <Input
              v-model="ipInput"
              placeholder="223.181.71.181 or 10.0.0.0/24"
              @keyup.enter="addIp"
            />

            <Button @click="addIp">Add</Button>
          </div>
        </div>

        <!-- IP List -->
        <div v-if="ipList.length">
          <Label class="mb-2 block">Whitelisted IPs</Label>

          <div class="space-y-2">
            <div
              v-for="(ip, index) in ipList"
              :key="ip"
              class="flex items-center justify-between bg-muted p-2 rounded font-mono text-sm"
            >
              <span>{{ ip }}</span>

              <Button
                size="icon"
                variant="ghost"
                @click="removeIp(index)"
              >
                <X class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Security Note -->
        <div class="bg-muted/30 p-4 rounded-lg">
          <div class="flex items-start space-x-2">
            <Shield class="h-4 w-4 text-muted-foreground mt-0.5" />
            <div class="text-sm text-muted-foreground">
              <p class="font-medium">Security Note</p>
              <p>
                Only requests from whitelisted IPs will be accepted.
              </p>
              <ul class="list-disc list-inside mt-2 space-y-1">
                <li>IPv4: 192.168.1.1</li>
                <li>IPv6: 2001:db8::1</li>
                <li>CIDR: 10.0.0.0/24</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-2 pt-4">
          <Button variant="outline" @click="handleClose">Cancel</Button>

          <Button :disabled="isUpdating" @click="handleUpdate">
            {{ isUpdating ? "Updating..." : "Update Whitelist" }}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
