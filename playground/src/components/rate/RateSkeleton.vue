<template>
  <ElSkeleton animated :loading="true">
    <template #template>
      <div style="display: flex; gap: 6px; padding: 6px 0">
        <ElSkeletonItem
          v-for="i in 5"
          :key="i"
          variant="circle"
          style="width: 20px; height: 20px"
        />
      </div>
    </template>
  </ElSkeleton>
</template>

<script setup lang="ts">
import { ElSkeleton, ElSkeletonItem } from "element-plus";
import "element-plus/es/components/skeleton/style/css";
import "element-plus/es/components/skeleton-item/style/css";
</script>
