# x-lang

基于 ANTLR4 与 TypeScript 实现的领域语言，支持在 Markdown 中嵌入 \`\`\`x-lang\`\`\` 代码块，解析执行后将代码块交给可插拔的渲染引擎（如 Vue + 任意 UI 库）展示为自定义组件。

## 项目结构

```
├── packages/
│   ├── types/       @x-lang/types     — AST 节点类型、错误类、通用类型
│   ├── parser/      @x-lang/parser     — ANTLR4 语法、词法/语法分析
│   ├── ast/         @x-lang/ast        — CST→AST 构建、作用域解析、AST 访问
│   ├── interpreter/ @x-lang/interpreter — 解释执行、ZValue 值域、内置函数
│   ├── render/      @x-lang/render     — 渲染引擎、组件工厂抽象、增量 DOM
│   └── core/        @x-lang/core       — 对外 API（parse / run / XLangApp / defineComponent 等）
└── playground/      @x-lang/playground — Vite + Vue 演示：Monaco 编辑、多 UI 库切换、流式演示
```

## 快速开始

（项目使用 pnpm workspaces，也可用 npm 安装。）

```bash
npm install
npm run build
# 启动 Playground 演示
npm run dev
```

## 语言特性

- **无声明关键字**：直接写 `apple = 3`，未定义则视为定义，已定义则视为赋值。
- **作用域**：支持多个程序段落（scope），彼此独立，可同名变量。
- **Markdown 混合**：仅 \`\`\`x-lang ... \`\`\` 内的内容参与执行与自定义渲染；其余按 Markdown 输出。
- **命名参数**：如 `button(text = "确定", type = "primary")`，支持懒求值与 `自己` 关键字。
- **类型与值**：ZValue 体系（ZNumber、ZString、ZBool、ZNull、ZArray、ZObject、ZFunction、ZDate），`box` / `unbox` 用于 JS 与 x-lang 值互转。
- **表达式**：四则运算、比较、逻辑、成员访问、下标、数组/对象字面量、函数调用等；支持 ASI（自动分号插入）。

## 核心 API

### 解析与执行

```typescript
import { parse, run } from "@x-lang/core";

const { ast, errors } = parse(`a = 1\nb = a + 2\nb`);

const { segments, errors: runErrors } = run(`
# 标题
\`\`\`x-lang
statistic("总数", 10)
\`\`\`
`, { variables: { 总数: 10 } });
// segments: MarkdownSegment | ScopeSegment（含执行结果）
```

### 应用与渲染（XLangApp）

```typescript
import { XLangApp } from "@x-lang/core";
import { ElementComponentFactory } from "./renderers/element-factory"; // 你的工厂
import { createComponents } from "./components/_registry";            // 你的组件列表

const app = new XLangApp(new ElementComponentFactory());
createComponents("element").forEach((c) => app.use(c));
app.provide({ 用户列表: [...], 公司信息: {...} });

app.run(markdownSource, document.getElementById("output"));
```

### 自定义组件（defineComponent）

```typescript
import { defineComponent } from "@x-lang/core";

const myButton = defineComponent("MyButton", {
  setup(args, named) {
    return { text: named.text ?? args[0] ?? "按钮", type: named.type ?? "primary" };
  },
  render(data, container, ctx) {
    // 使用任意方式将 data 渲染到 container，返回 { dispose, update? }
  },
  skeleton(container, ctx) {
    // 可选：流式/加载中时显示的骨架
  },
});
app.use(myButton);
```

- **简单组件**：`setup` 为函数 `(args, named) => data`。
- **高级组件**：`setup` 为 `{ execute(ctx): data }`，可访问 AST、作用域等（如 table 列推断）。
- 支持 **Vue SFC**：通过 `defineVueComponent(name, { setup, component, skeleton })` 将 Vue 组件包装为 x-lang 组件。

### 事件与 UI↔JS 通信

- 渲染上下文 `RenderContext` 提供 `EventBus`，可 `emit(name, payload)` / `on(name, handler)`。
- 例如按钮的 `onClick` 在 UI 中触发后，通过 Message/Toast 展示；也可由业务监听事件做后续逻辑。

## 渲染架构

- **ComponentFactory**：根据组件名创建渲染器，与具体 UI 库解耦。
- **RenderEngine**：驱动 Markdown 分割、执行、增量 DOM（基于 fingerprint 的 diff），支持流式输出时“未完成块”显示骨架屏。
- **骨架屏**：每个组件可可选实现 `skeleton(container, SkeletonContext)`；未实现时使用默认占位。Playground 中骨架使用 Element Plus 的 `ElSkeleton`。

## Playground

- **左侧**：Monaco 编辑器，x-lang 语法高亮；提供「流式演示」模拟 AI 逐字输出。
- **右侧**：渲染结果；顶部可切换 **Element Plus** / **Arco Design** / **Ant Design**，切换后立即用当前库重新渲染。
- **静态 Demo**：展示所有组件的多种用法（见下方组件列表）。
- **流式 Demo**：同一份报告内容以流式方式输出，未完成块显示对应组件骨架屏。

## 内置组件一览（Playground 演示）

| 组件 | 说明 | 典型用法 |
|------|------|----------|
| **alert** | 提示条 | `alert(title = "提示", description = "…", type = "info" \| "success" \| "warning" \| "error")` |
| **statistic** | 统计数值 | `statistic("员工总数", 4)`、`statistic(title = "平均薪资", value = 26250, suffix = "元")` |
| **progress** | 进度条 | `progress(项目进度, status = "success" \| "warning" \| "exception")` |
| **tag** | 标签 | `tag("工程部", "设计部", type = "primary" \| "success" \| "warning" \| "danger" \| "info")` |
| **rate** | 评分 | `rate(团队评分)`，支持半星、max、disabled |
| **descriptions** | 描述列表 | `descriptions(公司信息)`，可选 `column`、`border` |
| **table** | 表格 | `table(用户列表)` 或 `table(用户列表, 姓名, 部门, 薪资)` |
| **button** | 按钮 | `button(text = "确定", type = "primary", size = "default" \| "small" \| "large", onClick = "提示文案")` |
| **card** | 卡片 | `card(title = "标题", content = "内容", shadow = "hover" \| "always" \| "never")` |
| **OrderCard** | 订单详情卡 | `OrderCard(订单)` 或 `OrderCard(订单号 = "…", 状态 = "已支付", 金额 = 99, …)` |
| **result** | 结果页 | `result(title = "完成", subtitle = "说明", type = "success" \| "info" \| "error" \| "warning")` |

- 数据由 `app.provide()` 注入，如 `用户列表`、`公司信息`、`订单`、`项目进度`、`团队评分` 等，在 \`\`\`x-lang\`\`\` 中直接按变量名使用。

## 构建与脚本

1. **语法生成**：`npm run generate` — 从 `.g4` 生成 Lexer/Parser。
2. **TypeScript**：`npm run build:ts` — 各 package 的 tsc 编译（含 project references）。
3. **打包**：`npm run build:bundle` — 使用 esbuild 将 `@x-lang/core` 打成 ESM/CJS。
4. **全量**：`npm run build` = generate + build:ts + build:bundle。
5. **开发**：`npm run dev` — 先 build 再启动 playground 的 Vite 开发服务。

## 依赖与环境

- **Node** ≥ 20。
- 主要依赖：`antlr4ng`、`esbuild`、`typescript`；Playground 额外依赖 Vue 3、Monaco Editor、Element Plus、Arco Design Vue、Ant Design Vue。

## License

见仓库根目录 LICENSE 文件。
