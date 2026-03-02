<template>
  <ElResult
    :title="title"
    :sub-title="subTitle || undefined"
    :icon="resultIcon"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ElResult } from "element-plus";
import "element-plus/es/components/result/style/css";

const props = defineProps<{
  title: string;
  subTitle: string;
  icon: string;
}>();

const resultIcon = computed(
  () => props.icon as "success" | "warning" | "info" | "error",
);
</script>
