<script setup lang="ts">
import { ref, watch } from "vue"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

/* 🔹 PROPS FROM PARENT */
const props = defineProps<{
  searchOptions: {
    label: string
    value: string
  }[]
}>()

/* 🔹 EMIT */
const emit = defineEmits<{
  (e: "apply", payload: {
    searchType: string
    searchValue: string
    statuses: string[]
  }): void
}>()

/* 🔹 STATE */
const searchType = ref("")
const searchValue = ref("")
const statuses = ref<string[]>([])
const isOpen = ref(false)
/* 🔹 STATUS LIST */
const allStatuses = ["Success", "Failed"]

/* 🔹 DEFAULT SELECT FIRST OPTION */
watch(
  () => props.searchOptions,
  (opts) => {
    if (opts.length && !searchType.value) {
      searchType.value = opts[0].value
    }
  },
  { immediate: true }
)

/* 🔹 METHODS */
const toggleStatus = (status: string, checked: boolean) => {
  if (checked) {
    if (!statuses.value.includes(status)) statuses.value.push(status)
  } else {
    statuses.value = statuses.value.filter(s => s !== status)
  }
}

const applyFilter = () => {
  emit("apply", {
    searchType: searchType.value,
    searchValue: searchValue.value,
    statuses: statuses.value,
  })
  isOpen.value = false
}

const clearAll = () => {
  searchType.value = props.searchOptions[0]?.value || ""
  searchValue.value = ""
  statuses.value = []

  emit("apply", {
    searchType: searchType.value,
    searchValue: "",
    statuses: [],
  })

  isOpen.value = false
}
</script>

<template>
  <DropdownMenu v-model:open="isOpen">
    <DropdownMenuTrigger as-child>
      <Button variant="outline" class="gap-2">
        Search & Filter
        <!-- <span>⌄</span> -->
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent class=" w-[calc(100vw-16px)]  max-w-[420px] mx-2 p-3 sm:p-4 space-y-4 " side="bottom" align="center" :close-on-select="false">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <button class="text-sm text-muted-foreground hover:underline" @click="clearAll">
          Clear All
        </button>

        <Button size="sm" @click="applyFilter">
          Apply
        </Button>
      </div>

      <!-- Search -->
      <div class="space-y-2">
        <label class="text-sm font-medium">Search</label>

        <div class="flex flex-col sm:flex-row gap-2">
          <Select v-model="searchType">
            <SelectTrigger class="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem v-for="opt in props.searchOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Input v-model="searchValue" placeholder="Enter value" />
        </div>
      </div>

      <!-- Status Filter -->
      <div class="space-y-3">
        <div class="font-medium text-sm bg-purple-50 px-3 py-2 rounded">
          Status Filter
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="status in allStatuses" :key="status" class="flex items-center gap-2" @click.stop>
            <Checkbox :model-value="statuses.includes(status)"
              @update:model-value="(val) => toggleStatus(status, val)" />
            <span class="text-sm">{{ status }}</span>
          </div>
        </div>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
