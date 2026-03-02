import {
  createApp,
  defineComponent as vueDefineComponent,
  h,
  reactive,
} from "vue";
import { ElRadioGroup, ElRadio } from "element-plus";
import "element-plus/es/components/radio/style/css";
import "element-plus/es/components/radio-group/style/css";
import { defineComponent } from "@x-lang/core";
import type { SkeletonContext } from "@x-lang/core";
import { renderSkeleton, ElSkeletonItem } from "./_skeleton-helper";

interface RadioData {
  readonly options: readonly string[];
  readonly selected: string;
}

const RADIO_ARG_RE = /^radio\s*\(\s*([^,)]+)/;

function inferSkeletonOptions(ctx: SkeletonContext): string[] {
  const match = RADIO_ARG_RE.exec(ctx.content.trim());
  if (!match) return ["", "", ""];

  const varName = match[1]!.trim();
  const data = ctx.variables[varName];

  if (Array.isArray(data) && data.length > 0) {
    return data.map((item) => String(item));
  }

  return ["", "", ""];
}

export const radio = defineComponent<RadioData>("radio", {
  skeleton(container, ctx) {
    const options = inferSkeletonOptions(ctx);
    return renderSkeleton(container, () =>
      h("div", { style: { display: "flex", gap: "20px", padding: "8px 0" } },
        options.map((opt) =>
          h("div", { style: { display: "flex", alignItems: "center", gap: "6px" } }, [
            h(ElSkeletonItem, { variant: "circle", style: { width: "16px", height: "16px" } }),
            opt
              ? h("span", { style: { fontSize: "14px", color: "#909399" } }, opt)
              : h(ElSkeletonItem, { variant: "text", style: { width: "48px" } }),
          ]),
        ),
      ),
    );
  },

  setup: (args) => ({
    options: args[0] as string[],
    selected: (args[1] as string) ?? "",
  }),

  render(data, container, ctx) {
    const state = reactive({ selected: data.selected });

    const RadioWrapper = vueDefineComponent({
      setup() {
        return () =>
          h(
            ElRadioGroup,
            {
              modelValue: state.selected,
              "onUpdate:modelValue": (val: string | number | boolean | undefined) => {
                const strVal = String(val ?? "");
                state.selected = strVal;
                ctx.emit("change", strVal);
              },
            },
            () =>
              data.options.map((opt) =>
                h(ElRadio, { value: opt }, () => opt),
              ),
          );
      },
    });

    const mountEl = document.createElement("div");
    mountEl.style.padding = "8px 0";
    container.appendChild(mountEl);
    const vueApp = createApp(RadioWrapper);
    vueApp.mount(mountEl);

    return {
      dispose() {
        vueApp.unmount();
        mountEl.remove();
      },
      update(newData: RadioData) {
        state.selected = newData.selected;
      },
    };
  },
});
