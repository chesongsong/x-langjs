import { createApp, defineComponent as vueDefineComponent, h } from "vue";
import { ElDescriptions, ElDescriptionsItem } from "element-plus";
import "element-plus/es/components/descriptions/style/css";
import "element-plus/es/components/descriptions-item/style/css";
import { defineComponent, ZObject } from "@x-lang/core";
import type { SkeletonContext } from "@x-lang/core";
import { renderSkeleton, ElSkeletonItem } from "./_skeleton-helper";

interface DescItem {
  readonly label: string;
  readonly value: string;
}

interface DescriptionsData {
  readonly title: string;
  readonly items: readonly DescItem[];
  readonly column: number;
  readonly border: boolean;
}

const DESC_ARG_RE = /^descriptions\s*\(\s*([^,)]+)/;

function inferItemCount(ctx: SkeletonContext): number {
  const match = DESC_ARG_RE.exec(ctx.content.trim());
  if (!match) return 4;
  const varName = match[1]!.trim();
  const data = ctx.variables[varName];
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return Object.keys(data as Record<string, unknown>).length;
  }
  return 4;
}

export const descriptions = defineComponent<DescriptionsData>("descriptions", {
  skeleton(container, ctx) {
    const count = inferItemCount(ctx);
    return renderSkeleton(container, () =>
      h("div", {
        style: {
          border: "1px solid #ebeef5",
          borderRadius: "4px",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        },
      }, Array.from({ length: count }, () =>
        h("div", { style: { display: "flex", gap: "16px", alignItems: "center" } }, [
          h(ElSkeletonItem, { variant: "text", style: { width: "60px" } }),
          h(ElSkeletonItem, { variant: "text", style: { width: `${80 + Math.random() * 80}px` } }),
        ]),
      )),
    );
  },

  setup: (args, named) => {
    const source = args[0];
    const items: DescItem[] = [];

    if (source instanceof ZObject) {
      for (const [key, val] of Object.entries(source.entries)) {
        items.push({ label: key, value: val.toString() });
      }
    } else if (source && typeof source === "object" && !Array.isArray(source)) {
      for (const [key, val] of Object.entries(source as Record<string, unknown>)) {
        items.push({ label: key, value: String(val) });
      }
    }

    return {
      title: (named.title as string) ?? "",
      items,
      column: (named.column as number) ?? 2,
      border: (named.border as boolean) ?? true,
    };
  },

  render(data, container) {
    const DescWrapper = vueDefineComponent({
      setup() {
        return () =>
          h(
            ElDescriptions,
            {
              title: data.title || undefined,
              column: data.column,
              border: data.border,
            },
            () =>
              data.items.map((item) =>
                h(ElDescriptionsItem, { label: item.label }, () => item.value),
              ),
          );
      },
    });

    const mountEl = document.createElement("div");
    mountEl.style.padding = "4px 0";
    container.appendChild(mountEl);
    const app = createApp(DescWrapper);
    app.mount(mountEl);

    return {
      dispose() {
        app.unmount();
        mountEl.remove();
      },
    };
  },
});
