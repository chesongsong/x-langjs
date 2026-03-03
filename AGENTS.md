# AGENTS

本文件面向 AI 开发协作者，概述仓库目标、架构、关键入口与修改规范。

## 仓库定位
- 这是一个基于 ANTLR4 + TypeScript 的 DSL 语言项目（x-lang），支持在 Markdown 中嵌入 `x-lang` 代码块。
- 运行时会解析 Markdown，将 `x-lang` 代码块执行后交给渲染引擎输出为 UI 组件。
- Playground 是核心验证场景：左侧编辑器，右侧渲染结果，支持多 UI 库切换与流式演示。

## 核心架构
- `packages/parser`：ANTLR4 词法/语法与生成产物。
- `packages/ast`：CST→AST 构建、作用域解析、AST 访问器。
- `packages/interpreter`：解释执行、值域类型、内置函数。
- `packages/render`：渲染引擎、组件工厂、增量 DOM、骨架屏。
- `packages/core`：对外 API，整合 parse/run/XLangApp/defineComponent 等。
- `playground`：演示与 UI 组件实现（Element/Arco/Antd）。

## 关键入口
- 解析/执行入口：`packages/core/src/xlang.ts`
- 渲染引擎：`packages/render/src/engine.ts`
- Playground 启动：`playground/src/main.ts`
- 组件注册表：`playground/src/components/_registry.ts`
- 组件数据解析：`playground/src/components/_setups.ts`
- Demo 内容：`playground/src/demo-content.ts`

## 组件体系（Playground）
- 组件通过 `defineVueComponent` 注册为 x-lang 组件。
- 每个 UI 库对应一套 Vue 组件实现：
  - `playground/src/components/element/*`
  - `playground/src/components/arco/*`
  - `playground/src/components/antd/*`
- 新增组件时需同时：
  - 增加 setup（数据归一化）
  - 增加三套 UI 视图
  - 注册到 `_registry.ts`
  - 在 `demo-content.ts` 添加示例
  - README 更新组件列表

## 交互与事件
- 组件内部可通过 `RenderContext` 触发事件回传到 JS 侧。
- 事件监听入口：`XLangApp.on(component, event, handler)`。
- 适用于 Agent 与用户交互的结果回传。

## 语法与格式约定
- x-lang 支持 Markdown 中的 ```x-lang``` 代码块。
- Demo 内容必须放入模板字符串中，并用 `\`\`\`` 形式转义反引号。
- 变量命名支持中文，建议在 demo 中优先中文变量以便展示。

## 开发约定
- 使用 pnpm workspaces。
- 优先保持现有代码风格与命名方式。
- 修改 demo 时请同步更新 README 中的组件列表（如有新增组件）。
- 多文件改动时保持组件注册、demo 与文档的一致性。

## 常用命令
- 开发：`pnpm dev`
- 清理：`pnpm clean`
- 生成语法：`pnpm generate`
- 构建：`pnpm build`
