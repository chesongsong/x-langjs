<template>
  <div style="padding: 8px 0">
    <ElRadioGroup :model-value="selected" @update:model-value="onChange">
      <ElRadio v-for="opt in options" :key="opt" :value="opt">
        {{ opt }}
      </ElRadio>
    </ElRadioGroup>
  </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import { ElRadioGroup, ElRadio } from "element-plus";
import "element-plus/es/components/radio/style/css";
import "element-plus/es/components/radio-group/style/css";
import type { RenderContext } from "@x-lang/render";
import { XLANG_CTX_KEY } from "../_define-vue-component";

defineProps<{
  options: readonly string[];
  selected: string;
}>();

const ctx = inject<RenderContext>(XLANG_CTX_KEY)!;

function onChange(val: string | number | boolean | undefined) {
  ctx.emit("change", String(val ?? ""));
}
</script>
