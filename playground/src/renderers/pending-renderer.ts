import { createApp, h } from "vue";
import { ElSkeleton } from "element-plus";
import "element-plus/es/components/skeleton/style/css";
import type { ComponentRenderer, Disposable, PendingData } from "@x-lang/render";

export class PendingRenderer implements ComponentRenderer<PendingData> {
  render(_data: PendingData, container: HTMLElement): Disposable {
    const Wrapper = {
      render() {
        return h(ElSkeleton, { rows: 2, animated: true });
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
}
