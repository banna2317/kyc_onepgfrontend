<script setup lang="ts">
import { ref, computed } from "vue"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { X, Filter } from "lucide-vue-next"

const emit = defineEmits(["apply", "clear"])

const open = ref(false)
const searchType = ref("Transfer ID")
const searchValue = ref("")
const transferStatus = ref<string[]>([])

const statuses = [
  "Success",
  "Failed",
  "Reversed",
  "Rejected",
  "Pending",
  "Processing",
  "Received",
  "Manually Rejected",
]

const activeFilters = computed(() => {
  const badges: { label: string; type: string; value?: string }[] = []

  if (searchValue.value) {
    badges.push({ label: `${searchType.value}: ${searchValue.value}`, type: "search" })
  }

  transferStatus.value.forEach((status) =>
    badges.push({ label: status, type: "status", value: status })
  )

  return badges
})

function applyFilters() {
  emit("apply", {
    searchType: searchType.value,
    searchValue: searchValue.value,
    status: transferStatus.value,
  })
  open.value = false
}

function clearFilters() {
  searchValue.value = ""
  transferStatus.value = []
  emit("clear")
}

function removeBadge(filter: any) {
  if (filter.type === "search") searchValue.value = ""
  else if (filter.type === "status")
    transferStatus.value = transferStatus.value.filter((s) => s !== filter.value)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Top Row: Filter Button + Active Filters -->
    <div class="flex flex-wrap items-center gap-2">
      <Popover v-model:open="open">
        <PopoverTrigger as-child>
          <Button variant="outline" class="flex items-center gap-2">
            <Filter class="h-4 w-4 text-purple-600" />
            Filters
          </Button>
        </PopoverTrigger>

        <PopoverContent class="w-[460px] rounded-xl shadow-lg border border-gray-200 p-5 bg-white">
          <!-- Header -->
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold text-base text-gray-800">Search & Filters</h3>
            <Button variant="ghost" size="sm" class="text-xs text-gray-500" @click="clearFilters">
              Clear All
            </Button>
          </div>

          <!-- Search Section -->
          <div class="mb-4">
            <label class="text-sm font-medium mb-1 block text-gray-700">Search</label>
            <div class="flex border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-purple-200">
              <select
                v-model="searchType"
                class="bg-gray-50 border-r px-2 py-2 text-sm text-gray-700 focus:outline-none"
              >
                <option>Transfer ID</option>
                <option>Order ID</option>
                <option>Reference ID</option>
              </select>
              <input
                v-model="searchValue"
                :placeholder="`Enter ${searchType}`"
                class="flex-1 px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <!-- Filters Section -->
          <div>
            <h4 class="text-sm font-semibold mb-2 text-gray-700">Transfer Status</h4>
            <div class="grid grid-cols-2 gap-2 bg-gray-50 rounded-lg p-3 border">
              <label
                v-for="status in statuses"
                :key="status"
                class="flex items-center gap-2 text-sm cursor-pointer hover:text-purple-600"
              >
                <input
                  type="checkbox"
                  :value="status"
                  v-model="transferStatus"
                  class="accent-purple-600"
                />
                {{ status }}
              </label>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end mt-5 gap-3">
            <Button variant="outline" size="sm" @click="clearFilters">Reset</Button>
            <Button size="sm" @click="applyFilters">Apply</Button>
          </div>
        </PopoverContent>
      </Popover>

      <!-- Active Filter Badges -->
      <transition-group name="fade" tag="div" class="flex flex-wrap gap-2 items-center">
        <Badge
          v-for="filter in activeFilters"
          :key="filter.label"
          variant="secondary"
          class="flex items-center gap-1 rounded-full px-3 py-1 bg-purple-100 text-purple-700 text-xs"
        >
          {{ filter.label }}
          <X
            class="h-3 w-3 cursor-pointer hover:text-purple-800"
            @click="removeBadge(filter)"
          />
        </Badge>

        <Button
          v-if="activeFilters.length"
          variant="ghost"
          size="sm"
          class="text-xs text-gray-600 underline"
          @click="clearFilters"
        >
          Clear All
        </Button>
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
details[open] summary {
  background-color: #f3e8ff;
}

summary::-webkit-details-marker {
  display: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
