import type { SimpleSetup, AdvancedSetup, RenderableContext } from "@x-lang/core";
import { XArray, XObject } from "@x-lang/core";

// Normalize to a safe string for display.
function coerceText(value: unknown): string {
  if (value && typeof value === "object" && "toString" in value) {
    return (value as { toString: () => string }).toString();
  }
  return String(value ?? "");
}

// Normalize to a plain array (unwrap XArray when needed).
function coerceArray(value: unknown): unknown[] {
  if (value instanceof XArray) return value.elements;
  if (Array.isArray(value)) return value;
  return [];
}

// Normalize to a plain object (unwrap XObject when needed).
function coerceObject(value: unknown): Record<string, unknown> | null {
  if (value instanceof XObject) return value.entries;
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

// Deep-convert X* wrapper values into plain JS values.
function toPlain(value: unknown): unknown {
  if (value instanceof XArray) {
    return value.elements.map((item) => toPlain(item));
  }
  if (value instanceof XObject) {
    const entries: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value.entries)) {
      entries[key] = toPlain(val);
    }
    return entries;
  }
  if (value && typeof value === "object") {
    if ("unbox" in value && typeof (value as { unbox: () => unknown }).unbox === "function") {
      return (value as { unbox: () => unknown }).unbox();
    }
    if (Array.isArray(value)) {
      return value.map((item) => toPlain(item));
    }
    const entries: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      entries[key] = toPlain(val);
    }
    return entries;
  }
  return value;
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

export interface ButtonData {
  readonly text: string;
  readonly type: string;
  readonly size: string;
  readonly onClick?: string;
}

export const buttonSetup: SimpleSetup<ButtonData> = (args, named) => ({
  text: (named.text as string) ?? (args[0] as string) ?? "Button",
  type: (named.type as string) ?? (args[1] as string) ?? "primary",
  size: (named.size as string) ?? (args[2] as string) ?? "default",
  onClick: (named.onClick as string) ?? (args[3] as string),
});

// ---------------------------------------------------------------------------
// Alert
// ---------------------------------------------------------------------------

export interface AlertData {
  readonly title: string;
  readonly description: string;
  readonly type: string;
  readonly closable: boolean;
}

export const alertSetup: SimpleSetup<AlertData> = (args, named) => {
  const firstText = typeof args[0] === "string" ? args[0] : "";
  return {
    title: (named.title as string) ?? firstText,
    description: (named.description as string) ?? "",
    type: (named.type as string) ?? "info",
    closable: (named.closable as boolean) ?? false,
  };
};

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export interface ProgressData {
  readonly percentage: number;
  readonly status: string;
  readonly strokeWidth: number;
  readonly textInside: boolean;
}

export const progressSetup: SimpleSetup<ProgressData> = (args, named) => ({
  percentage: (named.value as number) ?? (args[0] as number) ?? 0,
  status: (named.status as string) ?? "",
  strokeWidth: (named.strokeWidth as number) ?? 20,
  textInside: (named.textInside as boolean) ?? true,
});

// ---------------------------------------------------------------------------
// Tag
// ---------------------------------------------------------------------------

export interface TagData {
  readonly items: readonly { text: string; type: string }[];
}

export const tagSetup: SimpleSetup<TagData> = (args, named) => {
  const type = (named.type as string) ?? "";
  const items: { text: string; type: string }[] = [];

  for (const arg of args) {
    if (typeof arg === "string") {
      items.push({ text: arg, type });
    } else if (Array.isArray(arg)) {
      for (const item of arg) {
        items.push({ text: String(item), type });
      }
    }
  }

  if (items.length === 0) {
    items.push({ text: "tag", type });
  }

  return { items };
};

// ---------------------------------------------------------------------------
// Statistic
// ---------------------------------------------------------------------------

export interface StatisticData {
  readonly title: string;
  readonly value: number;
  readonly prefix: string;
  readonly suffix: string;
}

export const statisticSetup: SimpleSetup<StatisticData> = (args, named) => ({
  title: (named.title as string) ?? (args[0] as string) ?? "",
  value: (named.value as number) ?? (args[1] as number) ?? 0,
  prefix: (named.prefix as string) ?? "",
  suffix: (named.suffix as string) ?? "",
});

