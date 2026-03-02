import { createApp, defineComponent as vueDefineComponent, h } from "vue";
import { ElRate } from "element-plus";
import "element-plus/es/components/rate/style/css";
import { defineComponent } from "@x-lang/core";
import { renderSkeleton, ElSkeletonItem } from "./_skeleton-helper";

interface RateData {
  readonly value: number;
  readonly max: number;
  readonly disabled: boolean;
  readonly allowHalf: boolean;
}

export const rate = defineComponent<RateData>("rate", {
  skeleton(container, _ctx) {
    return renderSkeleton(container, () =>
      h("div", { style: { display: "flex", gap: "6px", padding: "6px 0" } },
        Array.from({ length: 5 }, () =>
          h(ElSkeletonItem, { variant: "circle", style: { width: "20px", height: "20px" } }),
        ),
      ),
    );
  },

  setup: (args, named) => ({
    value: (named.value as number) ?? (args[0] as number) ?? 0,
    max: (named.max as number) ?? 5,
    disabled: (named.disabled as boolean) ?? true,
    allowHalf: (named.allowHalf as boolean) ?? true,
  }),

  render(data, container) {
    const RateWrapper = vueDefineComponent({
      setup() {
        return () =>
          h(ElRate, {
            modelValue: data.value,
            max: data.max,
            disabled: data.disabled,
            allowHalf: data.allowHalf,
          });
      },
    });

    const mountEl = document.createElement("div");
    mountEl.style.padding = "6px 0";
    container.appendChild(mountEl);
    const app = createApp(RateWrapper);
    app.mount(mountEl);

    return {
      dispose() {
        app.unmount();
        mountEl.remove();
      },
    };
  },
});
