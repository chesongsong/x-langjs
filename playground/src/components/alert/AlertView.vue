<template>
  <div style="margin: 4px 0">
    <ElAlert
      :title="title"
      :description="description || undefined"
      :type="alertType"
      :closable="closable"
      show-icon
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ElAlert } from "element-plus";
import "element-plus/es/components/alert/style/css";

const props = defineProps<{
  title: string;
  description: string;
  type: string;
  closable: boolean;
}>();

const alertType = computed(
  () => props.type as "success" | "warning" | "info" | "error",
);
</script>
