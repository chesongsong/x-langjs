<template>
  <div style="padding: 4px 0">
    <ElButton :type="(type ?? 'primary') as any" :size="(size ?? 'default') as any" @click="handleClick">
      {{ text }}
    </ElButton>
  </div>
</template>

<script setup lang="ts">
import { ElButton, ElMessage } from "element-plus";
import "element-plus/es/components/button/style/css";
import "element-plus/es/components/message/style/css";

const props = defineProps<{
  text: string;
  type: string;
  size: string;
  onClick?: string;
}>();

function handleClick() {
  if (props.onClick) {
    ElMessage.success(props.onClick);
  }
}
</script>
