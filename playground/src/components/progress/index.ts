import { defineVueComponent } from "../_define-vue-component";
import ProgressView from "./ProgressView.vue";
import ProgressSkeleton from "./ProgressSkeleton.vue";

interface ProgressData {
  readonly percentage: number;
  readonly status: string;
  readonly strokeWidth: number;
  readonly textInside: boolean;
}

export const progress = defineVueComponent<ProgressData>("progress", {
  setup: (args, named) => ({
    percentage: (named.value as number) ?? (args[0] as number) ?? 0,
    status: (named.status as string) ?? "",
    strokeWidth: (named.strokeWidth as number) ?? 20,
    textInside: (named.textInside as boolean) ?? true,
  }),
  component: ProgressView,
  skeleton: ProgressSkeleton,
});