// ---------------------------------------------------------------------------
// Descriptions
// ---------------------------------------------------------------------------

export interface DescItem {
  readonly label: string;
  readonly value: string;
}

export interface DescriptionsData {
  readonly title: string;
  readonly items: readonly DescItem[];
  readonly column: number;
  readonly border: boolean;
}

export const descriptionsSetup: SimpleSetup<DescriptionsData> = (
  args,
  named,
) => {
  const source = args[0];
  const items: DescItem[] = [];

  if (source instanceof XObject) {
    for (const [key, val] of Object.entries(source.entries)) {
      items.push({ label: key, value: val.toString() });
    }
  } else if (source && typeof source === "object" && !Array.isArray(source)) {
    for (const [key, val] of Object.entries(
      source as Record<string, unknown>,
    )) {
      items.push({ label: key, value: String(val) });
    }
  }

  return {
    title: (named.title as string) ?? "",
    items,
    column: (named.column as number) ?? 2,
    border: (named.border as boolean) ?? true,
  };
};

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

export interface FormField {
  readonly label: string;
  readonly prop: string;
  readonly type: string;
  readonly placeholder: string;
  readonly required: boolean;
  readonly options: readonly string[];
  readonly span: number;
  readonly rows: number;
}

export interface FormData {
  readonly title: string;
  readonly description: string;
  readonly fields: readonly FormField[];
  readonly submitText: string;
  readonly resetText: string;
  readonly labelWidth: string | number;
  readonly column: number;
}

function coerceField(raw: unknown, index: number): FormField {
  const plain = toPlain(raw);
  if (!plain || typeof plain !== "object") {
    return {
      label: `字段${index + 1}`,
      prop: `field${index + 1}`,
      type: "text",
      placeholder: "",
      required: false,
      options: [],
      span: 12,
      rows: 3,
    };
  }
  const obj = plain as Record<string, unknown>;
  const label =
    coerceText(obj.label ?? obj.名称 ?? obj.name ?? `字段${index + 1}`);
  const prop =
    coerceText(obj.prop ?? obj.字段 ?? obj.key ?? `field${index + 1}`);
  const type = coerceText(obj.type ?? obj.类型 ?? "text");
  const placeholder = coerceText(obj.placeholder ?? obj.提示 ?? "");
  const required = Boolean(obj.required ?? obj.必填 ?? false);
  const options = coerceArray(obj.options ?? obj.选项 ?? []).map((item) =>
    coerceText(item),
  );
  const span = Number(obj.span ?? obj.跨度 ?? 12);
  const rows = Number(obj.rows ?? obj.行数 ?? 3);

  return {
    label,
    prop,
    type,
    placeholder,
    required,
    options,
    span: Number.isFinite(span) ? span : 12,
    rows: Number.isFinite(rows) ? rows : 3,
  };
}

export const formSetup: SimpleSetup<FormData> = (args, named) => {
  const source = named.fields ?? args[0] ?? [];
  const fields = coerceArray(source).map((item, index) =>
    coerceField(item, index),
  );

  return {
    title: (named.title as string) ?? "复杂表单示例",
    description: (named.description as string) ?? "",
    fields,
    submitText: (named.submitText as string) ?? "提交",
    resetText: (named.resetText as string) ?? "重置",
    labelWidth: (named.labelWidth as string | number) ?? 120,
    column: (named.column as number) ?? 2,
  };
};

// ---------------------------------------------------------------------------
// Hotel Confirm Card
// ---------------------------------------------------------------------------

export interface HotelConfirmData {
  readonly hotelNameTitle: string;
  readonly hotelName: string;
  readonly roomTitle: string;
  readonly roomItems: readonly string[];
  readonly dateTitle: string;
  readonly dateValue: string;
  readonly actionTitle: string;
  readonly actionItems: readonly string[];
  readonly tip: string;
  readonly buttonText: string;
  readonly submitMessage: string;
}

// Normalize list entries into displayable text lines.
function coerceLines(value: unknown): string[] {
  return coerceArray(value).map((item) => {
    const plain = toPlain(item);
    if (plain && typeof plain === "object") {
      const obj = plain as Record<string, unknown>;
      const label = coerceText(obj.label ?? obj.标题 ?? obj.name ?? "");
      const content = coerceText(obj.value ?? obj.内容 ?? obj.text ?? "");
      if (label && content) return `${label}：${content}`;
      if (label) return label;
      if (content) return content;
    }
    return coerceText(item);
  });
}

