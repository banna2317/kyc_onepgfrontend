<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Plus } from 'lucide-vue-next'
import axios from '@/axios'
import { useToast } from "@/hooks/use-toast";
const open = defineModel<boolean>('open')
const { toast } = useToast();

const ipAddress = ref('')
const loading = ref(false)
const emit = defineEmits<{
  (e: 'saved'): void
}>()

const handleAddIp = async () => {
  if (!ipAddress.value.trim()) {
    toast({
      title: 'Invalid IP',
      description: 'Please enter a valid IP address',
      variant: 'destructive'
    })
    return
  }

  loading.value = true
  try {
    await axios.post('/add_IPAddress', {
      ip_address: ipAddress.value
    })

    toast({
      title: 'IP Added',
      description: 'IP address successfully whitelisted'
    })

    ipAddress.value = ''
    open.value = false

    // ✅ parent ko notify
    emit('saved')
  } catch (error: any) {
    toast({
      title: 'Failed to add IP',
      description:
        error?.response?.data?.message || 'Something went wrong',
      variant: 'destructive'
    })
  } finally {
    loading.value = false
  }
}

</script>

<template>
  <Dialog v-model:open="open">
    <!-- Trigger -->
    <DialogTrigger as-child>
      <Button class="gap-2">
        <Plus class="h-4 w-4" />
        Add New IP Address
      </Button>
    </DialogTrigger>

    <!-- Dialog -->
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add IP Address</DialogTitle>
      </DialogHeader>

      <!-- Body -->
      <div class="space-y-4">
        <div class="space-y-1">
          <Label>IP Address</Label>
          <Input placeholder="e.g. 192.168.1.1" v-model="ipAddress" @keyup.enter="handleAddIp" />
          <p class="text-xs text-muted-foreground">
            Only requests from this IP will be allowed.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <DialogFooter class="mt-4">
        <Button variant="ghost" @click="open = false">
          Cancel
        </Button>

        <Button :disabled="!ipAddress.trim() || loading" @click="handleAddIp">
          <span v-if="!loading">Add IP</span>
          <span v-else class="flex items-center gap-2">
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Saving…
          </span>
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
