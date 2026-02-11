<script setup lang="ts">
import { Shield, Settings, Trash2 } from "lucide-vue-next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog"

interface Webhook {
  id: string
  url: string
  status: string
  ip_whitelist?: string[]
  created_at: string
}

const props = defineProps<{
  webhook: Webhook
  onDelete: (id: string) => void
  onToggleStatus: (id: string, currentStatus: string) => void
  onConfigureIp: (webhook: Webhook) => void
}>()
</script>

<template>
  <div
    class="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-muted/30 transition-colors"
  >
    <div class="flex-1 min-w-0">
      <p class="font-medium truncate" :title="props.webhook.url">
        {{ props.webhook.url }}
      </p>

      <!-- <p class="text-sm text-muted-foreground font-mono">
        {{ props.webhook.id }}
      </p> -->

      <!-- Whitelisted IP badge -->
      <div
        v-if="props.webhook.ip_whitelist && props.webhook.ip_whitelist.length > 0"
        class="mt-2 flex items-center gap-2"
      >
        <Badge variant="outline" class="text-xs">
          <Shield class="mr-1 h-3 w-3" />
          {{ props.webhook.ip_whitelist.length }}
          IP{{ props.webhook.ip_whitelist.length !== 1 ? "s" : "" }} whitelisted
        </Badge>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center space-x-2 ml-4">
      <Badge
        :variant="props.webhook.status === 'active' ? 'default' : 'secondary'"
        :class="
          props.webhook.status === 'active'
            ? 'bg-success/10 text-success border-success/20'
            : ''
        "
      >
        {{ props.webhook.status }}
      </Badge>

      <!-- Configure IP -->
      <Button
        variant="ghost"
        size="sm"
        @click="props.onConfigureIp(props.webhook)"
        title="Configure IP Whitelist"
      >
        <Shield class="h-4 w-4" />
      </Button>

      <!-- Toggle Status -->
      <Button
        variant="ghost"
        size="sm"
        @click="props.onToggleStatus(props.webhook.id, props.webhook.status)"
        :title="props.webhook.status === 'active' ? 'Deactivate webhook' : 'Activate webhook'"
      >
        <Settings class="h-4 w-4" />
      </Button>

      <!-- Delete Webhook -->
      <AlertDialog>
        <AlertDialogTrigger as-child>
          <Button
            variant="ghost"
            size="sm"
            class="text-destructive hover:text-destructive"
            title="Delete webhook"
          >
            <Trash2 class="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this webhook?  
              This action cannot be undone and will stop all webhook notifications.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction @click="props.onDelete(props.webhook.id)">
              Delete Webhook
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
</template>
