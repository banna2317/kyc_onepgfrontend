<script setup lang="ts">
import { defineProps, useSlots } from "vue";
import { cn } from "@/lib/utils";
const props = defineProps<{
  class?: string;
}>();

const slots = useSlots();
</script>

<template>
  <div :class="cn('backdrop-blur-xl bg-gradient-glass border border-border/30 rounded-2xl shadow-card', props.class)">
    <slot />
  </div>
</template>
