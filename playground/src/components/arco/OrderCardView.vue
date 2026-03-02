<template>
  <div class="order-card">
    <ACard hoverable>
      <template #title>
        <span class="order-card-header">
          <span class="order-id">订单号：{{ orderId }}</span>
          <ATag :color="statusColor" size="small">{{ status }}</ATag>
        </span>
      </template>
      <div class="order-card-body">
        <div class="order-row">
          <span class="label">下单时间</span>
          <span class="value">{{ orderTime }}</span>
        </div>
        <div class="order-row">
          <span class="label">订单金额</span>
          <span class="value amount">¥ {{ amount.toFixed(2) }}</span>
        </div>
        <div v-if="items.length > 0" class="order-items">
          <div class="label">商品明细</div>
          <ATable :data="tableRows" :columns="itemColumns" size="small" :pagination="false" />
        </div>
        <div v-if="address !== '—'" class="order-row">
          <span class="label">收货地址</span>
          <span class="value">{{ address }}</span>
        </div>
      </div>
    </ACard>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Card as ACard, Tag as ATag, Table as ATable } from "@arco-design/web-vue";
import "@arco-design/web-vue/es/card/style/css.js";
import "@arco-design/web-vue/es/tag/style/css.js";
import "@arco-design/web-vue/es/table/style/css.js";

interface OrderItem {
  readonly name: string;
  readonly quantity: number;
  readonly price: number;
}

const props = defineProps<{
  orderId: string;
  status: string;
  amount: number;
  orderTime: string;
  items: readonly OrderItem[];
  address: string;
}>();

const statusColor = computed(() => {
  const s = props.status;
  if (s.includes("完成") || s.includes("已支付")) return "green";
  if (s.includes("发货")) return "orange";
  if (s.includes("待支付")) return "arcoblue";
  return "gray";
});

const tableRows = computed(() =>
  props.items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    priceStr: `¥ ${item.price.toFixed(2)}`,
    subtotalStr: `¥ ${(item.quantity * item.price).toFixed(2)}`,
  })),
);

const itemColumns = [
  { title: "商品", dataIndex: "name" },
  { title: "数量", dataIndex: "quantity", width: 80 },
  { title: "单价", dataIndex: "priceStr", width: 90 },
  { title: "小计", dataIndex: "subtotalStr", width: 90 },
];
</script>

<style scoped>
.order-card { margin: 8px 0; }
.order-card-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.order-id { font-weight: 600; font-size: 14px; }
.order-card-body { font-size: 13px; }
.order-row { display: flex; gap: 12px; margin-bottom: 8px; }
.order-row .label { color: var(--color-text-3); min-width: 72px; }
.order-row .value.amount { font-weight: 600; color: rgb(var(--red-6)); }
.order-items { margin-top: 12px; margin-bottom: 8px; }
.order-items .label { margin-bottom: 6px; color: var(--color-text-3); font-size: 13px; }
</style>
