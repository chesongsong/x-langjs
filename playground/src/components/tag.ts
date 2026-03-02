import { createApp, defineComponent as vueDefineComponent, h } from "vue";
import { ElTag } from "element-plus";
import "element-plus/es/components/tag/style/css";
import { defineComponent } from "@x-lang/core";
import type { SkeletonContext } from "@x-lang/core";
import { renderSkeleton, ElSkeletonItem } from "./_skeleton-helper";

interface TagData {
  readonly items: readonly { text: string; type: string }[];
}

const TAG_ARGS_RE = /tag\s*\(([^)]*)\)/;

function inferCount(ctx: SkeletonContext): number {
  const match = TAG_ARGS_RE.exec(ctx.content);
  if (!match) return 1;
  const inner = match[1] ?? "";
  return Math.max(1, Math.min(inner.split(",").filter((s) => s.trim()).length, 6));
}

export const tag = defineComponent<TagData>("tag", {
  skeleton(container, ctx) {
    const count = inferCount(ctx);
    return renderSkeleton(container, () =>
      h("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap", padding: "4px 0" } },
        Array.from({ length: count }, () =>
          h(ElSkeletonItem, { variant: "button", style: { width: "56px", height: "24px" } }),
        ),
      ),
    );
  },

  setup: (args, named) => {
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
  },

  render(data, container) {
    const TagWrapper = vueDefineComponent({
      setup() {
        return () =>
          h(
            "div",
            { style: { display: "flex", gap: "8px", flexWrap: "wrap", padding: "4px 0" } },
            data.items.map((item) =>
              h(
                ElTag,
                {
                  type: (item.type || undefined) as "success" | "info" | "warning" | "danger" | undefined,
                  effect: "light",
                },
                () => item.text,
              ),
            ),
          );
      },
    });

    const mountEl = document.createElement("div");
    container.appendChild(mountEl);
    const app = createApp(TagWrapper);
    app.mount(mountEl);

    return {
      dispose() {
        app.unmount();
        mountEl.remove();
      },
    };
  },
});
