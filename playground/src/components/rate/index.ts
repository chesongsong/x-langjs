import { defineVueComponent } from "../_define-vue-component";
import RateView from "./RateView.vue";
import RateSkeleton from "./RateSkeleton.vue";

interface RateData {
  readonly value: number;
  readonly max: number;
  readonly disabled: boolean;
  readonly allowHalf: boolean;
}

export const rate = defineVueComponent<RateData>("rate", {
  setup: (args, named) => ({
    value: (named.value as number) ?? (args[0] as number) ?? 0,
    max: (named.max as number) ?? 5,
    disabled: (named.disabled as boolean) ?? true,
    allowHalf: (named.allowHalf as boolean) ?? true,
  }),
  component: RateView,
  skeleton: RateSkeleton,
});
