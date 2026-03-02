import { createApp, defineComponent as vueDefineComponent, h } from "vue";
import { ElTable, ElTableColumn } from "element-plus";
import "element-plus/es/components/table/style/css";
import "element-plus/es/components/table-column/style/css";
import {
  defineComponent,
  ZArray,
  ZObject,
} from "@x-lang/core";
import type { RenderableContext, SkeletonContext } from "@x-lang/core";
import { renderSkeleton, ElSkeletonItem } from "./_skeleton-helper";

interface RenderTableColumn {
  readonly name: string;
  readonly values: readonly unknown[];
}

interface RenderTableData {
  readonly columns: readonly RenderTableColumn[];
}

function inferColumns(records: ZArray): RenderTableData {
  const keySet = new Set<string>();
  const keyOrder: string[] = [];

  for (const record of records.elements) {
    if (record instanceof ZObject) {
      for (const key of Object.keys(record.entries)) {
        if (!keySet.has(key)) {
          keySet.add(key);
          keyOrder.push(key);
        }
      }
    }
  }

  return {
    columns: keyOrder.map((key) => ({
      name: key,
      values: records.elements.map((record) =>
        record instanceof ZObject ? record.get(key).unbox() : null,
      ),
    })),
  };
}

function resolveColumns(
  ctx: RenderableContext,
  records: ZArray,
): RenderTableData {
  const columnArgs = ctx.args.slice(1);

  const columns: RenderTableColumn[] = columnArgs.map((arg) => {
    if (arg.type === "NamedArgument") {
      const values = records.elements.map((record) => {
        const childEnv = ctx.createChildEnv();
        if (record instanceof ZObject) {
          for (const [key, val] of Object.entries(record.entries)) {
            childEnv.define(key, val);
          }
          childEnv.define("自己", record);
        }
        return ctx.evaluate(arg.value, childEnv).unbox();
      });
      return { name: arg.name, values };
    }

    if (arg.type === "Identifier") {
      return {
        name: arg.name,
        values: records.elements.map((record) =>
          record instanceof ZObject ? record.get(arg.name).unbox() : null,
        ),
      };
    }

    throw new Error(
      "table column must be a field name or named argument (name = expression)",
    );
  });

  return { columns };
}

const ARG_RE = /^table\s*\(\s*([^,)]+)/;
const COL_RE = /,\s*([^,)]+)/g;

function inferSkeletonShape(ctx: SkeletonContext): {
  rows: number;
  columns: string[];
} {
  const match = ARG_RE.exec(ctx.content.trim());
  if (!match) return { rows: 4, columns: ["", "", ""] };

  const varName = match[1]!.trim();
  const data = ctx.variables[varName];

  const rows = Array.isArray(data) ? data.length : 4;

  const explicitCols: string[] = [];
  let colMatch: RegExpExecArray | null;
  const rest = ctx.content.trim().slice(match[0].length);
  while ((colMatch = COL_RE.exec(rest)) !== null) {
    explicitCols.push(colMatch[1]!.trim().split("=")[0]!.trim());
  }

  if (explicitCols.length > 0) {
    return { rows, columns: explicitCols };
  }

  if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
    return { rows, columns: Object.keys(data[0] as Record<string, unknown>) };
  }

  return { rows, columns: ["", "", ""] };
}

export const table = defineComponent<RenderTableData>("table", {
  skeleton(container, ctx) {
    const { rows, columns } = inferSkeletonShape(ctx);
    return renderSkeleton(container, () =>
      h("div", { style: { border: "1px solid #ebeef5", borderRadius: "4px", overflow: "hidden" } }, [
        h("div", {
          style: {
            display: "flex",
            background: "#fafafa",
            borderBottom: "2px solid #ebeef5",
            padding: "10px 0",
          },
        }, columns.map((col) =>
          h("div", { style: { flex: 1, padding: "0 14px" } }, [
            col
              ? h("span", { style: { fontSize: "13px", fontWeight: 600, color: "#909399" } }, col)
              : h(ElSkeletonItem, { variant: "text", style: { width: "60%" } }),
          ]),
        )),
        ...Array.from({ length: rows }, (_, r) =>
          h("div", {
            style: {
              display: "flex",
              borderBottom: r < rows - 1 ? "1px solid #ebeef5" : "none",
              padding: "8px 0",
            },
          }, columns.map(() =>
            h("div", { style: { flex: 1, padding: "0 14px" } }, [
              h(ElSkeletonItem, { variant: "text", style: { width: `${50 + Math.random() * 40}%` } }),
            ]),
          )),
        ),
      ]),
    );
  },

  setup: {
    execute(ctx: RenderableContext): RenderTableData {
      if (ctx.args.length < 1) {
        throw new Error("table requires at least 1 argument (data source)");
      }

      const firstArg = ctx.args[0]!;
      if (firstArg.type === "NamedArgument") {
        throw new Error(
          "table first argument must be a data source, not a named argument",
        );
      }

      const recordsVal = ctx.evaluate(firstArg);
      if (!(recordsVal instanceof ZArray)) {
        throw new Error("table first argument must be an array");
      }

      if (ctx.args.length === 1) {
        return inferColumns(recordsVal);
      }

      return resolveColumns(ctx, recordsVal);
    },
  },

  render(data, container) {
    const rowCount = data.columns[0]?.values.length ?? 0;
    const rows: Record<string, string>[] = [];

    for (let i = 0; i < rowCount; i++) {
      const row: Record<string, string> = { _index: String(i + 1) };
      for (const col of data.columns) {
        row[col.name] = String(col.values[i] ?? "");
      }
      rows.push(row);
    }

    const columns = data.columns.map((col) => col.name);

    const TableWrapper = vueDefineComponent({
      setup() {
        return () =>
          h(
            ElTable,
            {
              data: rows,
              stripe: true,
              border: true,
              size: "small",
              style: { width: "100%" },
            },
            () => [
              h(ElTableColumn, { type: "index", label: "#", width: 50 }),
              ...columns.map((name) =>
                h(ElTableColumn, { prop: name, label: name, minWidth: 120 }),
              ),
            ],
          );
      },
    });

    const mountEl = document.createElement("div");
    container.appendChild(mountEl);
    const app = createApp(TableWrapper);
    app.mount(mountEl);

    return {
      dispose() {
        app.unmount();
        mountEl.remove();
      },
    };
  },
});
