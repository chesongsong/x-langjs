import { defineVueComponent } from "../_define-vue-component";
import ResultView from "./ResultView.vue";
import ResultSkeleton from "./ResultSkeleton.vue";

interface ResultData {
  readonly title: string;
  readonly subTitle: string;
  readonly icon: string;
}

export const result = defineVueComponent<ResultData>("result", {
  setup: (args, named) => ({
    title: (named.title as string) ?? (args[0] as string) ?? "",
    subTitle: (named.subtitle as string) ?? (args[1] as string) ?? "",
    icon: (named.type as string) ?? (args[2] as string) ?? "success",
  }),
  component: ResultView,
  skeleton: ResultSkeleton,
});
