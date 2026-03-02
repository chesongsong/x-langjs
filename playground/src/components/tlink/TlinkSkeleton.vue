<template>
  <ElSkeleton animated :loading="true">
    <template #template>
      <ElSkeletonItem variant="text" :style="{ width: inferredWidth }" />
    </template>
  </ElSkeleton>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ElSkeleton, ElSkeletonItem } from "element-plus";
import "element-plus/es/components/skeleton/style/css";
import "element-plus/es/components/skeleton-item/style/css";

const props = defineProps<{
  content: string;
  variables: Record<string, unknown>;
}>();

const TEXT_RE = /["']([^"']+)["']/;

const inferredWidth = computed(() => {
  const match = TEXT_RE.exec(props.content);
  if (match?.[1]) return `${Math.max(60, match[1].length * 12 + 16)}px`;
  return "120px";
});
</script>
