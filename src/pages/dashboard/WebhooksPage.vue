<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from '@/hooks/use-toast'
import axios from '@/axios'

// shadcn ui
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-vue-next'

// components
import CreateWebhookDialog from '../../components/webhooks/CreateWebhookDialog.vue'

const { toast } = useToast()

const ip_whitelist = ref<any[]>([])
const loading = ref(true)
const dialogOpen = ref(false)

// delete dialog states
const deleteDialogOpen = ref(false)
const deletingId = ref<number | null>(null)

// ================= FETCH =================
const fetchIPAddress = async () => {
  loading.value = true
  try {
    const response = await axios.post('/list_IPAddress')
    ip_whitelist.value = response.data.data
  } catch {
    toast({
      title: 'Error',
      description: 'Failed to load IP addresses',
      variant: 'destructive'
    })
  } finally {
    loading.value = false
  }
}

// ================= DELETE =================
const openDeleteDialog = (id: number) => {
  deletingId.value = id
  deleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!deletingId.value) return

  try {
    await axios.post('/delete_IPAddress', {
      id: deletingId.value
    })

    ip_whitelist.value = ip_whitelist.value.filter(
      ip => ip.id !== deletingId.value
    )

    toast({
      title: 'IP Removed',
      description: 'IP address has been removed successfully'
    })
  } catch {
    toast({
      title: 'Error',
      description: 'Failed to remove IP',
      variant: 'destructive'
    })
  } finally {
    deleteDialogOpen.value = false
    deletingId.value = null
  }
}

onMounted(fetchIPAddress)
</script>

<template>
  <div class="space-y-6">
    <!-- HEADER -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight">
          IP Address
        </h1>
        <p class="text-muted-foreground">
          Manage your IP Whitelists and security settings
        </p>
      </div>

      <!-- ADD IP -->
      <CreateWebhookDialog
        v-model:open="dialogOpen"
        @saved="fetchIPAddress"
      />
    </div>

    <!-- MAIN CARD -->
    <Card>
      <CardContent class="pt-6">
        <!-- Loader -->
        <div v-if="loading" class="flex items-center justify-center h-56">
          <Loader2 class="h-7 w-7 animate-spin text-muted-foreground" />
        </div>

        <!-- Empty -->
        <div
          v-else-if="ip_whitelist.length === 0"
          class="flex flex-col items-center justify-center rounded-xl border border-dashed py-14 text-center"
        >
          <p class="text-sm text-muted-foreground">
            No IP addresses added yet
          </p>
        </div>

        <!-- IP LIST -->
        <div v-else class="rounded-2xl border bg-background">
          <!-- Header -->
          <div class="border-b px-6 py-4 text-sm font-medium">
            Whitelisted IP Addresses
            <span class="ml-1 text-muted-foreground">
              ({{ ip_whitelist.length }})
            </span>
          </div>

          <!-- Items -->
          <div class="divide-y">
            <div
              v-for="ip in ip_whitelist"
              :key="ip.id"
              class="group flex items-center justify-between px-6 py-4 transition hover:bg-muted/40"
            >
              <div class="flex items-center gap-3">
                <span class="h-2 w-2 rounded-full bg-emerald-500" />
                <span
                  class="rounded-lg bg-muted px-3 py-1 font-mono text-sm"
                >
                  {{ ip.ip_whitelist }}
                </span>
              </div>

              <button
                @click="openDeleteDialog(ip.id)"
                class="text-sm text-muted-foreground opacity-0 transition hover:text-red-500 group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- DELETE CONFIRMATION DIALOG -->
    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove IP Address</DialogTitle>
        </DialogHeader>

        <p class="text-sm text-muted-foreground">
          Are you sure you want to remove this IP address?
          This action cannot be undone.
        </p>

        <DialogFooter class="mt-4">
          <Button
            variant="ghost"
            @click="deleteDialogOpen = false"
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            @click="confirmDelete"
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
