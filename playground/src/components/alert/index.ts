import { defineVueComponent } from "../_define-vue-component";
import AlertView from "./AlertView.vue";
import AlertSkeleton from "./AlertSkeleton.vue";

interface AlertData {
  readonly title: string;
  readonly description: string;
  readonly type: string;
  readonly closable: boolean;
}

export const alert = defineVueComponent<AlertData>("alert", {
  setup: (args, named) => {
    const firstText = typeof args[0] === "string" ? args[0] : "";
    return {
      title: (named.title as string) ?? firstText,
      description: (named.description as string) ?? "",
      type: (named.type as string) ?? "info",
      closable: (named.closable as boolean) ?? false,
    };
  },
  component: AlertView,
  skeleton: AlertSkeleton,
});
