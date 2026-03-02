import { defineComponent } from "@x-lang/core";
import type { SkeletonContext } from "@x-lang/core";

interface TlinkData {
  readonly text: string;
  readonly url: string;
}

const TEXT_RE = /["']([^"']+)["']/;

function inferSkeletonWidth(ctx: SkeletonContext): number {
  const match = TEXT_RE.exec(ctx.content);
  if (match?.[1]) {
    return Math.max(60, match[1].length * 12 + 16);
  }
  return 100 + Math.random() * 60;
}

export const tlink = defineComponent<TlinkData>("tlink", {
  skeleton(container, ctx) {
    const width = inferSkeletonWidth(ctx);
    const line = document.createElement("div");
    line.className = "skeleton-line";
    line.style.width = `${width}px`;
    line.style.height = "14px";
    line.style.borderRadius = "2px";

    container.appendChild(line);
    return { dispose: () => line.remove() };
  },

  setup: (args) => ({
    text: args[0] as string,
    url: args[1] as string,
  }),

  render(data, container) {
    const link = document.createElement("a");
    link.href = data.url;
    link.textContent = data.text;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "xlang-tlink";
    container.appendChild(link);

    return { dispose: () => link.remove() };
  },
});
