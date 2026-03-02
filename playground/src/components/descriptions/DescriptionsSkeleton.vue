<template>
  <ElSkeleton animated :loading="true">
    <template #template>
      <div style="border: 1px solid #ebeef5; border-radius: 4px; padding: 14px 16px; display: flex; flex-direction: column; gap: 14px">
        <div v-for="i in count" :key="i" style="display: flex; gap: 16px; align-items: center">
          <ElSkeletonItem variant="text" style="width: 60px" />
          <ElSkeletonItem variant="text" :style="{ width: `${80 + Math.random() * 80}px` }" />
        </div>
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

const DESC_ARG_RE = /^descriptions\s*\(\s*([^,)]+)/;

const count = computed(() => {
  const match = DESC_ARG_RE.exec(props.content.trim());
  if (!match) return 4;
  const varName = match[1]!.trim();
  const data = props.variables[varName];
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return Object.keys(data as Record<string, unknown>).length;
  }
  return 4;
});
</script>