export const hotelConfirmSetup: SimpleSetup<HotelConfirmData> = (args, named) => {
  const source = toPlain(args[0]);
  const hotelNameTitle = coerceText(
    (named.hotelNameTitle as string) ??
      (source && typeof source === "object"
        ? (source as Record<string, unknown>).hotelNameTitle
        : undefined) ??
      "酒店名称",
  );
  const hotelName = coerceText(
    (named.hotelName as string) ??
      (source && typeof source === "object"
        ? (source as Record<string, unknown>).hotelName
        : undefined) ??
      "测试酒店123456",
  );
  const roomTitle = coerceText(
    (named.roomTitle as string) ??
      (source && typeof source === "object"
        ? (source as Record<string, unknown>).roomTitle
        : undefined) ??
      "售卖房型及产品",
  );
  const roomItems =
    coerceLines(
      (named.roomItems as unknown) ??
        (source && typeof source === "object"
          ? (source as Record<string, unknown>).roomItems
          : undefined),
    ).length > 0
      ? coerceLines(
          (named.roomItems as unknown) ??
            (source && typeof source === "object"
              ? (source as Record<string, unknown>).roomItems
              : undefined),
        )
      : ["家庭房", "家庭房-双早"];
  const dateTitle = coerceText(
    (named.dateTitle as string) ??
      (source && typeof source === "object"
        ? (source as Record<string, unknown>).dateTitle
        : undefined) ??
      "日期",
  );
  const dateValue = coerceText(
    (named.dateValue as string) ??
      (named.date as string) ??
      (source && typeof source === "object"
        ? (source as Record<string, unknown>).dateValue ?? (source as Record<string, unknown>).date
        : undefined) ??
      "2026年2月12日",
  );
  const actionTitle = coerceText(
    (named.actionTitle as string) ??
      (source && typeof source === "object"
        ? (source as Record<string, unknown>).actionTitle
        : undefined) ??
      "操作内容",
  );
  const actionItems =
    coerceLines(
      (named.actionItems as unknown) ??
        (named.actions as unknown) ??
        (source && typeof source === "object"
          ? (source as Record<string, unknown>).actionItems ??
            (source as Record<string, unknown>).actions
          : undefined),
    ).length > 0
      ? coerceLines(
          (named.actionItems as unknown) ??
            (named.actions as unknown) ??
            (source && typeof source === "object"
              ? (source as Record<string, unknown>).actionItems ??
                (source as Record<string, unknown>).actions
              : undefined),
        )
      : ["房态：打开", "添加保留房：统一设置为 2 间", "保留房售完后：直接关房"];
  const tip = coerceText(
    (named.tip as string) ??
      (source && typeof source === "object"
        ? (source as Record<string, unknown>).tip
        : undefined) ??
      "以上修改内容确认无误后可点击 确认提交按钮",
  );
  const buttonText = coerceText(
    (named.buttonText as string) ??
      (source && typeof source === "object"
        ? (source as Record<string, unknown>).buttonText
        : undefined) ??
      "确认提交",
  );
  const submitMessage = coerceText(
    (named.submitMessage as string) ??
      (named.message as string) ??
      (source && typeof source === "object"
        ? (source as Record<string, unknown>).submitMessage ??
          (source as Record<string, unknown>).message
        : undefined) ??
      "已提交",
  );

  return {
    hotelNameTitle,
    hotelName,
    roomTitle,
    roomItems,
    dateTitle,
    dateValue,
    actionTitle,
    actionItems,
    tip,
    buttonText,
    submitMessage,
  };
};

// ---------------------------------------------------------------------------
// Drawer
// ---------------------------------------------------------------------------

export interface DrawerData {
  readonly title: string;
  readonly content: string;
  readonly placement: string;
  readonly size: string | number;
  readonly open: boolean;
}

export const drawerSetup: SimpleSetup<DrawerData> = (args, named) => ({
  title: (named.title as string) ?? (args[0] as string) ?? "抽屉标题",
  content: (named.content as string) ?? (args[1] as string) ?? "这里是抽屉内容。",
  placement: (named.placement as string) ?? "right",
  size: (named.size as string | number) ?? "320px",
  open: (named.open as boolean) ?? false,
});

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export interface TimelineItemData {
  readonly title: string;
  readonly time: string;
  readonly type: string;
}

