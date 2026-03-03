<template>
  <div class="hotel-confirm">
    <ACard :bordered="false" class="card">
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
import { Card as ACard, Button as AButton, Message } from "@arco-design/web-vue";
import "@arco-design/web-vue/es/card/style/css.js";
import "@arco-design/web-vue/es/button/style/css.js";
import "@arco-design/web-vue/es/message/style/css.js";

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
  Message.success(props.submitMessage || "已提交");
}
</script>

<style scoped>
.hotel-confirm {
  margin: 8px 0;
}

.card :deep(.arco-card-body) {
  padding: 16px;
}

.section {
  margin-bottom: 12px;
}

.label {
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: 6px;
}

.value {
  color: var(--color-text-2);
}

.value.strong {
  font-weight: 600;
}

.list {
  padding-left: 18px;
  margin: 0;
  color: var(--color-text-2);
}

.lines {
  display: grid;
  gap: 4px;
  color: var(--color-text-2);
}

.tip {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-3);
}

.actions {
  margin-top: 12px;
}
</style>
