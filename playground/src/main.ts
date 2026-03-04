import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { XLangApp } from "@x-langjs/core";
import { ElementComponentFactory } from "./renderers/element-factory";
import { createComponents, type UILib } from "./components/_registry";
import { registerXLang, createXLangTheme, XLANG_ID } from "./monaco-lang";
import { STATIC_CODE, STREAM_CONTENT } from "./demo-content";
import { initSimpleDemo } from "./simple-demo";
import { initConversationDemo } from "./conversation-demo";
import "@arco-design/web-vue/dist/arco.css";
import "element-plus/dist/index.css";
import "@arco-design/web-vue/es/collapse/style/css.js";
import "@arco-design/web-vue/es/timeline/style/css.js";
import "element-plus/es/components/collapse/style/css";
import "element-plus/es/components/timeline/style/css";
import "github-markdown-css/github-markdown-light.css";
import "./style.css";

// ---------------------------------------------------------------------------
// Tab 切换（简单 Demo / 对话 Demo / 复杂 Demo）
// ---------------------------------------------------------------------------
const panelSimple       = document.getElementById("panel-simple")!;
const panelConversation = document.getElementById("panel-conversation")!;
const panelComplex      = document.getElementById("panel-complex")!;
const demoTabs          = document.querySelectorAll<HTMLButtonElement>(".demo-tab");

type TabId = "simple" | "conversation" | "complex";
const inited = new Set<TabId>();

function switchTab(tab: TabId) {
  panelSimple.style.display       = tab === "simple"       ? "" : "none";
  panelConversation.style.display = tab === "conversation" ? "" : "none";
  panelComplex.style.display      = tab === "complex"      ? "" : "none";
  demoTabs.forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));

  if (!inited.has(tab)) {
    inited.add(tab);
    if (tab === "simple")       initSimpleDemo();
    if (tab === "conversation") initConversationDemo();
  }
}

demoTabs.forEach(btn => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab as TabId));
});

// 默认初始化简单 Demo
switchTab("simple");

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

/** Demo 数据已写在各 \`\`\`x-langjs\`\`\` 块内，此处仅注入必要变量。 */
const sharedData: Record<string, unknown> = {
  当前时间: new Date("2026-02-28T14:30:00"),
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