export interface TimelineData {
  readonly items: readonly TimelineItemData[];
}

export const timelineSetup: SimpleSetup<TimelineData> = (args, named) => {
  const raw = named.items ?? args[0];
  const items: TimelineItemData[] = [];
  for (const item of coerceArray(raw)) {
    const obj = coerceObject(item);
    if (!obj) continue;
    const title = obj.标题 ?? obj.title ?? "";
    const time = obj.时间 ?? obj.time ?? "";
    const type = obj.类型 ?? obj.type ?? "";
    items.push({
      title: coerceText(title),
      time: coerceText(time),
      type: coerceText(type),
    });
  }

  if (items.length === 0) {
    items.push(
      { title: "需求评审", time: "2026-01-08", type: "info" },
      { title: "开发完成", time: "2026-02-02", type: "success" },
      { title: "上线发布", time: "2026-02-20", type: "primary" },
    );
  }

  return { items };
};

// ---------------------------------------------------------------------------
// Collapse
// ---------------------------------------------------------------------------

export interface CollapseItemData {
  readonly title: string;
  readonly content: string;
}

export interface CollapseData {
  readonly items: readonly CollapseItemData[];
  readonly activeKeys: readonly string[];
}

export const collapseSetup: SimpleSetup<CollapseData> = (args, named) => {
  const raw = named.items ?? args[0];
  const items: CollapseItemData[] = [];
  for (const item of coerceArray(raw)) {
    const obj = coerceObject(item);
    if (!obj) continue;
    const title = obj.标题 ?? obj.title ?? "";
    const content = obj.内容 ?? obj.content ?? "";
    items.push({
      title: coerceText(title),
      content: coerceText(content),
    });
  }

  if (items.length === 0) {
    items.push(
      { title: "支持哪些组件？", content: "目前支持基础展示与交互组件。" },
      { title: "是否支持流式？", content: "支持流式渲染与骨架屏占位。" },
      { title: "如何切换 UI 库？", content: "顶部按钮可切换 Element/Arco/Antd。" },
    );
  }

  const activeKeys = (named.activeKeys as string[]) ?? items.map((_, i) => String(i));
  return { items, activeKeys };
};

// ---------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------

export interface DialogData {
  readonly title: string;
  readonly content: string;
  readonly open: boolean;
  readonly width: string | number;
  readonly triggerText: string;
}

export const dialogSetup: SimpleSetup<DialogData> = (args, named) => ({
  title: (named.title as string) ?? (args[0] as string) ?? "对话框标题",
  content: (named.content as string) ?? (args[1] as string) ?? "这里是对话框内容。",
  open: (named.open as boolean) ?? false,
  width: (named.width as string | number) ?? "420px",
  triggerText: (named.triggerText as string) ?? "打开对话框",
});

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

export interface ChartData {
  readonly option: Record<string, unknown>;
  readonly height: number;
}

function buildChartData(
  args: unknown[],
  named: Record<string, unknown>,
  fallback: Record<string, unknown>,
): ChartData {
  const rawOption = (named.option as Record<string, unknown>) ?? args[0];
  const option = (toPlain(rawOption) as Record<string, unknown>) ?? fallback;
  const height = (named.height as number) ?? (args[1] as number) ?? 280;
  return { option, height };
}

