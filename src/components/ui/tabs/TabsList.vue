<script setup>
import { reactiveOmit } from "@vueuse/core";
import { TabsList } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps({
  loop: { type: Boolean, required: false },
  asChild: { type: Boolean, required: false },
  as: { type: null, required: false },
  class: { type: null, required: false },
});

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <TabsList v-bind="delegatedProps" :class="cn(
    // 👇 base
    'flex items-center h-10 rounded-lg bg-muted p-1 text-muted-foreground',

    // 👇 mobile full width + scroll
    'w-full overflow-x-auto whitespace-nowrap',

    // 👇 desktop pe sirf content width
    'md:w-fit',

    // 👇 spacing
    'gap-1 px-1',

    props.class,
  )
    ">
    <slot />
  </TabsList>
</template>
