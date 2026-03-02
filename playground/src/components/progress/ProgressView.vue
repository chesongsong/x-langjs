<template>
  <div style="padding: 6px 0">
    <ElProgress
      :percentage="percentage"
      :status="status || undefined"
      :stroke-width="strokeWidth"
      :text-inside="textInside"
    />
  </div>
</template>

<script setup lang="ts">
import { ElProgress } from "element-plus";
import "element-plus/es/components/progress/style/css";

defineProps<{
  percentage: number;
  status: string;
  strokeWidth: number;
  textInside: boolean;
}>();
</script>
