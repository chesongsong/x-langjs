import { createApp, defineComponent as vueDefineComponent, h } from "vue";
import { ElResult } from "element-plus";
import "element-plus/es/components/result/style/css";
import { defineComponent } from "@x-lang/core";
import { renderSkeleton, ElSkeletonItem } from "./_skeleton-helper";

interface ResultData {
  readonly title: string;
  readonly subTitle: string;
  readonly icon: string;
}

export const result = defineComponent<ResultData>("result", {
  skeleton(container, _ctx) {
    return renderSkeleton(container, () =>
      h("div", {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 0",
          gap: "14px",
        },
      }, [
        h(ElSkeletonItem, { variant: "circle", style: { width: "48px", height: "48px" } }),
        h(ElSkeletonItem, { variant: "h3", style: { width: "120px" } }),
        h(ElSkeletonItem, { variant: "text", style: { width: "200px" } }),
      ]),
    );
  },

  setup: (args, named) => ({
    title: (named.title as string) ?? (args[0] as string) ?? "",
    subTitle: (named.subtitle as string) ?? (args[1] as string) ?? "",
    icon: (named.type as string) ?? (args[2] as string) ?? "success",
  }),

  render(data, container) {
    const ResultWrapper = vueDefineComponent({
      setup() {
        return () =>
          h(ElResult, {
            title: data.title,
            subTitle: data.subTitle || undefined,
            icon: data.icon as "success" | "warning" | "info" | "error",
          });
      },
    });

    const mountEl = document.createElement("div");
    container.appendChild(mountEl);
    const app = createApp(ResultWrapper);
    app.mount(mountEl);

    return {
      dispose() {
        app.unmount();
        mountEl.remove();
      },
    };
  },
});
