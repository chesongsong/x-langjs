# x-langjs

[English](README.md)

基于 ANTLR4 + TypeScript 的 DSL 运行时，在 Markdown 中执行 `x-langjs` 代码块，并通过可插拔的 UI 层渲染输出。

**完全自定义渲染** — 运行时不依赖任何 UI 组件库。你可以自行注册组件（如 table、button、card 等），并用任意框架或库（Vue、React、Element Plus、Ant Design 或纯 HTML）实现其界面。核心只负责 DSL 执行与薄薄一层渲染约定，所有视觉效果由你完全掌控。

## 项目结构

```text
packages/
  types/        @x-langjs/types        AST 类型与错误定义
  parser/       @x-langjs/parser       词法/语法分析
  ast/          @x-langjs/ast          CST -> AST 与作用域解析
  interpreter/  @x-langjs/interpreter  执行器与运行时值域
  render/       @x-langjs/render       渲染接口与 RenderEngine
  core/         @x-langjs/core         对外 SDK 入口
playground/     @x-langjs/playground   Vite 演示项目
```

## 安装

```bash
npm install @x-langjs/core
# 或
pnpm add @x-langjs/core
```

## 能做什么？

### 1. 注册自定义 UI 组件，通过 DSL 驱动渲染

在 Markdown 代码块中写 `button("Click me")`，x-langjs 解析后调用你的 `setup` 提取参数，再调用你的 `render` 挂载 UI：

```ts
import { XLangApp, defineComponent } from "@x-langjs/core";

const app = new XLangApp();

app.use(defineComponent("button", {
  // 解析 DSL 参数，返回组件 props
  setup: (args) => ({ text: String(args[0] ?? "Button") }),

  // 将任意 UI 挂载到引擎提供的 container 中
  render(data, container) {
    const btn = document.createElement("button");
    btn.textContent = data.text;
    container.appendChild(btn);
    // 返回 dispose 用于清理（可选——引擎会自动移除 container）
    return { dispose: () => btn.remove() };
  },
}));

app.run(`
\`\`\`x-langjs
button("Click me")
\`\`\`
`, document.getElementById("root")!);
```

> 完整示例：[`playground/src/simple-demo.ts`](playground/src/simple-demo.ts)

---

### 2. 任意框架皆可——Vue 或 React，由你决定

`render` 函数接收原生 DOM `container`，如何挂载完全自由：

**Vue：**
```ts
import { h, render as vueRender, reactive } from "vue";
import MyButton from "./MyButton.vue";

defineComponent("button", {
  setup: (args) => ({ text: String(args[0] ?? "Button"), type: "primary" }),
  render(data, container) {
    const state = reactive({ ...data });
    vueRender(h(MyButton, state), container);
    // 无需返回值——引擎自动清理 container
  },
});
```

**React：**
```ts
import { createRoot } from "react-dom/client";
import { MyButton } from "./MyButton";

defineComponent("button", {
  setup: (args) => ({ text: String(args[0] ?? "Button") }),
  render(data, container) {
    const root = createRoot(container);
    root.render(<MyButton {...data} />);
    return { dispose() { root.unmount(); } }; // React root 需要显式卸载
  },
});
```

> 完整示例：[`playground/src/simple-demo.ts`](playground/src/simple-demo.ts)

---

### 3. UI 组件事件回传 JS 层

组件通过 `ctx.emit` 向外发出事件，`app.on()` 统一监听：

```ts
defineComponent("button", {
  setup: (args) => ({ text: String(args[0] ?? "Button") }),
  render(data, container, ctx) {
    const btn = document.createElement("button");
    btn.textContent = data.text;
    btn.onclick = () => ctx.emit("click", { text: data.text }); // 发送事件
    container.appendChild(btn);
  },
});

app.on("button", "click", (payload) => {
  console.log("按钮被点击：", payload);
});
```

---

### 4. 流式渲染——随 AI 输出逐步更新

反复调用 `app.run()` 传入越来越长的内容，引擎对比差异只重绘变化的部分。尚未输出完整的组件块会显示其骨架屏：

```ts
// 每收到新 chunk 就调用一次 run()
let accumulated = "";
for await (const chunk of aiStream) {
  accumulated += chunk;
  app.run(accumulated, container); // 引擎增量 patch，只更新变化段
}
```

> 完整流式演示：[`playground/src/main.ts`](playground/src/main.ts)

---

### 5. 多轮对话——每条消息独立渲染

每条 AI 回复是独立的渲染作用域，组件定义共享，`XLangApp` 实例按消息创建（开销极小，仅几个 Map）：

```ts
import { ConversationRenderer } from "./conversation-renderer";

// 组件定义只写一次，所有消息复用
const buttonComp = defineComponent("button", { ... });
const tableComp  = defineComponent("table",  { ... });

const renderer = new ConversationRenderer(chatContainer, {
  components: [buttonComp, tableComp],
});

// 每条 AI 回复：
const handle = renderer.addMessage("msg-1");
handle.update(partialMarkdown); // 流式时反复调用
handle.finalize();              // 输出完成时调用
```

> 完整对话演示：[`playground/src/conversation-demo.ts`](playground/src/conversation-demo.ts)  
> ConversationRenderer 实现：[`playground/src/conversation-renderer.ts`](playground/src/conversation-renderer.ts)

---

### 6. 按需覆盖——factory 完全可选

`XLangApp` 内置 Markdown、代码块、pending 状态的兜底渲染器，可以什么都不传，也可以只覆盖部分：

```ts
// 不传 factory，全用内置默认
const app = new XLangApp();

// 只覆盖 Markdown 渲染，其余保持默认
const app = new XLangApp({
  createMarkdownRenderer() {
    return {
      render(content, container) {
        container.innerHTML = markdownIt.render(content);
        return { dispose: () => { container.innerHTML = ""; } };
      },
    };
  },
});
```

---

## 浏览器 / 产物文件使用

从 GitHub Releases 下载：

- `x-langjs-<version>.min.js`（浏览器 IIFE，全局 `XLang`）
- `x-langjs-<version>.esm.mjs`（ESM）
- `x-langjs-<version>.cjs`（CommonJS）

```html
<script src="x-langjs-0.0.4.min.js"></script>
<script>
  const { XLangApp, defineComponent } = XLang;
  const app = new XLangApp();
  // ... 注册组件后运行
</script>
```

## 本地开发（Monorepo）

```bash
npm install
npm run build
npm run dev   # 在 localhost:3000 打开演示页面
```

## 子包文档

- [packages/core/README.md](packages/core/README.md)
- [packages/render/README.md](packages/render/README.md)
- [packages/interpreter/README.md](packages/interpreter/README.md)
- [packages/types/README.md](packages/types/README.md)
- [packages/parser/README.md](packages/parser/README.md)
- [packages/ast/README.md](packages/ast/README.md)

## 许可证

MIT（见 [LICENSE](LICENSE)）。
