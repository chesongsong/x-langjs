<template>
  <div style="padding: 8px 0">
    <ElStatistic
      :title="title"
      :value="value"
      :prefix="prefix || undefined"
      :suffix="suffix || undefined"
    />
  </div>
</template>

<script setup lang="ts">
import { ElStatistic } from "element-plus";
import "element-plus/es/components/statistic/style/css";

defineProps<{
  title: string;
  value: number;
  prefix: string;
  suffix: string;
}>();
</script>
