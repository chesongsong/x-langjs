<template>
  <div class="order-card">
    <ACard hoverable>
      <template #title>
        <span class="order-card-header">
          <span class="order-id">订单号：{{ orderId }}</span>
          <ATag :color="statusColor">{{ status }}</ATag>
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
          <ATable :data-source="tableRows" :columns="itemColumns" size="small" :pagination="false" />
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
import { Card as ACard, Tag as ATag, Table as ATable } from "ant-design-vue";

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
  if (s.includes("完成") || s.includes("已支付")) return "success";
  if (s.includes("发货")) return "processing";
  if (s.includes("待支付")) return "warning";
  return "default";
});

const tableRows = computed(() =>
  props.items.map((item, i) => ({
    key: i,
    name: item.name,
    quantity: item.quantity,
    priceStr: `¥ ${item.price.toFixed(2)}`,
    subtotalStr: `¥ ${(item.quantity * item.price).toFixed(2)}`,
  })),
);

const itemColumns = [
  { title: "商品", dataIndex: "name", key: "name" },
  { title: "数量", dataIndex: "quantity", key: "quantity", width: 80 },
  { title: "单价", dataIndex: "priceStr", key: "priceStr", width: 90 },
  { title: "小计", dataIndex: "subtotalStr", key: "subtotalStr", width: 90 },
];
</script>

<style scoped>
.order-card { margin: 8px 0; }
.order-card-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.order-id { font-weight: 600; font-size: 14px; }
.order-card-body { font-size: 13px; }
.order-row { display: flex; gap: 12px; margin-bottom: 8px; }
.order-row .label { opacity: 0.85; min-width: 72px; }
.order-row .value.amount { font-weight: 600; color: #cf1322; }
.order-items { margin-top: 12px; margin-bottom: 8px; }
.order-items .label { margin-bottom: 6px; opacity: 0.85; font-size: 13px; }
</style>
