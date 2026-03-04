# Changelog

本文档记录 x-lang 的版本变更。格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

## [0.1.0] - 2026-03-02

首个正式发布版本。

### 功能概览

- **语言与运行时**
  - 基于 ANTLR4 的语法解析，无声明关键字、多作用域、Markdown 内嵌 \`\`\`x-lang\`\`\` 代码块。
  - 命名参数、懒求值、`自己` 关键字；ZValue 类型体系（Number、String、Bool、Null、Array、Object、Function、Date），box/unbox 与 JS 互转。
  - 内置解释执行、作用域解析、ASI（自动分号插入）。

- **渲染与扩展**
  - 可插拔渲染引擎（ComponentFactory + RenderEngine），增量 DOM、基于 fingerprint 的 diff。
  - `defineComponent` / `defineVueComponent` 自定义组件，支持可选骨架屏；流式输出时未完成块显示骨架。
  - EventBus 支持 UI 与 JS 双向通信（如按钮点击触发 Message、选项回传等）。

- **Playground**
  - Monaco 编辑器、x-lang 语法高亮；静态 / 流式演示。
  - 多 UI 库切换：Element Plus、Arco Design、Ant Design Vue。
  - 内置组件：alert、statistic、progress、tag、rate、descriptions、table、button、card、ordercard、agentchat、hotelconfirm、form、result、drawer、timeline、collapse、dialog、各类图表（line/area/bar/pie/scatter/candlestick/radar/graph）等。

- **发布物**
  - **playground-{version}.zip**：Playground 静态构建，解压后可用任意静态服务器或直接打开 `index.html` 使用（资源为相对路径）。

### 构建与使用

- Node ≥ 20，pnpm workspaces。
- 根目录：`pnpm install` → `pnpm run build` → `pnpm run dev` 启动 Playground。
- 集成：通过 `@x-lang/core` 的 `parse`、`run`、`XLangApp`、`defineComponent` 等 API 接入自有项目。

[0.1.0]: https://github.com/chesongsong/x-lang/releases/tag/v0.1.0
