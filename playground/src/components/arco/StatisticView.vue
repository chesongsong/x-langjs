<template>
  <div style="padding: 8px 0">
    <AStatistic :title="title" :value="value">
      <template #prefix v-if="prefix">{{ prefix }}</template>
      <template #suffix v-if="suffix">{{ suffix }}</template>
    </AStatistic>
  </div>
</template>

<script setup lang="ts">
import { Statistic as AStatistic } from "@arco-design/web-vue";
import "@arco-design/web-vue/es/statistic/style/css.js";

defineProps<{
  title: string;
  value: number;
  prefix: string;
  suffix: string;
}>();
</script>
