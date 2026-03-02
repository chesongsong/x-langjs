<template>
  <div style="padding: 6px 0">
    <ElRate
      :model-value="value"
      :max="max"
      :disabled="disabled"
      :allow-half="allowHalf"
    />
  </div>
</template>

<script setup lang="ts">
import { ElRate } from "element-plus";
import "element-plus/es/components/rate/style/css";

defineProps<{
  value: number;
  max: number;
  disabled: boolean;
  allowHalf: boolean;
}>();
</script>
