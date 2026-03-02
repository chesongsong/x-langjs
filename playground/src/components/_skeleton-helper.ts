import { createApp, h, type VNode } from "vue";
import { ElSkeleton, ElSkeletonItem } from "element-plus";
import "element-plus/es/components/skeleton/style/css";
import "element-plus/es/components/skeleton-item/style/css";
import type { Disposable } from "@x-lang/core";

export { h, ElSkeletonItem };

export function renderSkeleton(
  container: HTMLElement,
  templateFn: () => VNode | VNode[],
): Disposable {
  const Wrapper = {
    render() {
      return h(
        ElSkeleton,
        { animated: true, loading: true },
        { template: templateFn },
      );
    },
  };

  const mountEl = document.createElement("div");
  container.appendChild(mountEl);
  const app = createApp(Wrapper);
  app.mount(mountEl);

  return {
    dispose() {
      app.unmount();
      mountEl.remove();
    },
  };
}
