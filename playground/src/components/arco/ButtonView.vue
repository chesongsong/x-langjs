<template>
  <div style="padding: 4px 0">
    <AButton :type="buttonType" :size="buttonSize" @click="handleClick">{{ text }}</AButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Button as AButton, Message } from "@arco-design/web-vue";
import "@arco-design/web-vue/es/message/style/css.js";

const props = defineProps<{
  text: string;
  type: string;
  size: string;
  onClick?: string;
}>();

const buttonType = computed(() => {
  const t = (props.type || "primary").toLowerCase();
  const map: Record<string, "primary" | "secondary" | "dashed" | "outline" | "text"> = {
    primary: "primary",
    success: "primary",
    warning: "secondary",
    danger: "secondary",
    info: "outline",
    default: "outline",
  };
  return map[t] ?? "primary";
});

const buttonSize = computed(() => {
  const s = (props.size || "default").toLowerCase();
  if (s === "small") return "small";
  if (s === "large") return "large";
  return "medium";
});

function handleClick() {
  if (props.onClick) {
    Message.success(props.onClick);
  }
}
</script>
