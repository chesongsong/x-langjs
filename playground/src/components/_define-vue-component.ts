import { createApp, reactive, type Component } from "vue";
import { defineComponent } from "@x-lang/core";
import type {
  ComponentDefinition,
  ComponentOptions,
  SkeletonContext,
} from "@x-lang/core";
import type { RenderContext } from "@x-lang/render";

export const XLANG_CTX_KEY = "xlang-ctx";

interface VueComponentOptions<T extends object> {
  setup: ComponentOptions<T>["setup"];
  component: Component;
  skeleton?: Component;
}

export function defineVueComponent<T extends object>(
  name: string,
  options: VueComponentOptions<T>,
): ComponentDefinition<T> {
  return defineComponent<T>(name, {
    setup: options.setup,

    render(data: T, container: HTMLElement, ctx: RenderContext) {
      const state = reactive({ ...data }) as T;
      const mountEl = document.createElement("div");
      container.appendChild(mountEl);

      const vueApp = createApp(options.component, state as Record<string, unknown>);
      vueApp.provide(XLANG_CTX_KEY, ctx);
      vueApp.mount(mountEl);

      return {
        dispose() {
          vueApp.unmount();
          mountEl.remove();
        },
        update(newData: T) {
          Object.assign(state, newData);
        },
      };
    },

    skeleton: options.skeleton
      ? (container: HTMLElement, ctx: SkeletonContext) => {
          const mountEl = document.createElement("div");
          container.appendChild(mountEl);

          const vueApp = createApp(options.skeleton!, {
            content: ctx.content,
            variables: ctx.variables,
          });
          vueApp.mount(mountEl);

          return {
            dispose() {
              vueApp.unmount();
              mountEl.remove();
            },
          };
        }
      : undefined,
  } as ComponentOptions<T>);
}
