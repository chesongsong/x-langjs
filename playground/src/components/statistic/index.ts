import { defineVueComponent } from "../_define-vue-component";
import StatisticView from "./StatisticView.vue";
import StatisticSkeleton from "./StatisticSkeleton.vue";

interface StatisticData {
  readonly title: string;
  readonly value: number;
  readonly prefix: string;
  readonly suffix: string;
}

export const statistic = defineVueComponent<StatisticData>("statistic", {
  setup: (args, named) => ({
    title: (named.title as string) ?? (args[0] as string) ?? "",
    value: (named.value as number) ?? (args[1] as number) ?? 0,
    prefix: (named.prefix as string) ?? "",
    suffix: (named.suffix as string) ?? "",
  }),
  component: StatisticView,
  skeleton: StatisticSkeleton,
});
