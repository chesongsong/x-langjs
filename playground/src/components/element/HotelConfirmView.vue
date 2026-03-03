<template>
  <div class="hotel-confirm">
    <ElCard shadow="hover">
      <div class="section">
        <div class="label">{{ hotelNameTitle }}</div>
        <div class="value strong">{{ hotelName }}</div>
      </div>

      <div class="section">
        <div class="label">{{ roomTitle }}</div>
        <ul class="list">
          <li v-for="item in roomItems" :key="item">{{ item }}</li>
        </ul>
      </div>

      <div class="section">
        <div class="label">{{ dateTitle }}</div>
        <div class="value">{{ dateValue }}</div>
      </div>

      <div class="section">
        <div class="label">{{ actionTitle }}</div>
        <div class="lines">
          <div v-for="item in actionItems" :key="item" class="line">{{ item }}</div>
        </div>
      </div>

      <div class="tip">{{ tip }}</div>

      <div class="actions">
        <ElButton type="primary" @click="handleSubmit">{{ buttonText }}</ElButton>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ElCard, ElButton, ElMessage } from "element-plus";
import "element-plus/es/components/card/style/css";
import "element-plus/es/components/button/style/css";
import "element-plus/es/components/message/style/css";

defineProps<{
  hotelNameTitle: string;
  hotelName: string;
  roomTitle: string;
  roomItems: string[];
  dateTitle: string;
  dateValue: string;
  actionTitle: string;
  actionItems: string[];
  tip: string;
  buttonText: string;
}>();

function handleSubmit() {
  ElMessage.success("已提交");
}
</script>

<style scoped>
.hotel-confirm {
  margin: 8px 0;
}

.section {
  margin-bottom: 12px;
}

.label {
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 6px;
}

.value {
  color: var(--el-text-color-regular);
}

.value.strong {
  font-weight: 600;
}

.list {
  padding-left: 18px;
  margin: 0;
  color: var(--el-text-color-regular);
}

.lines {
  display: grid;
  gap: 4px;
  color: var(--el-text-color-regular);
}

.tip {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.actions {
  margin-top: 12px;
}
</style>
