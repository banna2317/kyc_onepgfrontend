<script setup lang="ts">
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination'

defineProps<{
  total: number
  itemsPerPage: number
  defaultPage?: number
}>()

const emit = defineEmits<{
  (e: 'change', page: number): void
}>()
</script>

<template>
  <Pagination
    :total="total"
    :items-per-page="itemsPerPage"
    :default-page="defaultPage ?? 1"
    @update:page="(page) => emit('change', page)"
    v-slot="{ page }"
  >
    <PaginationContent v-slot="{ items }">
      <PaginationPrevious />

      <template v-for="(item, index) in items" :key="index">
        <PaginationItem
          v-if="item.type === 'page'"
          :value="item.value"
          :is-active="item.value === page"
        >
          {{ item.value }}
        </PaginationItem>

        <PaginationEllipsis
          v-else
          :index="index"
        />
      </template>

      <PaginationNext />
    </PaginationContent>
  </Pagination>
</template>
