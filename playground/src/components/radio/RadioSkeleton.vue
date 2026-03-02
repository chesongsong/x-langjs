<template>
  <ElSkeleton animated :loading="true">
    <template #template>
      <div style="display: flex; gap: 20px; padding: 8px 0">
        <div
          v-for="(opt, i) in inferredOptions"
          :key="i"
          style="display: flex; align-items: center; gap: 6px"
        >
          <ElSkeletonItem variant="circle" style="width: 16px; height: 16px" />
          <span v-if="opt" style="font-size: 14px; color: #909399">{{ opt }}</span>
          <ElSkeletonItem v-else variant="text" style="width: 48px" />
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

const RADIO_ARG_RE = /^radio\s*\(\s*([^,)]+)/;

const inferredOptions = computed(() => {
  const match = RADIO_ARG_RE.exec(props.content.trim());
  if (!match) return ["", "", ""];

  const varName = match[1]!.trim();
  const data = props.variables[varName];

  if (Array.isArray(data) && data.length > 0) {
    return data.map((item) => String(item));
  }

  return ["", "", ""];
});
</script>
