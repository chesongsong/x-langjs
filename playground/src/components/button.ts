import { createApp, defineComponent as vueDefineComponent, h } from "vue";
import { ElButton } from "element-plus";
import "element-plus/es/components/button/style/css";
import { defineComponent } from "@x-lang/core";
import type { SkeletonContext } from "@x-lang/core";
import { renderSkeleton, ElSkeletonItem } from "./_skeleton-helper";

interface ButtonData {
  readonly text: string;
  readonly type: string;
  readonly size: string;
  readonly onClick?: string;
}

export const button = defineComponent<ButtonData>("button", {
  skeleton(container, _ctx) {
    return renderSkeleton(container, () =>
      h("div", { style: { padding: "4px 0" } }, [
        h(ElSkeletonItem, { variant: "button", style: { width: "80px", height: "32px" } }),
      ]),
    );
  },

  setup: (args, named) => ({
    text: (named.text as string) ?? (args[0] as string) ?? "Button",
    type: (named.type as string) ?? (args[1] as string) ?? "primary",
    size: (named.size as string) ?? (args[2] as string) ?? "default",
    onClick: (named.onClick as string) ?? (args[3] as string),
  }),

  render(data, container) {
    const ButtonWrapper = vueDefineComponent({
      setup() {
        const handleClick = () => {
          if (data.onClick) {
            alert(data.onClick);
          }
        };

        return () =>
          h(
            ElButton,
            {
              type: data.type ?? "primary",
              size: data.size ?? "default",
              onClick: handleClick,
            },
            () => data.text,
          );
      },
    });

    const mountEl = document.createElement("div");
    mountEl.style.padding = "4px 0";
    container.appendChild(mountEl);
    const app = createApp(ButtonWrapper);
    app.mount(mountEl);

    return {
      dispose() {
        app.unmount();
        mountEl.remove();
      },
    };
  },
});
