<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Mail, Shield } from 'lucide-vue-next'
import { useToast } from '@/hooks/use-toast'

interface Props {
  onInvite: (email: string, role: string) => Promise<void>
  isLoading?: boolean
}

const props = defineProps<Props>()
const open = ref(false)
const email = ref('')
const role = ref('Developer')
const { toast } = useToast()

const handleSubmit = async () => {
  if (!email.value.trim()) {
    toast({
      title: 'Error',
      description: 'Please enter an email address',
      variant: 'destructive',
    })
    return
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value.trim())) {
    toast({
      title: 'Error',
      description: 'Please enter a valid email address',
      variant: 'destructive',
    })
    return
  }

  try {
    await props.onInvite(email.value.trim(), role.value)
    email.value = ''
    role.value = 'Developer'
    open.value = false
  } catch (error) {
    console.error('Error inviting member:', error)
  }
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogTrigger asChild>
      <Button>
        <UserPlus class="mr-2 h-4 w-4" />
        Invite Member
      </Button>
    </DialogTrigger>

    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Mail class="h-5 w-5" />
          Invite Team Member
        </DialogTitle>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Email Input -->
        <div class="space-y-2">
          <Label for="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="colleague@company.com"
            v-model="email"
            :disabled="props.isLoading"
          />
          <p class="text-xs text-muted-foreground">
            An invitation email will be sent to this address
          </p>
        </div>

        <!-- Role Select -->
        <div class="space-y-2">
          <Label for="role">Role</Label>
          <Select v-model="role" :disabled="props.isLoading">
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Owner">
                <div class="flex items-center gap-2">
                  <Shield class="h-4 w-4 text-warning" />
                  <div>
                    <p class="font-medium">Owner</p>
                    <p class="text-xs text-muted-foreground">Full system access</p>
                  </div>
                </div>
              </SelectItem>

              <SelectItem value="Admin">
                <div class="flex items-center gap-2">
                  <Shield class="h-4 w-4 text-primary" />
                  <div>
                    <p class="font-medium">Admin</p>
                    <p class="text-xs text-muted-foreground">Manage users and settings</p>
                  </div>
                </div>
              </SelectItem>

              <SelectItem value="Developer">
                <div class="flex items-center gap-2">
                  <Shield class="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p class="font-medium">Developer</p>
                    <p class="text-xs text-muted-foreground">API access and development</p>
                  </div>
                </div>
              </SelectItem>

              <SelectItem value="Reviewer">
                <div class="flex items-center gap-2">
                  <Shield class="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p class="font-medium">Reviewer</p>
                    <p class="text-xs text-muted-foreground">View and review cases</p>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 pt-4">
          <Button type="button" variant="outline" class="flex-1" @click="open = false" :disabled="props.isLoading">
            Cancel
          </Button>
          <Button type="submit" class="flex-1" :disabled="props.isLoading">
            {{ props.isLoading ? 'Sending...' : 'Send Invitation' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
