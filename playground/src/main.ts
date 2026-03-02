import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { XLangApp } from "@x-lang/core";
import { ElementComponentFactory } from "./renderers/element-factory";
import { createComponents, type UILib } from "./components/_registry";
import { registerXLang, createXLangTheme, XLANG_ID } from "./monaco-lang";
import "@arco-design/web-vue/dist/arco.css";
import "./style.css";

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker();
  },
};

registerXLang();
createXLangTheme();

// ---------------------------------------------------------------------------
// 1. App / components / data
// ---------------------------------------------------------------------------

const sharedData = {
  用户列表: [
    { 姓名: "张三", 部门: "工程部", 薪资: 25000 },
    { 姓名: "李四", 部门: "设计部", 薪资: 22000 },
    { 姓名: "王五", 部门: "产品部", 薪资: 28000 },
    { 姓名: "赵六", 部门: "工程部", 薪资: 30000 },
  ],
  公司名: "X-Lang 科技",
  公司信息: { 名称: "X-Lang 科技", 行业: "软件开发", 成立年份: 2024, 地址: "上海市浦东新区" },
  项目进度: 78,
  团队评分: 4.5,
  订单: {
    订单号: "O202402280001",
    状态: "已支付",
    金额: 299,
    下单时间: "2026-02-28 14:30",
    商品列表: [
      { 商品名: "X-Lang 入门教程", 数量: 1, 单价: 99 },
      { 商品名: "组件开发实战", 数量: 2, 单价: 100 },
    ],
    收货地址: "上海市浦东新区张江镇 XX 路 100 号",
  },
};

const appRef: { current: XLangApp } = { current: null! };

function buildApp(lib: UILib): XLangApp {
  const newApp = new XLangApp(new ElementComponentFactory());
  for (const comp of createComponents(lib)) {
    newApp.use(comp);
  }
  newApp.provide(sharedData);
  return newApp;
}

appRef.current = buildApp("element");

// ---------------------------------------------------------------------------
// 2. Editor & Layout
// ---------------------------------------------------------------------------

const editorContainer = document.getElementById("editor")!;
const output = document.getElementById("output-content")!;
const divider = document.getElementById("divider")!;

const STATIC_CODE = `# X-Lang 组件一览

本页面展示了所有可用的 x-lang 渲染组件。

## Feedback 反馈

\`\`\`x-lang
alert(title = "欢迎", description = "这是一个 info 提示，支持标题和描述。", type = "info")
\`\`\`

\`\`\`x-lang
alert(title = "操作成功", type = "success")
\`\`\`

\`\`\`x-lang
alert(title = "注意", description = "某些配置可能影响性能。", type = "warning")
\`\`\`

## Data 数据展示

### 统计数值

\`\`\`x-lang
statistic("员工总数", 4)
\`\`\`

\`\`\`x-lang
statistic(title = "平均薪资", value = 26250, suffix = "元")
\`\`\`

### 进度条

\`\`\`x-lang
progress(项目进度, status = "success")
\`\`\`

### 标签

\`\`\`x-lang
tag("工程部", "设计部", "产品部", type = "primary")
\`\`\`

### 评分

\`\`\`x-lang
rate(团队评分)
\`\`\`

### 描述列表

\`\`\`x-lang
descriptions(公司信息)
\`\`\`

### 表格

\`\`\`x-lang
table(用户列表)
\`\`\`

## 按钮

\`\`\`x-lang
button(text = "主要按钮", type = "primary")
\`\`\`

\`\`\`x-lang
button(text = "成功按钮", type = "success")
\`\`\`

\`\`\`x-lang
button(text = "点我提示", onClick = "操作成功！")
\`\`\`

## 卡片

\`\`\`x-lang
card(title = "项目概要", content = "本季度共完成 3 个里程碑，团队整体表现优异。")
\`\`\`

## 订单详情卡

\`\`\`x-lang
OrderCard(订单)
\`\`\`

## 结果页

\`\`\`x-lang
result(title = "页面加载完成", subtitle = "所有组件已渲染成功", type = "success")
\`\`\`
`;

