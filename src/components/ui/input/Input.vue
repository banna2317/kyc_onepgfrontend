<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { cn } from "@/lib/utils";
import { ref, computed, defineProps, defineEmits, useAttrs, defineExpose } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number], required: false },
  defaultValue: { type: [String, Number], required: false },
  type: { type: String, default: "text" },
  class: { type: [String, Array, Object], default: "" },
});

const emits = defineEmits(["update:modelValue"]);
const attrs = useAttrs(); // spread all other attributes

const inputRef = ref<HTMLInputElement | null>(null);
defineExpose({ inputRef }); // allow parent to access input element

const model = useVModel(props, "modelValue", emits, {
  defaultValue: props.defaultValue,
  passive: true,
});

const inputClass = computed(() =>
  cn(
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    props.class
  )
);
</script>

<template>
  <input
    v-model="model"
    ref="inputRef"
    :type="props.type"
    :class="inputClass"
    v-bind="attrs"
  />
</template>
