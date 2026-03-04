# x-langjs

English version: `README.en.md`

基于 ANTLR4 与 TypeScript 实现的领域语言，支持在 Markdown 中嵌入 \`\`\`x-langjs\`\`\` 代码块，解析执行后将代码块交给可插拔的渲染引擎（如 Vue + 任意 UI 库）展示为自定义组件。

An ANTLR4 + TypeScript DSL runtime that executes \`\`\`x-langjs\`\`\` blocks inside Markdown and renders results through a pluggable UI layer.

## Language / 语言

- 中文：见下方完整说明
- English quick start: see `## English`

## English

- Install: `npm install @x-langjs/core`
- Basic use:
  - Use:
    ```ts
    import { parse, run } from "@x-langjs/core";
    const parsed = parse("a = 1");
    const executed = run("```x-langjs\na = 1\n```");
    console.log(parsed.errors, executed.segments);
    ```
  - Prebuilt files: `x-langjs-<version>.min.js`, `x-langjs-<version>.esm.mjs`, `x-langjs-<version>.cjs`
  - Subpackage docs:
    - `packages/core/README.md`
    - `packages/types/README.md`
    - `packages/parser/README.md`
    - `packages/ast/README.md`
    - `packages/interpreter/README.md`
    - `packages/render/README.md`

## 中文

## 项目结构

```
├── packages/
│   ├── types/       @x-langjs/types     — AST 节点类型、错误类、通用类型
│   ├── parser/      @x-langjs/parser     — ANTLR4 语法、词法/语法分析
│   ├── ast/         @x-langjs/ast        — CST→AST 构建、作用域解析、AST 访问
│   ├── interpreter/ @x-langjs/interpreter — 解释执行、Xvalue 值域、内置函数
│   ├── render/      @x-langjs/render     — 渲染引擎、组件工厂抽象、增量 DOM
│   └── core/        @x-langjs/core       — 对外 API（parse / run / XLangApp / defineComponent 等）
└── playground/      @x-langjs/playground — Vite + Vue 演示：Monaco 编辑、多 UI 库切换、流式演示
```

## 快速开始（本仓库开发）

（项目使用 pnpm workspaces，也可用 npm 安装。）

```bash
npm install
npm run build
# 启动 Playground 演示
npm run dev
```

## 使用方式

### 方式一：通过 npm 使用

在任意 Node / 前端项目中安装并引用：

```bash
npm install @x-langjs/core
# 或
pnpm add @x-langjs/core
```

**Node / ESM 示例：**

```javascript
import { parse, run } from "@x-langjs/core";

// 仅解析，得到 AST
const { ast, errors } = parse("a = 1\nb = a + 2\nb");
console.log(errors.length ? errors : ast);

// 解析并执行（支持 Markdown 内嵌 ```x-langjs``` 块）
const { segments, errors: runErrors } = run(`
# 报表
\`\`\`x-langjs
total = 100
total
\`\`\`
`, { variables: {} });
console.log(segments);
```

**浏览器 / 打包器（Vite、Webpack 等）：**

```javascript
import { parse, run, XLangApp } from "@x-langjs/core";

// 与上面相同，parse / run 可直接使用
// 完整渲染需自建 ComponentFactory 并 new XLangApp(factory)，见「核心 API」一节
```

### 方式二：通过产物文件使用

不依赖 npm，直接下载构建好的单文件引入项目。从 [GitHub Releases](https://github.com/chesongsong/x-langjs/releases) 下载对应版本的文件：

| 文件 | 说明 |
|------|------|
| `x-langjs-<version>.min.js` | **浏览器 IIFE 版**，单文件无外部依赖，通过 `<script>` 引入，暴露全局 `XLang` |
| `x-langjs-<version>.mjs` | ESM 版，适合浏览器 `<script type="module">` 或打包器 |
| `x-langjs-<version>.cjs` | CJS 版，适合 Node.js `require()` |

**浏览器 `<script>` 直接引入（推荐体验用）：**

```html
<!-- 从 Releases 下载后放到项目目录 -->
<script src="x-langjs-0.0.2.min.js"></script>
<script>
  const { parse, run } = XLang;

  // 解析 x-langjs 代码
  const { ast, errors } = parse("a = 1\nb = a + 2\nb");
  console.log(errors.length ? errors : ast);

  // 执行含 Markdown 的文档（```x-langjs 块会被执行）
  const { segments } = run(`
# 报表
\`\`\`x-langjs
total = 100
total
\`\`\`
  `);
  console.log(segments);
  // 将 segments 渲染到 DOM 需自建 ComponentFactory，见「核心 API」章节
