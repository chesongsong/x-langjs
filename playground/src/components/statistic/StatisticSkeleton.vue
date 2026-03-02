<template>
  <ElSkeleton animated :loading="true">
    <template #template>
      <div style="padding: 8px 0">
        <ElSkeletonItem variant="text" style="width: 60px; margin-bottom: 8px" />
        <ElSkeletonItem variant="h1" style="width: 100px" />
      </div>
    </template>
  </ElSkeleton>
</template>

<script setup lang="ts">
import { ElSkeleton, ElSkeletonItem } from "element-plus";
import "element-plus/es/components/skeleton/style/css";
import "element-plus/es/components/skeleton-item/style/css";
</script>
