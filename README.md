# x-langjs

[中文](README.zh.md)

ANTLR4 + TypeScript DSL runtime that executes `x-langjs` code blocks in Markdown and renders outputs through a pluggable UI layer.

**Fully custom rendering** — the runtime does not depend on any UI component library. You register your own components (e.g. table, button, card) and implement their UI with any framework or library you choose (Vue, React, Element Plus, Ant Design, or plain HTML). The core only provides the DSL execution and a thin render contract; all visuals are under your control.

## Project Structure

```text
packages/
  types/        @x-langjs/types        AST types and error classes
  parser/       @x-langjs/parser       ANTLR lexer/parser
  ast/          @x-langjs/ast          CST -> AST + scope resolver
  interpreter/  @x-langjs/interpreter  Runtime evaluator and value domain
  render/       @x-langjs/render       Render interfaces + RenderEngine
  core/         @x-langjs/core         Public SDK entry
playground/     @x-langjs/playground   Vite demo app
```

## Install

```bash
npm install @x-langjs/core
# or
pnpm add @x-langjs/core
```

## What can it do?

### 1. Register a custom UI component and render it from DSL

Write `button("Click me")` in a Markdown code block — x-langjs parses it, calls your `setup`, then calls your `render` to mount the UI:

```ts
import { XLangApp, defineComponent } from "@x-langjs/core";

const app = new XLangApp();

app.use(defineComponent("button", {
  // Parse DSL arguments into props
  setup: (args) => ({ text: String(args[0] ?? "Button") }),

  // Mount any UI you want into the provided container
  render(data, container) {
    const btn = document.createElement("button");
    btn.textContent = data.text;
    container.appendChild(btn);
    // Return dispose to clean up (optional — engine removes container automatically)
    return { dispose: () => btn.remove() };
  },
}));

app.run(`
\`\`\`x-langjs
button("Click me")
\`\`\`
`, document.getElementById("root")!);
```

> Full demo: [`playground/src/simple-demo.ts`](playground/src/simple-demo.ts)

---

### 2. Use any framework — Vue or React, your choice

The `render` function receives a plain DOM `container`. You decide how to mount:

**Vue:**
```ts
import { h, render as vueRender, reactive } from "vue";
import MyButton from "./MyButton.vue";

defineComponent("button", {
  setup: (args) => ({ text: String(args[0] ?? "Button"), type: "primary" }),
  render(data, container) {
    const state = reactive({ ...data });
    vueRender(h(MyButton, state), container);
    // No return needed — engine cleans up the container
  },
});
```

**React:**
```ts
import { createRoot } from "react-dom/client";
import { MyButton } from "./MyButton";

defineComponent("button", {
  setup: (args) => ({ text: String(args[0] ?? "Button") }),
  render(data, container) {
    const root = createRoot(container);
    root.render(<MyButton {...data} />);
    return { dispose() { root.unmount(); } }; // React root needs explicit cleanup
  },
});
```

> Full demo: [`playground/src/simple-demo.ts`](playground/src/simple-demo.ts)

---

### 3. Listen to UI events from DSL components

Components can emit events back to your JS layer via `ctx.emit`. Use `app.on()` to handle them:

```ts
defineComponent("button", {
  setup: (args) => ({ text: String(args[0] ?? "Button") }),
  render(data, container, ctx) {
    const btn = document.createElement("button");
    btn.textContent = data.text;
    btn.onclick = () => ctx.emit("click", { text: data.text }); // emit to app
    container.appendChild(btn);
  },
});

app.on("button", "click", (payload) => {
  console.log("Button clicked:", payload);
});
```

---

### 4. Streaming support — renders incrementally as AI output arrives

Call `app.run()` repeatedly with growing content. The engine diffs and only re-renders changed segments. Components that are still incomplete show their skeleton screen:

```ts
// Simulate streaming: call run() each time a new chunk arrives
let accumulated = "";
for await (const chunk of aiStream) {
  accumulated += chunk;
  app.run(accumulated, container); // engine patches only what changed
}
```

> Full streaming demo: [`playground/src/main.ts`](playground/src/main.ts)

---

### 5. Multi-turn conversation — one `XLangApp` per message bubble

Each AI response is an independent render scope. Component definitions are shared; only the `XLangApp` instance is per-message (it's lightweight — just a few Maps):

```ts
import { ConversationRenderer } from "./conversation-renderer";

// Define components once, reuse across all messages
const buttonComp = defineComponent("button", { ... });
const tableComp  = defineComponent("table",  { ... });

const renderer = new ConversationRenderer(chatContainer, {
  components: [buttonComp, tableComp],
});

// Each AI response:
const handle = renderer.addMessage("msg-1");
handle.update(partialMarkdown); // call repeatedly while streaming
handle.finalize();              // mark complete when done
```

> Full conversation demo: [`playground/src/conversation-demo.ts`](playground/src/conversation-demo.ts)  
> ConversationRenderer implementation: [`playground/src/conversation-renderer.ts`](playground/src/conversation-renderer.ts)

---

### 6. Override only what you need — factory is optional

`XLangApp` has built-in fallback renderers for Markdown, code blocks, and pending states. Pass nothing, or a partial override:

```ts
// No factory needed — built-in defaults handle everything
const app = new XLangApp();

// Override only Markdown rendering, keep other defaults
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

## Browser / Bundle File Usage

Download from GitHub Releases:

- `x-langjs-<version>.min.js` (browser IIFE, global `XLang`)
- `x-langjs-<version>.esm.mjs` (ESM)
- `x-langjs-<version>.cjs` (CommonJS)

```html
<script src="x-langjs-0.0.4.min.js"></script>
<script>
  const { XLangApp, defineComponent } = XLang;
  const app = new XLangApp();
  // ... register components and run
</script>
```

## Monorepo Development

```bash
npm install
npm run build
npm run dev   # opens playground at localhost:3000
```

## Package Docs

- [packages/core/README.md](packages/core/README.md)
- [packages/render/README.md](packages/render/README.md)
- [packages/interpreter/README.md](packages/interpreter/README.md)
- [packages/types/README.md](packages/types/README.md)
- [packages/parser/README.md](packages/parser/README.md)
- [packages/ast/README.md](packages/ast/README.md)

## License

MIT (see [LICENSE](LICENSE)).
