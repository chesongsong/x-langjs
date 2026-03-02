import type { SimpleSetup, AdvancedSetup, RenderableContext } from "@x-lang/core";
import { ZArray, ZObject } from "@x-lang/core";

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

  if (source instanceof ZObject) {
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
    if (!(recordsVal instanceof ZArray)) {
      throw new Error("table first argument must be an array");
    }

    if (ctx.args.length === 1) {
      return inferColumns(recordsVal);
    }

    return resolveColumns(ctx, recordsVal);
  },
};
