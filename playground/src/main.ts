import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { XLangApp } from "@x-lang/core";
import { ElementComponentFactory } from "./renderers/element-factory";
import { table } from "./components/table";
import { tlink } from "./components/tlink";
import { button } from "./components/button";
import { radio } from "./components/radio";
import { registerXLang, createXLangTheme, XLANG_ID } from "./monaco-lang";
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

const statusEl = document.getElementById("event-status");

const app = new XLangApp(new ElementComponentFactory());

app
  .use(table)
  .use(tlink)
  .use(button)
  .use(radio)
  .provide({
    用户列表: [
      { 姓名: "张三", 部门: "工程部", 薪资: 25000 },
      { 姓名: "李四", 部门: "设计部", 薪资: 22000 },
      { 姓名: "王五", 部门: "产品部", 薪资: 28000 },
      { 姓名: "赵六", 部门: "工程部", 薪资: 30000 },
    ],
    公司名: "X-Lang 科技",
    部门选项: ["全部", "工程部", "设计部", "产品部"],
    当前部门: "全部",
  })
  .on("radio", "change", (value) => {
    if (statusEl) {
      statusEl.textContent = `当前选择：${value}`;
    }

    const filter = value as string;
    const all = [
      { 姓名: "张三", 部门: "工程部", 薪资: 25000 },
      { 姓名: "李四", 部门: "设计部", 薪资: 22000 },
      { 姓名: "王五", 部门: "产品部", 薪资: 28000 },
      { 姓名: "赵六", 部门: "工程部", 薪资: 30000 },
    ];
    const filtered = filter === "全部" ? all : all.filter((u) => u.部门 === filter);

    app.provide({ 用户列表: filtered, 当前部门: filter });
    requestAnimationFrame(() => app.run(editor.getValue(), output));
  });

// ---------------------------------------------------------------------------
// 2. Editor & Layout
// ---------------------------------------------------------------------------

const editorContainer = document.getElementById("editor")!;
const output = document.getElementById("output-content")!;
const divider = document.getElementById("divider")!;

const STATIC_CODE = `# x-lang Playground

欢迎使用 x-lang，只有标记 \`x-lang\` 的代码块会被执行。

## 交互组件演示

选择部门来筛选下方表格（UI → JS 双向通信）：

\`\`\`x-lang
radio(部门选项, 当前部门)
\`\`\`

\`\`\`x-lang
table(用户列表)
\`\`\`

## 执行 x-lang 代码

\`\`\`x-lang
名字 = "World"
问候 = "Hello, " + 名字 + "!"
问候
\`\`\`

## 普通代码块（Markdown 渲染）

没有 \`x-lang\` 标记的代码块按 Markdown 原样展示：

\`\`\`python
def greet(name):
    return f"Hello, {name}!"
\`\`\`

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
\`\`\`

## JS 注入变量 → x-lang 渲染

以下变量由 JS 注入：\`公司名\`、\`用户列表\`

\`\`\`x-lang
标题 = 公司名 + " - 员工花名册"
标题
\`\`\`

## 自定义渲染组件

\`\`\`x-lang
tlink("访问百度", "https://www.baidu.com")
\`\`\`

\`\`\`x-lang
tlink("X-Lang GitHub", "https://github.com")
\`\`\`

## Element Plus 按钮

\`\`\`x-lang
button("点击我")
\`\`\`

\`\`\`x-lang
button(text = "成功按钮", type = "success")
\`\`\`

\`\`\`x-lang
button(text = "危险操作", type = "danger", size = "large", onClick = "你点击了危险按钮！")
\`\`\`
`;

const STREAM_CONTENT = `# AI 数据分析报告

你好！我已经收到你提供的员工数据，正在为你生成分析报告。

## 部门筛选

请先选择你想查看的部门：

\`\`\`x-lang
radio(部门选项, 当前部门)
\`\`\`

## 员工花名册

以下是完整的员工列表：

\`\`\`x-lang
table(用户列表)
\`\`\`

## 快速操作

\`\`\`x-lang
button(text = "导出报告", type = "primary")
\`\`\`

\`\`\`x-lang
button(text = "发送邮件", type = "success")
\`\`\`

## 相关链接

\`\`\`x-lang
tlink("查看在线文档", "https://example.com/docs")
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

以上就是本次分析报告的全部内容，如有疑问请随时告诉我。
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
    app.run(editor.getValue(), output);
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
let renderRaf = 0;

function startStream(): void {
  streaming = true;
  streamIndex = 0;
  btnStream.style.display = "none";
  btnStop.style.display = "";
  streamStatus.textContent = "AI 正在输出...";

  app.reset();
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
  cancelAnimationFrame(renderRaf);
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
// 4. Divider drag
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
