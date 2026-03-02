import { createApp, defineComponent as vueDefineComponent, h } from "vue";
import { ElAlert } from "element-plus";
import "element-plus/es/components/alert/style/css";
import { defineComponent } from "@x-lang/core";
import type { SkeletonContext } from "@x-lang/core";
import { renderSkeleton, ElSkeletonItem } from "./_skeleton-helper";

interface AlertData {
  readonly title: string;
  readonly description: string;
  readonly type: string;
  readonly closable: boolean;
}

export const alert = defineComponent<AlertData>("alert", {
  skeleton(container, ctx) {
    const hasDesc = ctx.content.includes("description");
    return renderSkeleton(container, () =>
      h("div", {
        style: {
          border: "1px solid #e4e7ed",
          borderRadius: "4px",
          padding: "12px 16px",
          background: "#f4f4f5",
        },
      }, [
        h(ElSkeletonItem, { variant: "h3", style: { width: "30%" } }),
        ...(hasDesc
          ? [h(ElSkeletonItem, { variant: "text", style: { width: "80%", marginTop: "8px" } })]
          : []),
      ]),
    );
  },

  setup: (args, named) => {
    const firstText = typeof args[0] === "string" ? args[0] : "";
    return {
      title: (named.title as string) ?? firstText,
      description: (named.description as string) ?? "",
      type: (named.type as string) ?? "info",
      closable: (named.closable as boolean) ?? false,
    };
  },

  render(data, container) {
    const AlertWrapper = vueDefineComponent({
      setup() {
        return () =>
          h(ElAlert, {
            title: data.title,
            description: data.description || undefined,
            type: data.type as "success" | "warning" | "info" | "error",
            closable: data.closable,
            showIcon: true,
          });
      },
    });

    const mountEl = document.createElement("div");
    mountEl.style.margin = "4px 0";
    container.appendChild(mountEl);
    const app = createApp(AlertWrapper);
    app.mount(mountEl);

    return {
      dispose() {
        app.unmount();
        mountEl.remove();
      },
    };
  },
});
