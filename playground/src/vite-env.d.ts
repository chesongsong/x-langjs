/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module "monaco-editor/esm/vs/editor/editor.worker?worker" {
  const WorkerFactory: new () => Worker;
  export default WorkerFactory;
}
