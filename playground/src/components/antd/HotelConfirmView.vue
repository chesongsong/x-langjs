<template>
  <div class="hotel-confirm">
    <ACard class="card" :bordered="false">
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
        <AButton type="primary" @click="handleSubmit">{{ buttonText }}</AButton>
      </div>
    </ACard>
  </div>
</template>

<script setup lang="ts">
import { Card as ACard, Button as AButton, message } from "ant-design-vue";

const props = defineProps<{
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
  submitMessage: string;
}>();

function handleSubmit() {
  message.success(props.submitMessage || "已提交");
}
</script>

<style scoped>
.hotel-confirm {
  margin: 8px 0;
}

.card :deep(.ant-card-body) {
  padding: 16px;
}

.section {
  margin-bottom: 12px;
}

.label {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
  margin-bottom: 6px;
}

.value {
  color: rgba(0, 0, 0, 0.85);
}

.value.strong {
  font-weight: 600;
}

.list {
  padding-left: 18px;
  margin: 0;
  color: rgba(0, 0, 0, 0.85);
}

.lines {
  display: grid;
  gap: 4px;
  color: rgba(0, 0, 0, 0.85);
}

.tip {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

.actions {
  margin-top: 12px;
}
</style>
