# x-langjs

[English](README.md)

`x-langjs` 是一个基于 ANTLR4 + TypeScript 的 DSL 运行时，支持在 Markdown 中执行 `x-langjs` 代码块，并通过可插拔 UI 渲染输出。

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

## 安装（推荐）

```bash
npm install @x-langjs/core
# 或
pnpm add @x-langjs/core
```

## 快速使用

```ts
import { parse, run } from "@x-langjs/core";

const parsed = parse("a = 1\nb = a + 2\nb");
const executed = run(`
# report
\`\`\`x-langjs
total = 100
total
\`\`\`
`);
```

## 产物文件方式

可从 GitHub Releases 下载：

- `x-langjs-<version>.min.js`
- `x-langjs-<version>.esm.mjs`
- `x-langjs-<version>.cjs`

## 许可

MIT（见 `LICENSE`）