const DEFAULT_LINE_OPTION = {
  tooltip: { trigger: "axis" },
  xAxis: { type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  yAxis: { type: "value" },
  series: [{ type: "line", data: [120, 132, 101, 134, 90, 230, 210] }],
};

const DEFAULT_AREA_OPTION = {
  tooltip: { trigger: "axis" },
  xAxis: { type: "category", boundaryGap: false, data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  yAxis: { type: "value" },
  series: [{ type: "line", areaStyle: {}, data: [150, 230, 224, 218, 135, 147, 260] }],
};

const DEFAULT_BAR_OPTION = {
  tooltip: { trigger: "axis" },
  xAxis: { type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  yAxis: { type: "value" },
  series: [{ type: "bar", data: [10, 52, 200, 334, 390, 330, 220] }],
};

const DEFAULT_PIE_OPTION = {
  tooltip: { trigger: "item" },
  series: [
    {
      type: "pie",
      radius: "60%",
      data: [
        { value: 1048, name: "Search" },
        { value: 735, name: "Direct" },
        { value: 580, name: "Email" },
        { value: 484, name: "Union Ads" },
        { value: 300, name: "Video Ads" },
      ],
    },
  ],
};

const DEFAULT_SCATTER_OPTION = {
  xAxis: { type: "value" },
  yAxis: { type: "value" },
  series: [
    {
      type: "scatter",
      data: [
        [10, 8],
        [18, 15],
        [25, 5],
        [32, 28],
        [40, 12],
      ],
    },
  ],
};

const DEFAULT_CANDLE_OPTION = {
  xAxis: { type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  yAxis: { type: "value" },
  series: [
    {
      type: "candlestick",
      data: [
        [20, 34, 10, 38],
        [40, 35, 30, 50],
        [31, 38, 33, 44],
        [38, 15, 5, 42],
        [30, 25, 20, 35],
      ],
    },
  ],
};

const DEFAULT_RADAR_OPTION = {
  tooltip: {},
  radar: {
    indicator: [
      { name: "Sales", max: 6500 },
      { name: "Admin", max: 16000 },
      { name: "IT", max: 30000 },
      { name: "Support", max: 38000 },
      { name: "Dev", max: 52000 },
      { name: "Marketing", max: 25000 },
    ],
  },
  series: [
    {
      type: "radar",
      data: [{ value: [4200, 3000, 20000, 35000, 50000, 18000], name: "预算" }],
    },
  ],
};

const DEFAULT_GRAPH_OPTION = {
  tooltip: {},
  series: [
    {
      type: "graph",
      layout: "force",
      data: [
        { name: "主节点" },
        { name: "节点 A" },
        { name: "节点 B" },
        { name: "节点 C" },
      ],
      links: [
        { source: "主节点", target: "节点 A" },
        { source: "主节点", target: "节点 B" },
        { source: "主节点", target: "节点 C" },
      ],
    },
  ],
};

export const linechartSetup: SimpleSetup<ChartData> = (args, named) =>
  buildChartData(args, named, DEFAULT_LINE_OPTION);

export const areachartSetup: SimpleSetup<ChartData> = (args, named) =>
  buildChartData(args, named, DEFAULT_AREA_OPTION);

export const barchartSetup: SimpleSetup<ChartData> = (args, named) =>
  buildChartData(args, named, DEFAULT_BAR_OPTION);

export const piechartSetup: SimpleSetup<ChartData> = (args, named) =>
  buildChartData(args, named, DEFAULT_PIE_OPTION);

export const scatterchartSetup: SimpleSetup<ChartData> = (args, named) =>
  buildChartData(args, named, DEFAULT_SCATTER_OPTION);

export const candlestickchartSetup: SimpleSetup<ChartData> = (args, named) =>
  buildChartData(args, named, DEFAULT_CANDLE_OPTION);

export const radarchartSetup: SimpleSetup<ChartData> = (args, named) =>
  buildChartData(args, named, DEFAULT_RADAR_OPTION);

export const graphchartSetup: SimpleSetup<ChartData> = (args, named) =>
  buildChartData(args, named, DEFAULT_GRAPH_OPTION);

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

export interface ResultData {
  readonly title: string;
  readonly subTitle: string;
  readonly icon: string;
}

export const resultSetup: SimpleSetup<ResultData> = (args, named) => ({
  title: (named.title as string) ?? (args[0] as string) ?? "",
  subTitle: (named.subtitle as string) ?? (args[1] as string) ?? "",
  icon: (named.type as string) ?? (args[2] as string) ?? "success",
});

// ---------------------------------------------------------------------------
// Rate
// ---------------------------------------------------------------------------

export interface RateData {
  readonly value: number;
  readonly max: number;
  readonly disabled: boolean;
  readonly allowHalf: boolean;
}

export const rateSetup: SimpleSetup<RateData> = (args, named) => ({
  value: (named.value as number) ?? (args[0] as number) ?? 0,
  max: (named.max as number) ?? 5,
  disabled: (named.disabled as boolean) ?? true,
  allowHalf: (named.allowHalf as boolean) ?? true,
});

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

export interface CardData {
  readonly title: string;
  readonly content: string;
  readonly shadow: string;
}

export const cardSetup: SimpleSetup<CardData> = (args, named) => ({
  title: (named.title as string) ?? (args[0] as string) ?? "",
  content: (named.content as string) ?? (args[1] as string) ?? "",
  shadow: (named.shadow as string) ?? "hover",
});

// ---------------------------------------------------------------------------
// OrderCard（订单详情卡）
// ---------------------------------------------------------------------------

export interface OrderItem {
  readonly name: string;
  readonly quantity: number;
  readonly price: number;
}

export interface OrderCardData {
  readonly orderId: string;
  readonly status: string;
  readonly amount: number;
  readonly orderTime: string;
  readonly items: readonly OrderItem[];
  readonly address: string;
}

function parseOrderItem(raw: unknown): OrderItem {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    return {
      name: String(o.name ?? o.商品名 ?? ""),
      quantity: Number(o.quantity ?? o.数量 ?? 1),
      price: Number(o.price ?? o.单价 ?? 0),
    };
  }
  return { name: String(raw), quantity: 1, price: 0 };
}

export const orderCardSetup: SimpleSetup<OrderCardData> = (args, named) => {
  const first = args[0];
  let orderId = (named.订单号 as string) ?? (named.orderId as string) ?? "";
  let status = (named.状态 as string) ?? (named.status as string) ?? "";
  let amount = (named.金额 as number) ?? (named.amount as number) ?? 0;
  let orderTime = (named.下单时间 as string) ?? (named.orderTime as string) ?? "";
  let items: OrderItem[] = [];
  let address = (named.收货地址 as string) ?? (named.address as string) ?? "";

  if (first && typeof first === "object" && !Array.isArray(first)) {
    const obj = first as Record<string, unknown>;
    orderId = String(obj.订单号 ?? obj.orderId ?? orderId);
    status = String(obj.状态 ?? obj.status ?? status);
    amount = Number(obj.金额 ?? obj.amount ?? amount);
    orderTime = String(obj.下单时间 ?? obj.orderTime ?? orderTime);
    address = String(obj.收货地址 ?? obj.address ?? address);
    const rawItems = obj.商品列表 ?? obj.items;
    if (Array.isArray(rawItems)) {
      items = rawItems.map(parseOrderItem);
    }
  }

  if (!items.length && (named.商品列表 || named.items)) {
    const raw = named.商品列表 ?? named.items;
    items = Array.isArray(raw) ? raw.map(parseOrderItem) : [];
  }

  return {
    orderId: orderId || "—",
    status: status || "—",
    amount,
    orderTime: orderTime || "—",
    items,
    address: address || "—",
  };
};

// ---------------------------------------------------------------------------
// Table (Advanced Setup)
// ---------------------------------------------------------------------------

export interface RenderTableColumn {
  readonly name: string;
  readonly values: readonly unknown[];
}

export interface RenderTableData {
  readonly columns: readonly RenderTableColumn[];
}

function inferColumns(records: XArray): RenderTableData {
  const keySet = new Set<string>();
  const keyOrder: string[] = [];

  for (const record of records.elements) {
    if (record instanceof XObject) {
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
        record instanceof XObject ? record.get(key).unbox() : null,
      ),
    })),
  };
}

function resolveColumns(
  ctx: RenderableContext,
  records: XArray,
): RenderTableData {
  const columnArgs = ctx.args.slice(1);

  const columns: RenderTableColumn[] = columnArgs.map((arg) => {
    if (arg.type === "NamedArgument") {
      const values = records.elements.map((record) => {
        const childEnv = ctx.createChildEnv();
        if (record instanceof XObject) {
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
          record instanceof XObject ? record.get(arg.name).unbox() : null,
        ),
      };
    }

    throw new Error(
      "table column must be a field name or named argument (name = expression)",
    );
  });

  return { columns };
}

export const tableSetup: AdvancedSetup<RenderTableData> = {
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
    if (!(recordsVal instanceof XArray)) {
      throw new Error("table first argument must be an array");
    }

    if (ctx.args.length === 1) {
      return inferColumns(recordsVal);
    }

    return resolveColumns(ctx, recordsVal);
  },
};
