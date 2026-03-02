<template>
  <ElSkeleton animated :loading="true">
    <template #template>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; padding: 4px 0">
        <ElSkeletonItem
          v-for="i in count"
          :key="i"
          variant="button"
          style="width: 56px; height: 24px"
        />
      </div>
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

const TAG_ARGS_RE = /tag\s*\(([^)]*)\)/;

const count = computed(() => {
  const match = TAG_ARGS_RE.exec(props.content);
  if (!match) return 1;
  const inner = match[1] ?? "";
  return Math.max(1, Math.min(inner.split(",").filter((s) => s.trim()).length, 6));
});
</script>
