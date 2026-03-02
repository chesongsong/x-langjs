import { defineVueComponent } from "../_define-vue-component";
import RadioView from "./RadioView.vue";
import RadioSkeleton from "./RadioSkeleton.vue";

interface RadioData {
  readonly options: readonly string[];
  readonly selected: string;
}

export const radio = defineVueComponent<RadioData>("radio", {
  setup: (args) => ({
    options: args[0] as string[],
    selected: (args[1] as string) ?? "",
  }),
  component: RadioView,
  skeleton: RadioSkeleton,
});
