<template>
  <div style="display: flex; gap: 8px; flex-wrap: wrap; padding: 4px 0">
    <ElTag
      v-for="(item, i) in items"
      :key="i"
      :type="tagType(item.type)"
      effect="light"
    >
      {{ item.text }}
    </ElTag>
  </div>
</template>

<script setup lang="ts">
import { ElTag } from "element-plus";
import "element-plus/es/components/tag/style/css";

type TagType = "success" | "info" | "warning" | "danger" | undefined;

defineProps<{
  items: readonly { text: string; type: string }[];
}>();

function tagType(t: string): TagType {
  return (t || undefined) as TagType;
}
</script>
