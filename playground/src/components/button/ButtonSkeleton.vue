<template>
  <ElSkeleton animated :loading="true">
    <template #template>
      <div style="padding: 4px 0">
        <ElSkeletonItem variant="button" style="width: 80px; height: 32px" />
      </div>
    </template>
  </ElSkeleton>
</template>

<script setup lang="ts">
import { ElSkeleton, ElSkeletonItem } from "element-plus";
import "element-plus/es/components/skeleton/style/css";
import "element-plus/es/components/skeleton-item/style/css";
</script>
