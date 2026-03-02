import { defineVueComponent } from "../_define-vue-component";
import TagView from "./TagView.vue";
import TagSkeleton from "./TagSkeleton.vue";

interface TagData {
  readonly items: readonly { text: string; type: string }[];
}

export const tag = defineVueComponent<TagData>("tag", {
  setup: (args, named) => {
    const type = (named.type as string) ?? "";
    const items: { text: string; type: string }[] = [];

    for (const arg of args) {
      if (typeof arg === "string") {
        items.push({ text: arg, type });
      } else if (Array.isArray(arg)) {
        for (const item of arg) {
          items.push({ text: String(item), type });
        }
      }
    }

    if (items.length === 0) {
      items.push({ text: "tag", type });
    }

    return { items };
  },
  component: TagView,
  skeleton: TagSkeleton,
});
