import { createApp, defineComponent as vueDefineComponent, h } from "vue";
import { ElButton } from "element-plus";
import "element-plus/es/components/button/style/css";
import { defineComponent } from "@x-lang/core";
import type { SkeletonContext } from "@x-lang/core";

interface ButtonData {
  readonly text: string;
  readonly type: string;
  readonly size: string;
  readonly onClick?: string;
}

const TEXT_RE = /["']([^"']+)["']/;

function inferSkeletonWidth(ctx: SkeletonContext): number {
  const match = TEXT_RE.exec(ctx.content);
  if (match?.[1]) {
    return Math.max(60, match[1].length * 14 + 24);
  }
  return 80;
}

export const button = defineComponent<ButtonData>("button", {
  skeleton(container, ctx) {
    const width = inferSkeletonWidth(ctx);
    const wrapper = document.createElement("div");
    wrapper.style.padding = "4px 0";

    const btn = document.createElement("div");
    btn.className = "skeleton-line";
    btn.style.width = `${width}px`;
    btn.style.height = "32px";
    btn.style.borderRadius = "4px";

    wrapper.appendChild(btn);
    container.appendChild(wrapper);
    return { dispose: () => wrapper.remove() };
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
