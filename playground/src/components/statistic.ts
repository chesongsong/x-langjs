import { createApp, defineComponent as vueDefineComponent, h } from "vue";
import { ElStatistic } from "element-plus";
import "element-plus/es/components/statistic/style/css";
import { defineComponent } from "@x-lang/core";
import { renderSkeleton, ElSkeletonItem } from "./_skeleton-helper";

interface StatisticData {
  readonly title: string;
  readonly value: number;
  readonly prefix: string;
  readonly suffix: string;
}

export const statistic = defineComponent<StatisticData>("statistic", {
  skeleton(container, _ctx) {
    return renderSkeleton(container, () =>
      h("div", { style: { padding: "8px 0" } }, [
        h(ElSkeletonItem, { variant: "text", style: { width: "60px", marginBottom: "8px" } }),
        h(ElSkeletonItem, { variant: "h1", style: { width: "100px" } }),
      ]),
    );
  },

  setup: (args, named) => ({
    title: (named.title as string) ?? (args[0] as string) ?? "",
    value: (named.value as number) ?? (args[1] as number) ?? 0,
    prefix: (named.prefix as string) ?? "",
    suffix: (named.suffix as string) ?? "",
  }),

  render(data, container) {
    const StatWrapper = vueDefineComponent({
      setup() {
        return () =>
          h(ElStatistic, {
            title: data.title,
            value: data.value,
            prefix: data.prefix || undefined,
            suffix: data.suffix || undefined,
          });
      },
    });

    const mountEl = document.createElement("div");
    mountEl.style.padding = "8px 0";
    container.appendChild(mountEl);
    const app = createApp(StatWrapper);
    app.mount(mountEl);

    return {
      dispose() {
        app.unmount();
        mountEl.remove();
      },
    };
  },
});
