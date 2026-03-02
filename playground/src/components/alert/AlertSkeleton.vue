<template>
  <ElSkeleton animated :loading="true">
    <template #template>
      <div style="border: 1px solid #e4e7ed; border-radius: 4px; padding: 12px 16px; background: #f4f4f5">
        <ElSkeletonItem variant="h3" style="width: 30%" />
        <ElSkeletonItem
          v-if="hasDescription"
          variant="text"
          style="width: 80%; margin-top: 8px"
        />
      </div>
    </template>
  </ElSkeleton>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ElSkeleton, ElSkeletonItem } from "element-plus";
import "element-plus/es/components/skeleton/style/css";
import "element-plus/es/components/skeleton-item/style/css";

const props = defineProps<{
  content: string;
  variables: Record<string, unknown>;
}>();

const hasDescription = computed(() => props.content.includes("description"));
</script>
