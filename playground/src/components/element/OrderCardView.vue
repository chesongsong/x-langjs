<template>
  <div class="order-card">
    <ElCard shadow="hover">
      <template #header>
        <span class="order-card-header">
          <span class="order-id">订单号：{{ orderId }}</span>
          <ElTag :type="statusTagType" size="small">{{ status }}</ElTag>
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
          <ElTable :data="items" size="small" border style="width: 100%">
            <ElTableColumn prop="name" label="商品" min-width="120" />
            <ElTableColumn prop="quantity" label="数量" width="80" align="center" />
            <ElTableColumn label="单价" width="90" align="right">
              <template #default="{ row }">¥ {{ row.price.toFixed(2) }}</template>
            </ElTableColumn>
            <ElTableColumn label="小计" width="90" align="right">
              <template #default="{ row }">¥ {{ (row.quantity * row.price).toFixed(2) }}</template>
            </ElTableColumn>
          </ElTable>
        </div>
        <div v-if="address !== '—'" class="order-row">
          <span class="label">收货地址</span>
          <span class="value">{{ address }}</span>
        </div>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ElCard, ElTag, ElTable, ElTableColumn } from "element-plus";
import "element-plus/es/components/card/style/css";
import "element-plus/es/components/tag/style/css";
import "element-plus/es/components/table/style/css";
import "element-plus/es/components/table-column/style/css";

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

const statusTagType = computed(() => {
  const s = props.status;
  if (s.includes("完成") || s.includes("已支付")) return "success";
  if (s.includes("发货")) return "warning";
  if (s.includes("待支付")) return "info";
  return "info";
});
</script>

<style scoped>
.order-card { margin: 8px 0; }
.order-card-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.order-id { font-weight: 600; font-size: 14px; }
.order-card-body { font-size: 13px; }
.order-row { display: flex; gap: 12px; margin-bottom: 8px; }
.order-row .label { color: var(--el-text-color-secondary); min-width: 72px; }
.order-row .value.amount { font-weight: 600; color: var(--el-color-danger); }
.order-items { margin-top: 12px; margin-bottom: 8px; }
.order-items .label { margin-bottom: 6px; color: var(--el-text-color-secondary); font-size: 13px; }
</style>
