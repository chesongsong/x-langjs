<template>
  <ElSkeleton animated :loading="true">
    <template #template>
      <div class="order-card-skeleton">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <ElSkeletonItem variant="h3" style="width: 140px" />
          <ElSkeletonItem variant="button" style="width: 60px; height: 24px" />
        </div>
        <ElSkeletonItem variant="text" style="width: 100%; margin-bottom: 8px" />
        <ElSkeletonItem variant="text" style="width: 60%; margin-bottom: 12px" />
        <div style="margin-top: 12px;">
          <ElSkeletonItem variant="text" style="width: 80px; margin-bottom: 6px" />
          <ElSkeletonItem variant="text" style="width: 100%; margin-bottom: 4px" />
          <ElSkeletonItem variant="text" style="width: 90%; margin-bottom: 4px" />
        </div>
      </div>
    </template>
  </ElSkeleton>
</template>

<script setup lang="ts">
import { ElSkeleton, ElSkeletonItem } from "element-plus";
import "element-plus/es/components/skeleton/style/css";
import "element-plus/es/components/skeleton-item/style/css";
</script>

<style scoped>
.order-card-skeleton {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
}
</style>