</script>
```

**Node.js / 打包器（无需 npm 安装，直接引用文件）：**

```javascript
// ESM
import { parse, run } from "./x-langjs-0.0.2.esm.mjs";

// CJS
const { parse, run } = require("./x-langjs-0.0.2.cjs");
```

## 语言特性

- **无声明关键字**：直接写 `apple = 3`，未定义则视为定义，已定义则视为赋值。
- **作用域**：支持多个程序段落（scope），彼此独立，可同名变量。
- **Markdown 混合**：仅 \`\`\`x-langjs ... \`\`\` 内的内容参与执行与自定义渲染；其余按 Markdown 输出。
- **命名参数**：如 `button(text = "确定", type = "primary")`，支持懒求值与 `自己` 关键字。
- **类型与值**：Xvalue 体系（XNumber、XString、XBool、XNull、XArray、XObject、XFunction、XDate），`box` / `unbox` 用于 JS 与 x-langjs 值互转。
- **表达式**：四则运算、比较、逻辑、成员访问、下标、数组/对象字面量、函数调用等；支持 ASI（自动分号插入）。

## 核心 API

### 解析与执行

```typescript
import { parse, run } from "@x-langjs/core";

const { ast, errors } = parse(`a = 1\nb = a + 2\nb`);

const { segments, errors: runErrors } = run(`
# 标题
\`\`\`x-langjs
statistic("总数", 10)
\`\`\`
`, { variables: { 总数: 10 } });
// segments: MarkdownSegment | ScopeSegment（含执行结果）
```

### Tokenize（高层）

```typescript
import { tokenize } from "@x-langjs/core";

const { tokens, errors } = tokenize(`a = 1`);
```

### 应用与渲染（XLangApp）

```typescript
import { XLangApp } from "@x-langjs/core";
import { ElementComponentFactory } from "./renderers/element-factory"; // 你的工厂
import { createComponents } from "./components/_registry";            // 你的组件列表

const app = new XLangApp(new ElementComponentFactory());
createComponents("element").forEach((c) => app.use(c));
app.provide({ 用户列表: [...], 公司信息: {...} });

app.run(markdownSource, document.getElementById("output"));
```

### 自定义组件（defineComponent）

```typescript
import { defineComponent } from "@x-langjs/core";

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
- 支持 **Vue SFC**：通过 `defineVueComponent(name, { setup, component, skeleton })` 将 Vue 组件包装为 x-langjs 组件。

### 事件与 UI↔JS 通信

- 渲染上下文 `RenderContext` 提供 `EventBus`，可 `emit(name, payload)` / `on(name, handler)`。
- 例如按钮的 `onClick` 在 UI 中触发后，通过 Message/Toast 展示；也可由业务监听事件做后续逻辑。

示例：监听 agentchat 选项回传

```typescript
app.on("agentchat", "select", (payload) => {
  // payload: { questionId, value, label, role }
  console.log("agentchat", payload);
});
```

#### XLangApp 扩展方法

- `on(component, event, handler)` / `off(component, event, handler?)`
- `getInstances(kind?)` 获取当前渲染实例
- `updateInstance(kind, index, data)` 更新指定实例
- `reset()` 清理当前渲染内容

### Renderable（自定义可渲染值）

```typescript
import { defineRenderable, XRenderable, XRenderCustom } from "@x-langjs/core";
```

### AST 与访问器

```typescript
import { ASTBuilder, ScopeResolver, visitNode } from "@x-langjs/core";
```

### 解释器与运行时