const STREAM_CONTENT = `# X-Lang 科技 · 年度分析报告

你好！以下是我根据你提供的数据为 **X-Lang 科技** 生成的年度分析报告。

\`\`\`x-lang
alert(title = "数据已更新", description = "以下数据截至 2026 年 Q1，已包含最新季度信息。", type = "info")
\`\`\`

## 公司概览

\`\`\`x-lang
descriptions(公司信息)
\`\`\`

## 核心指标

\`\`\`x-lang
statistic("员工总数", 4)
\`\`\`

\`\`\`x-lang
statistic(title = "平均薪资", value = 26250, suffix = "元")
\`\`\`

\`\`\`x-lang
progress(项目进度, status = "success")
\`\`\`

## 部门分布

\`\`\`x-lang
tag("工程部", "设计部", "产品部", type = "primary")
\`\`\`

## 员工花名册

\`\`\`x-lang
table(用户列表)
\`\`\`

## 团队评价

\`\`\`x-lang
rate(团队评分)
\`\`\`

## 快速操作

\`\`\`x-lang
button(text = "导出报告", type = "primary")
\`\`\`

\`\`\`x-lang
button(text = "发送邮件", type = "success")
\`\`\`

\`\`\`x-lang
card(title = "项目概要", content = "本季度共完成 3 个里程碑，团队整体表现优异。")
\`\`\`

## 订单详情

\`\`\`x-lang
OrderCard(订单)
\`\`\`

## 代码演示

\`\`\`x-lang
总人数 = 4
标题 = 公司名 + " 共有 " + 总人数 + " 名员工"
标题
\`\`\`

## 薪资明细

\`\`\`x-lang
table(用户列表, 姓名, 部门, 薪资)
\`\`\`

## 总结

\`\`\`x-lang
result(title = "报告生成完毕", subtitle = "已为你分析 4 名员工数据，如有疑问请随时告诉我。", type = "success")
\`\`\`
`;

const editor = monaco.editor.create(editorContainer, {
  value: STATIC_CODE,
  language: XLANG_ID,
  theme: "xlang-light",
  fontSize: 14,
  lineHeight: 1.6,
  fontFamily:
    '"SF Mono", "Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, monospace',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  padding: { top: 12, bottom: 12 },
  automaticLayout: true,
  tabSize: 2,
  renderLineHighlight: "line",
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  smoothScrolling: true,
  bracketPairColorization: { enabled: true },
  guides: { indentation: true, bracketPairs: true },
  wordWrap: "on",
  contextmenu: true,
  suggest: { showKeywords: true },
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: false,
  scrollbar: {
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
  },
});

function execute() {
  try {
    appRef.current.run(editor.getValue(), output);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    output.innerHTML = "";
    const errDiv = document.createElement("div");
    errDiv.className = "render-error-item";
    errDiv.textContent = message;
    output.appendChild(errDiv);
  }
}

editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, execute);

let debounceTimer: ReturnType<typeof setTimeout>;
editor.onDidChangeModelContent(() => {
  if (streaming) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(execute, 300);
});

// ---------------------------------------------------------------------------
// 3. Streaming simulator
// ---------------------------------------------------------------------------

const btnStream = document.getElementById("btn-stream") as HTMLButtonElement;
const btnStop = document.getElementById("btn-stop") as HTMLButtonElement;
const streamStatus = document.getElementById("stream-status")!;

let streaming = false;
let streamTimer: ReturnType<typeof setTimeout> | null = null;
let streamIndex = 0;

function startStream(): void {
  streaming = true;
  streamIndex = 0;
  btnStream.style.display = "none";
  btnStop.style.display = "";
  streamStatus.textContent = "AI 正在输出...";

  appRef.current.reset();
  editor.setValue("");
  editor.updateOptions({ readOnly: true });
  output.innerHTML = "";

  scheduleChunk();
}

