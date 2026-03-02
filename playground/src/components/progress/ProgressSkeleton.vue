<template>
  <ElSkeleton animated :loading="true">
    <template #template>
      <div style="padding: 6px 0">
        <ElSkeletonItem variant="rect" style="width: 100%; height: 20px; border-radius: 100px" />
      </div>
    </template>
  </ElSkeleton>
</template>

<script setup lang="ts">
import { ElSkeleton, ElSkeletonItem } from "element-plus";
import "element-plus/es/components/skeleton/style/css";
import "element-plus/es/components/skeleton-item/style/css";
</script>