```typescript
import { Interpreter, execute, BuiltinRegistry, Environment } from "@x-langjs/core";
```

### 低层 Parser

```typescript
import { createLexer, parse as parseCST, tokenize as tokenizeRaw, locationFromToken } from "@x-langjs/core";
```

## 渲染架构

- **ComponentFactory**：根据组件名创建渲染器，与具体 UI 库解耦。
- **RenderEngine**：驱动 Markdown 分割、执行、增量 DOM（基于 fingerprint 的 diff），支持流式输出时“未完成块”显示骨架屏。
- **骨架屏**：每个组件可可选实现 `skeleton(container, SkeletonContext)`；未实现时使用默认占位。Playground 中骨架使用 Element Plus 的 `ElSkeleton`。

## Playground

- **左侧**：Monaco 编辑器，x-langjs 语法高亮；提供「流式演示」模拟 AI 逐字输出。
- **右侧**：渲染结果；顶部可切换 **Element Plus** / **Arco Design** / **Ant Design**，切换后立即用当前库重新渲染。
- **静态 Demo**：展示所有组件的多种用法（见下方组件列表）。
- **流式 Demo**：同一份报告内容以流式方式输出，未完成块显示对应组件骨架屏。

### Playground 已支持的 UI 库

- **Element Plus**
- **Arco Design**
- **Ant Design Vue**

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
| **ordercard** | 订单详情卡 | `ordercard(订单)` 或 `ordercard(订单号 = "…", 状态 = "已支付", 金额 = 99, …)` |
| **agentchat** | Agent 交互气泡 | `agentchat(role = "agent", content = "问题", questionId = "q1", options = ["A", "B"])` |
| **hotelconfirm** | 酒店变更确认卡 | `hotelconfirm(hotelName = "测试酒店123456", roomItems = [...], dateValue = "2026年2月12日", actionItems = [...])` |
| **form** | 复杂表单 | `form(title = "立项表单", fields = 字段数组, column = 2)` |
| **result** | 结果页 | `result(title = "完成", subtitle = "说明", type = "success" \| "info" \| "error" \| "warning")` |
| **drawer** | 抽屉 | `drawer(title = "筛选", content = "…", placement = "right", size = "320px")` |
| **timeline** | 时间线 | `timeline(里程碑列表)` |
| **collapse** | 折叠面板 | `collapse(问答列表)` |
| **dialog** | 对话框 | `dialog(title = "确认", content = "…")` |
| **linechart** | 折线图 | `linechart(option = {...})` |
| **areachart** | 面积图 | `areachart(option = {...})` |
| **barchart** | 柱状图 | `barchart(option = {...})` |
| **piechart** | 饼图 | `piechart(option = {...})` |
| **scatterchart** | 散点图 | `scatterchart(option = {...})` |
| **candlestickchart** | K 线图 | `candlestickchart(option = {...})` |
| **radarchart** | 雷达图 | `radarchart(option = {...})` |
| **graphchart** | 关系图 | `graphchart(option = {...})` |

- 数据由 `app.provide()` 注入，如 `用户列表`、`公司信息`、`订单`、`项目进度`、`团队评分` 等，在 \`\`\`x-langjs\`\`\` 中直接按变量名使用。

## 构建与脚本

1. **语法生成**：`npm run generate` — 从 `.g4` 生成 Lexer/Parser。
2. **TypeScript**：`npm run build:ts` — 各 package 的 tsc 编译（含 project references）。
3. **打包**：`npm run build:bundle` — 使用 esbuild 将 `@x-langjs/core` 打成 ESM/CJS。
4. **全量**：`npm run build` = generate + build:ts + build:bundle。
5. **开发**：`npm run dev` — 先 build 再启动 playground 的 Vite 开发服务。

## 依赖与环境

- **Node** ≥ 20。
- 主要依赖：`antlr4ng`、`esbuild`、`typescript`；Playground 额外依赖 Vue 3、Monaco Editor、Element Plus、Arco Design Vue、Ant Design Vue。

## License

见仓库根目录 LICENSE 文件。