function stopStream(): void {
  if (streamTimer) {
    clearTimeout(streamTimer);
    streamTimer = null;
  }
  finishStream();
}

function finishStream(): void {
  streaming = false;
  editor.updateOptions({ readOnly: false });
  btnStream.style.display = "";
  btnStop.style.display = "none";
  streamStatus.textContent = "";
  execute();
}

let pendingRender = false;
let lastRenderTime = 0;
const RENDER_INTERVAL = 120;

function streamRender(): void {
  pendingRender = false;
  lastRenderTime = Date.now();
  execute();
  output.scrollTop = output.scrollHeight;
}

function requestStreamRender(): void {
  if (pendingRender) return;
  const elapsed = Date.now() - lastRenderTime;
  if (elapsed >= RENDER_INTERVAL) {
    streamRender();
  } else {
    pendingRender = true;
    setTimeout(streamRender, RENDER_INTERVAL - elapsed);
  }
}

function scheduleChunk(): void {
  if (streamIndex >= STREAM_CONTENT.length) {
    streamRender();
    finishStream();
    return;
  }

  const baseSize = 3 + Math.floor(Math.random() * 6);
  let end = streamIndex + baseSize;

  if (end < STREAM_CONTENT.length) {
    const nextNewline = STREAM_CONTENT.indexOf("\n", streamIndex);
    if (nextNewline !== -1 && nextNewline < end + 3) {
      end = nextNewline + 1;
    }
  }

  end = Math.min(end, STREAM_CONTENT.length);
  const chunk = STREAM_CONTENT.slice(streamIndex, end);
  streamIndex = end;

  const model = editor.getModel()!;
  const lastLine = model.getLineCount();
  const lastCol = model.getLineMaxColumn(lastLine);
  model.applyEdits([
    {
      range: new monaco.Range(lastLine, lastCol, lastLine, lastCol),
      text: chunk,
    },
  ]);

  editor.revealLine(model.getLineCount());
  requestStreamRender();

  let delay: number;
  if (chunk.includes("```")) {
    delay = 600;
  } else if (chunk.includes("\n")) {
    delay = 60 + Math.floor(Math.random() * 40);
  } else {
    delay = 35 + Math.floor(Math.random() * 35);
  }

  streamTimer = setTimeout(scheduleChunk, delay);
}

btnStream.addEventListener("click", startStream);
btnStop.addEventListener("click", stopStream);

// ---------------------------------------------------------------------------
// 4. UI library switcher
// ---------------------------------------------------------------------------

function switchLib(lib: UILib) {
  appRef.current = buildApp(lib);
  document.querySelectorAll(".lib-btn").forEach((btn) => {
    const el = btn as HTMLButtonElement;
    el.classList.toggle("active", el.dataset.lib === lib);
  });
  output.innerHTML = "";
  execute();
}

document.querySelectorAll(".lib-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const lib = (btn as HTMLButtonElement).dataset.lib as UILib;
    if (lib) switchLib(lib);
  });
});

// ---------------------------------------------------------------------------
// 5. Divider drag
// ---------------------------------------------------------------------------

let isDragging = false;
divider.addEventListener("mousedown", (e) => {
  isDragging = true;
  divider.classList.add("dragging");
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  const main = document.getElementById("main")!;
  const rect = main.getBoundingClientRect();
  const ratio = (e.clientX - rect.left) / rect.width;
  const clamped = Math.max(0.2, Math.min(0.8, ratio));
  const editorPanel = document.getElementById("editor-panel")!;
  const outputPanel = document.getElementById("output-panel")!;
  editorPanel.style.flex = `${clamped}`;
  outputPanel.style.flex = `${1 - clamped}`;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
  divider.classList.remove("dragging");
});

execute();
