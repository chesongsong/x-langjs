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
    const wrapper = document.createElement("div");
    wrapper.className = "skeleton-radio";
    wrapper.style.display = "flex";
    wrapper.style.gap = "16px";
    wrapper.style.padding = "8px 0";

    for (let i = 0; i < options.length; i++) {
      const item = document.createElement("div");
      item.style.display = "flex";
      item.style.alignItems = "center";
      item.style.gap = "6px";

      const circle = document.createElement("div");
      circle.className = "skeleton-line";
      circle.style.width = "16px";
      circle.style.height = "16px";
      circle.style.borderRadius = "50%";
      circle.style.flexShrink = "0";
      circle.style.animationDelay = `${i * 0.1}s`;
      item.appendChild(circle);

      if (options[i]) {
        const label = document.createElement("span");
        label.className = "skeleton-table-label";
        label.textContent = options[i]!;
        item.appendChild(label);
      } else {
        const label = document.createElement("div");
        label.className = "skeleton-line";
        label.style.width = `${40 + Math.random() * 30}px`;
        label.style.height = "14px";
        label.style.animationDelay = `${i * 0.1}s`;
        item.appendChild(label);
      }

      wrapper.appendChild(item);
    }

    container.appendChild(wrapper);
    return { dispose: () => wrapper.remove() };
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
