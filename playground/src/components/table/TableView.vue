<template>
  <ElTable :data="rows" stripe border size="small" style="width: 100%">
    <ElTableColumn type="index" label="#" :width="50" />
    <ElTableColumn
      v-for="col in columnNames"
      :key="col"
      :prop="col"
      :label="col"
      :min-width="120"
    />
  </ElTable>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ElTable, ElTableColumn } from "element-plus";
import "element-plus/es/components/table/style/css";
import "element-plus/es/components/table-column/style/css";

interface RenderTableColumn {
  readonly name: string;
  readonly values: readonly unknown[];
}

const props = defineProps<{
  columns: readonly RenderTableColumn[];
}>();

const columnNames = computed(() => props.columns.map((c) => c.name));

const rows = computed(() => {
  const rowCount = props.columns[0]?.values.length ?? 0;
  const result: Record<string, string>[] = [];
  for (let i = 0; i < rowCount; i++) {
    const row: Record<string, string> = { _index: String(i + 1) };
    for (const col of props.columns) {
      row[col.name] = String(col.values[i] ?? "");
    }
    result.push(row);
  }
  return result;
});
</script>
