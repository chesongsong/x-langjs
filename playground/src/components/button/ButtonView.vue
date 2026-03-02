<template>
  <div style="padding: 4px 0">
    <ElButton :type="type ?? 'primary'" :size="size ?? 'default'" @click="handleClick">
      {{ text }}
    </ElButton>
  </div>
</template>

<script setup lang="ts">
import { ElButton } from "element-plus";
import "element-plus/es/components/button/style/css";

const props = defineProps<{
  text: string;
  type: string;
  size: string;
  onClick?: string;
}>();

function handleClick() {
  if (props.onClick) {
    alert(props.onClick);
  }
}
</script>
