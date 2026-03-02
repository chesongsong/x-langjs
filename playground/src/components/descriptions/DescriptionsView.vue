<template>
  <div style="padding: 4px 0">
    <ElDescriptions :title="title || undefined" :column="column" :border="border">
      <ElDescriptionsItem v-for="(item, i) in items" :key="i" :label="item.label">
        {{ item.value }}
      </ElDescriptionsItem>
    </ElDescriptions>
  </div>
</template>

<script setup lang="ts">
import { ElDescriptions, ElDescriptionsItem } from "element-plus";
import "element-plus/es/components/descriptions/style/css";
import "element-plus/es/components/descriptions-item/style/css";

defineProps<{
  title: string;
  items: readonly { label: string; value: string }[];
  column: number;
  border: boolean;
}>();
</script>
