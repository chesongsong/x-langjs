import { defineVueComponent } from "../_define-vue-component";
import { ZObject } from "@x-lang/core";
import DescriptionsView from "./DescriptionsView.vue";
import DescriptionsSkeleton from "./DescriptionsSkeleton.vue";

interface DescItem {
  readonly label: string;
  readonly value: string;
}

interface DescriptionsData {
  readonly title: string;
  readonly items: readonly DescItem[];
  readonly column: number;
  readonly border: boolean;
}

export const descriptions = defineVueComponent<DescriptionsData>("descriptions", {
  setup: (args, named) => {
    const source = args[0];
    const items: DescItem[] = [];

    if (source instanceof ZObject) {
      for (const [key, val] of Object.entries(source.entries)) {
        items.push({ label: key, value: val.toString() });
      }
    } else if (source && typeof source === "object" && !Array.isArray(source)) {
      for (const [key, val] of Object.entries(source as Record<string, unknown>)) {
        items.push({ label: key, value: String(val) });
      }
    }

    return {
      title: (named.title as string) ?? "",
      items,
      column: (named.column as number) ?? 2,
      border: (named.border as boolean) ?? true,
    };
  },
  component: DescriptionsView,
  skeleton: DescriptionsSkeleton,
});
