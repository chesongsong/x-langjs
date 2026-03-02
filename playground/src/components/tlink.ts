import { defineComponent } from "@x-lang/core";
import type { SkeletonContext } from "@x-lang/core";
import { renderSkeleton, ElSkeletonItem, h } from "./_skeleton-helper";

interface TlinkData {
  readonly text: string;
  readonly url: string;
}

const TEXT_RE = /["']([^"']+)["']/;

function inferWidth(ctx: SkeletonContext): number {
  const match = TEXT_RE.exec(ctx.content);
  if (match?.[1]) return Math.max(60, match[1].length * 12 + 16);
  return 120;
}

export const tlink = defineComponent<TlinkData>("tlink", {
  skeleton(container, ctx) {
    const w = inferWidth(ctx);
    return renderSkeleton(container, () =>
      h(ElSkeletonItem, { variant: "text", style: { width: `${w}px` } }),
    );
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
