import { defineVueComponent } from "../_define-vue-component";
import TlinkView from "./TlinkView.vue";
import TlinkSkeleton from "./TlinkSkeleton.vue";

interface TlinkData {
  readonly text: string;
  readonly url: string;
}

export const tlink = defineVueComponent<TlinkData>("tlink", {
  setup: (args) => ({
    text: args[0] as string,
    url: args[1] as string,
  }),
  component: TlinkView,
  skeleton: TlinkSkeleton,
});
