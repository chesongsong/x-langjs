import { defineVueComponent } from "../_define-vue-component";
import ButtonView from "./ButtonView.vue";
import ButtonSkeleton from "./ButtonSkeleton.vue";

interface ButtonData {
  readonly text: string;
  readonly type: string;
  readonly size: string;
  readonly onClick?: string;
}

export const button = defineVueComponent<ButtonData>("button", {
  setup: (args, named) => ({
    text: (named.text as string) ?? (args[0] as string) ?? "Button",
    type: (named.type as string) ?? (args[1] as string) ?? "primary",
    size: (named.size as string) ?? (args[2] as string) ?? "default",
    onClick: (named.onClick as string) ?? (args[3] as string),
  }),
  component: ButtonView,
  skeleton: ButtonSkeleton,
});
