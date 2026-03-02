<template>
  <ElSkeleton animated :loading="true">
    <template #template>
      <div style="display: flex; flex-direction: column; align-items: center; padding: 24px 0; gap: 14px">
        <ElSkeletonItem variant="circle" style="width: 48px; height: 48px" />
        <ElSkeletonItem variant="h3" style="width: 120px" />
        <ElSkeletonItem variant="text" style="width: 200px" />
      </div>
    </template>
  </ElSkeleton>
</template>

<script setup lang="ts">
import { ElSkeleton, ElSkeletonItem } from "element-plus";
import "element-plus/es/components/skeleton/style/css";
import "element-plus/es/components/skeleton-item/style/css";
</script>
