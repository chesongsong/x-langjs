import { XLangApp, defineComponent, type ComponentDefinition, type RenderContext } from "@x-langjs/core";
import { h, render as vueRender, reactive } from "vue";
import { createRoot } from "react-dom/client";
import React from "react";
import AntdButtonView from "./components/antd/ButtonView.vue";
import { ButtonView as ReactButtonView } from "./components/react/ButtonView";

// ─── DSL 源码 ─────────────────────────────────────────────────────────────
const DSL_SOURCE = `button("Click me")`;

// ─── 点击后右侧展示的源代码字符串 ──────────────────────────────────────────
const VUE_SOURCE = `// simple-demo.ts — Vue 实现
defineComponent("button", {
  setup: (args) => ({
    text: String(args[0] ?? "Button"),
    type: "primary",
    size: "default",
  }),
  render(data, container, ctx) {
    const state = reactive({ ...data });
    vueRender(h(AntdButtonView, state), container);
    // 点击事件冒泡到 container，通过 ctx.emit 传给 app.on() 监听
    container.addEventListener("click", () => ctx.emit("click"));
  },
});`;

const REACT_SOURCE = `// components/react/ButtonView.tsx
export function ButtonView({ text, type = "primary" }: ButtonViewProps) {
  const styleMap = {
    primary: { background: "#1677ff", color: "#fff", border: "none" },
    default: { background: "#fff", color: "#000", border: "1px solid #d9d9d9" },
    danger:  { background: "#ff4d4f", color: "#fff", border: "none" },
  };
  return (
    <div style={{ padding: "4px 0" }}>
      <button style={{ padding: "4px 16px", borderRadius: 6, ...styleMap[type] }}>
        {text}
      </button>
    </div>
  );
}

// simple-demo.ts — React 注册
defineComponent("button", {
  setup: (args) => ({ text: String(args[0] ?? "Button"), type: "primary" }),
  render(data, container, ctx) {
    const root = createRoot(container);
    root.render(React.createElement(ButtonView, data));
    container.addEventListener("click", () => ctx.emit("click"));
    return { dispose() { root.unmount(); } };
  },
});`;

// ─── 代码面板操作 ──────────────────────────────────────────────────────────
function showCode(title: string, code: string) {
  const panel   = document.getElementById("simple-code-panel")!;
  const titleEl = document.getElementById("simple-code-title")!;
  const codeEl  = document.getElementById("simple-code-content")!;
  titleEl.textContent = title;
  codeEl.textContent  = code;
  panel.style.display = "";
}

// ─── 共享：解析 DSL 参数 ─────────────────────────────────────────────────
const buttonSetup = (args: unknown[]) => ({
  text: String(args[0] ?? "Button"),
  type: "primary",
  size: "default",
});

// ─── 共享：为 container 绑定点击后向 x-lang 事件总线冒泡 ─────────────────
function withClickEmit(
  renderFn: (data: unknown, c: HTMLElement, ctx: RenderContext) => void,
) {
  return (data: unknown, c: HTMLElement, ctx: RenderContext): void => {
    renderFn(data, c, ctx);
    c.addEventListener("click", () => ctx.emit("click"));
  };
}

// ─── 工厂：创建带有一组组件的 XLangApp ────────────────────────────────────
function createApp(...components: ComponentDefinition[]): XLangApp {
  const app = new XLangApp();
  components.forEach(c => app.use(c));
  return app;
}

// ─── 初始化入口 ────────────────────────────────────────────────────────────
export function initSimpleDemo() {
  const vueOutput   = document.getElementById("simple-vue-output")!;
  const reactOutput = document.getElementById("simple-react-output")!;

  // 关闭按钮
  document.getElementById("simple-code-close")!.addEventListener("click", () => {
    document.getElementById("simple-code-panel")!.style.display = "none";
  });

  // Vue button 组件
  const vueButton = defineComponent("button", {
    setup: buttonSetup,
    render: withClickEmit((data, c) => {
      const d = data as { text: string; type: string; size: string };
      const state = reactive({ text: d.text, type: d.type, size: d.size });
      vueRender(h(AntdButtonView, state), c);
    }),
  });

  // React button 组件（有副作用需返回 dispose，单独实现）
  const reactButton = defineComponent("button", {
    setup: buttonSetup,
    render(data, c, ctx) {
      const root = createRoot(c);
      const props = data as { text: string; type?: string };
      root.render(React.createElement(ReactButtonView, props));
      c.addEventListener("click", () => ctx.emit("click"));
      return { dispose() { root.unmount(); } };
    },
  });

  const vueApp   = createApp(vueButton);
  const reactApp = createApp(reactButton);

  // 点击按钮 → 右侧显示对应源代码
  vueApp.on("button",   "click", () => showCode("Vue 实现（simple-demo.ts）",           VUE_SOURCE));
  reactApp.on("button", "click", () => showCode("React 实现（ButtonView.tsx）", REACT_SOURCE));

  vueApp.run(`\`\`\`x-langjs\n${DSL_SOURCE}\n\`\`\``,   vueOutput);
  reactApp.run(`\`\`\`x-langjs\n${DSL_SOURCE}\n\`\`\``, reactOutput);
}
