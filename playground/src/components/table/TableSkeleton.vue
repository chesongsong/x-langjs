<template>
  <ElSkeleton animated :loading="true">
    <template #template>
      <div style="border: 1px solid #ebeef5; border-radius: 4px; overflow: hidden">
        <div style="display: flex; background: #fafafa; border-bottom: 2px solid #ebeef5; padding: 10px 0">
          <div v-for="(col, c) in shape.columns" :key="c" style="flex: 1; padding: 0 14px">
            <span v-if="col" style="font-size: 13px; font-weight: 600; color: #909399">{{ col }}</span>
            <ElSkeletonItem v-else variant="text" style="width: 60%" />
          </div>
        </div>
        <div
          v-for="r in shape.rows"
          :key="r"
          :style="{ display: 'flex', borderBottom: r < shape.rows ? '1px solid #ebeef5' : 'none', padding: '8px 0' }"
        >
          <div v-for="(_, c) in shape.columns" :key="c" style="flex: 1; padding: 0 14px">
            <ElSkeletonItem variant="text" :style="{ width: `${50 + Math.random() * 40}%` }" />
          </div>
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

const ARG_RE = /^table\s*\(\s*([^,)]+)/;
const COL_RE = /,\s*([^,)]+)/g;

const shape = computed(() => {
  const match = ARG_RE.exec(props.content.trim());
  if (!match) return { rows: 4, columns: ["", "", ""] };

  const varName = match[1]!.trim();
  const data = props.variables[varName];
  const rows = Array.isArray(data) ? data.length : 4;

  const explicitCols: string[] = [];
  let colMatch: RegExpExecArray | null;
  const rest = props.content.trim().slice(match[0].length);
  while ((colMatch = COL_RE.exec(rest)) !== null) {
    explicitCols.push(colMatch[1]!.trim().split("=")[0]!.trim());
  }

  if (explicitCols.length > 0) {
    return { rows, columns: explicitCols };
  }

  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
    return { rows, columns: Object.keys(data[0] as Record<string, unknown>) };
  }

  return { rows, columns: ["", "", ""] };
});
</script>
