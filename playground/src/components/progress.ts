import { createApp, defineComponent as vueDefineComponent, h } from "vue";
import { ElProgress } from "element-plus";
import "element-plus/es/components/progress/style/css";
import { defineComponent } from "@x-lang/core";
import { renderSkeleton, ElSkeletonItem } from "./_skeleton-helper";

interface ProgressData {
  readonly percentage: number;
  readonly status: string;
  readonly strokeWidth: number;
  readonly textInside: boolean;
}

export const progress = defineComponent<ProgressData>("progress", {
  skeleton(container, _ctx) {
    return renderSkeleton(container, () =>
      h("div", { style: { padding: "6px 0" } }, [
        h(ElSkeletonItem, {
          variant: "rect",
          style: { width: "100%", height: "20px", borderRadius: "100px" },
        }),
      ]),
    );
  },

  setup: (args, named) => ({
    percentage: (named.value as number) ?? (args[0] as number) ?? 0,
    status: (named.status as string) ?? "",
    strokeWidth: (named.strokeWidth as number) ?? 20,
    textInside: (named.textInside as boolean) ?? true,
  }),

  render(data, container) {
    const ProgressWrapper = vueDefineComponent({
      setup() {
        return () =>
          h(ElProgress, {
            percentage: data.percentage,
            status: data.status || undefined,
            strokeWidth: data.strokeWidth,
            textInside: data.textInside,
          });
      },
    });

    const mountEl = document.createElement("div");
    mountEl.style.padding = "6px 0";
    container.appendChild(mountEl);
    const app = createApp(ProgressWrapper);
    app.mount(mountEl);

    return {
      dispose() {
        app.unmount();
        mountEl.remove();
      },
    };
  },
});
