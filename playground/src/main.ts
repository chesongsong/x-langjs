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

/** Demo 数据已写在各 \`\`\`x-lang\`\`\` 块内，此处仅注入必要变量。 */
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

const STATIC_CODE = `# X-Lang 组件一览

本页面展示所有可用的 x-lang 渲染组件，每种组件提供多种用法示例。

---

## 0. 语法清单（精简）

关键字：\`fn\` \`return\` \`if\` \`else\` \`while\` \`for\` \`break\` \`continue\` \`true\` \`false\` \`null\` \`typeof\`
类型：\`number\` \`string\` \`boolean\` \`void\`
运算符：\`+\` \`-\` \`*\` \`/\` \`%\` \`=\` \`+=\` \`-=\` \`*=\` \`/=\` \`==\` \`!=\` \`<\` \`>\` \`<=\` \`>=\` \`&&\` \`||\` \`!\`

### 赋值运算符与比较/逻辑

\`\`\`x-lang
计数 = 1
计数 += 2
计数 *= 3
满足条件 = (计数 >= 9) && (计数 != 10)
\`\`\`

### 函数 / 控制流 / return

\`\`\`x-lang
求和(起始: number, 结束: number) {
  合计 = 0
  for (i = 起始; i <= 结束; i += 1) {
    合计 += i
  }
  return 合计;
}
\`\`\`

### 数组 / 对象 / typeof

\`\`\`x-lang
数组 = [1, 2, 3, 4]
对象 = { 名称: "计算器", 版本: 1 }
第三项 = 数组[2]
类型名 = typeof 对象.版本
\`\`\`

---

## 1. 语法与计算 Demo

\`\`\`x-lang
基础运算 = 8 + 4 * 2 - 3
整除余数 = 17 % 5
对比结果 = (基础运算 > 10) && (整除余数 == 2)
\`\`\`

\`\`\`x-lang
文本 = "Hello"
拼接 = 文本 + " x-lang"
\`\`\`

\`\`\`x-lang
数组 = [1, 2, 3, 4]
对象 = { 名称: "计算器", 版本: 1 }
数组[2] + 对象.版本
\`\`\`

\`\`\`x-lang
税率 = 0.06
计算税 = fn(金额) => 金额 * 税率
计算税(200)
\`\`\`

\`\`\`x-lang
日期 = 当前时间
日期字符串 = "当前时间: " + 日期
时间戳 = 日期 + 0
descriptions({ 日期字符串: 日期字符串, 时间戳: 时间戳 })
\`\`\`

\`\`\`x-lang
分数 = 86
评价 = ""
if (分数 >= 90) { 评价 = "优秀"; }
else if (分数 >= 60) { 评价 = "及格"; }
else { 评价 = "不及格"; }
\`\`\`

\`\`\`x-lang
总和 = 0
for (i = 1; i <= 5; i += 1) {
  总和 += i
}
\`\`\`

\`\`\`x-lang
计数 = 0
累加 = 0
while (true) {
  计数 += 1
  if (计数 == 2) { continue; }
  if (计数 > 4) { break; }
  累加 += 计数
}
\`\`\`

\`\`\`x-lang
求和(起始, 结束) {
  合计 = 0
  for (i = 起始; i <= 结束; i += 1) {
    合计 += i
  }
  return 合计
}
求和(1, 10)
\`\`\`

---

## 2. Alert 提示

\`\`\`x-lang
alert(title = "欢迎", description = "支持标题与描述，type 为 info。", type = "info")
\`\`\`

\`\`\`x-lang
alert(title = "操作成功", type = "success")
\`\`\`

\`\`\`x-lang
alert(title = "注意", description = "某些配置可能影响性能。", type = "warning")
\`\`\`

\`\`\`x-lang
alert(title = "请求失败", description = "请检查网络后重试。", type = "error")
\`\`\`

---

## 3. Statistic 统计数值

\`\`\`x-lang
statistic("员工总数", 4)
\`\`\`

\`\`\`x-lang
statistic(title = "平均薪资", value = 26250, suffix = "元")
\`\`\`

\`\`\`x-lang
statistic(title = "年度营收", value = 1200000, prefix = "¥", suffix = "")
\`\`\`

\`\`\`x-lang
statistic("项目完成度", 100)
\`\`\`

---

## 4. Progress 进度条

\`\`\`x-lang
项目进度 = 78
progress(项目进度, status = "success")
\`\`\`

\`\`\`x-lang
完成度 = 65
progress(完成度, status = "warning")
\`\`\`

\`\`\`x-lang
progress(65, status = "exception")
\`\`\`

\`\`\`x-lang
progress(100)
\`\`\`

---

## 5. Tag 标签

\`\`\`x-lang
tag("工程部", "设计部", "产品部", type = "primary")
\`\`\`

\`\`\`x-lang
tag("已完成", "已通过", type = "success")
\`\`\`

\`\`\`x-lang
tag("待审核", "处理中", type = "warning")
\`\`\`

\`\`\`x-lang
tag("已拒绝", "已取消", type = "danger")
\`\`\`

\`\`\`x-lang
tag("标签一", "标签二", "标签三", type = "info")
\`\`\`

---

## 6. Rate 评分

\`\`\`x-lang
团队评分 = 4.5
rate(团队评分)
\`\`\`

\`\`\`x-lang
满意度 = 4.8
rate(满意度)
\`\`\`

\`\`\`x-lang
rate(4)
\`\`\`

---

## 7. Descriptions 描述列表

\`\`\`x-lang
公司信息 = { 名称: "X-Lang 科技", 行业: "软件开发", 成立年份: 2024, 地址: "上海市浦东新区" }
descriptions(公司信息)
\`\`\`

\`\`\`x-lang
公司信息 = { 名称: "X-Lang 科技", 行业: "软件开发", 成立年份: 2024, 地址: "上海市浦东新区" }
descriptions(公司信息, column = 1)
\`\`\`

---

## 8. Table 表格

\`\`\`x-lang
用户列表 = [{ 姓名: "张三", 部门: "工程部", 薪资: 25000 }, { 姓名: "李四", 部门: "设计部", 薪资: 22000 }, { 姓名: "王五", 部门: "产品部", 薪资: 28000 }, { 姓名: "赵六", 部门: "工程部", 薪资: 30000 }]
table(用户列表)
\`\`\`

\`\`\`x-lang
用户列表 = [{ 姓名: "张三", 部门: "工程部", 薪资: 25000 }, { 姓名: "李四", 部门: "设计部", 薪资: 22000 }, { 姓名: "王五", 部门: "产品部", 薪资: 28000 }, { 姓名: "赵六", 部门: "工程部", 薪资: 30000 }]
table(用户列表, 姓名, 部门, 薪资)
\`\`\`

---

## 9. Button 按钮

\`\`\`x-lang
button(text = "主要按钮", type = "primary")
\`\`\`

\`\`\`x-lang
button(text = "成功按钮", type = "success")
\`\`\`

\`\`\`x-lang
button(text = "警告按钮", type = "warning")
\`\`\`

\`\`\`x-lang
button(text = "危险按钮", type = "danger")
\`\`\`

\`\`\`x-lang
button(text = "小号按钮", type = "primary", size = "small")
\`\`\`

\`\`\`x-lang
button(text = "大号按钮", type = "default", size = "large")
\`\`\`

\`\`\`x-lang
button(text = "点我提示", onClick = "操作成功！")
\`\`\`

---

## 10. Card 卡片

\`\`\`x-lang
card(title = "项目概要", content = "本季度共完成 3 个里程碑，团队整体表现优异。")
\`\`\`

\`\`\`x-lang
card(title = "无阴影", content = "shadow = never 时卡片无阴影。", shadow = "never")
\`\`\`

\`\`\`x-lang
card(title = "常显阴影", content = "shadow = always 时阴影始终显示。", shadow = "always")
\`\`\`

\`\`\`x-lang
card("仅内容", "不传 title 时只显示内容区域。")
\`\`\`

---

## 11. OrderCard 订单详情卡

\`\`\`x-lang
订单 = { 订单号: "O202402280001", 状态: "已支付", 金额: 299, 下单时间: "2026-02-28 14:30", 商品列表: [{ 商品名: "X-Lang 入门教程", 数量: 1, 单价: 99 }, { 商品名: "组件开发实战", 数量: 2, 单价: 100 }], 收货地址: "上海市浦东新区张江镇 XX 路 100 号" }
OrderCard(订单)
\`\`\`

\`\`\`x-lang
订单2 = { 订单号: "O202402280002", 状态: "待发货", 金额: 158, 下单时间: "2026-02-27 09:15", 商品列表: [{ 商品名: "实战手册", 数量: 1, 单价: 158 }], 收货地址: "北京市海淀区中关村大街 1 号" }
OrderCard(订单2)
\`\`\`

\`\`\`x-lang
OrderCard(订单号 = "O2024000001", 状态 = "已完成", 金额 = 88, 下单时间 = "2026-01-01 12:00", 收货地址 = "示例地址")
\`\`\`

---

## 12. Result 结果页

\`\`\`x-lang
result(title = "页面加载完成", subtitle = "所有组件已渲染成功。", type = "success")
\`\`\`

\`\`\`x-lang
result(title = "暂无数据", subtitle = "请先导入或创建数据。", type = "info")
\`\`\`

\`\`\`x-lang
result(title = "操作失败", subtitle = "请稍后重试或联系管理员。", type = "error")
\`\`\`

\`\`\`x-lang
result(title = "请确认", subtitle = "当前操作可能产生风险。", type = "warning")
\`\`\`

---

## 小结

以上覆盖了 **alert、statistic、progress、tag、rate、descriptions、table、button、card、OrderCard、result** 共 11 类组件，可切换顶部组件库查看不同 UI 风格。
`;

const STREAM_CONTENT = `# Xxxxx 科技 · 年度分析报告

你好！以下是根据你提供的数据为 **Xxxxx 科技** 生成的年度分析报告，涵盖所有组件类型。

\`\`\`x-lang
alert(title = "数据已更新", description = "以下数据截至 2026 年 Q1，已包含最新季度信息。", type = "info")
\`\`\`

## 公司概览

\`\`\`x-lang
公司信息 = { 名称: "X-Lang 科技", 行业: "软件开发", 成立年份: 2024, 地址: "上海市浦东新区" }
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
statistic(title = "完成度", value = 78, suffix = "%")
\`\`\`

\`\`\`x-lang
项目进度 = 78
progress(项目进度, status = "success")
\`\`\`

\`\`\`x-lang
完成度 = 65
progress(完成度, status = "warning")
\`\`\`

## 部门与状态

\`\`\`x-lang
tag("工程部", "设计部", "产品部", type = "primary")
\`\`\`

\`\`\`x-lang
tag("已完成", "进行中", type = "success")
\`\`\`

## 员工花名册

\`\`\`x-lang
用户列表 = [{ 姓名: "张三", 部门: "工程部", 薪资: 25000 }, { 姓名: "李四", 部门: "设计部", 薪资: 22000 }, { 姓名: "王五", 部门: "产品部", 薪资: 28000 }, { 姓名: "赵六", 部门: "工程部", 薪资: 30000 }]
table(用户列表)
\`\`\`

\`\`\`x-lang
用户列表 = [{ 姓名: "张三", 部门: "工程部", 薪资: 25000 }, { 姓名: "李四", 部门: "设计部", 薪资: 22000 }, { 姓名: "王五", 部门: "产品部", 薪资: 28000 }, { 姓名: "赵六", 部门: "工程部", 薪资: 30000 }]
table(用户列表, 姓名, 部门, 薪资)
\`\`\`

## 评价与反馈

\`\`\`x-lang
团队评分 = 4.5
rate(团队评分)
\`\`\`

\`\`\`x-lang
满意度 = 4.8
rate(满意度)
\`\`\`

\`\`\`x-lang
alert(title = "指标说明", description = "团队评分与满意度由上月调研汇总。", type = "info")
\`\`\`

## 快速操作

\`\`\`x-lang
button(text = "导出报告", type = "primary")
\`\`\`

\`\`\`x-lang
button(text = "发送邮件", type = "success")
\`\`\`

\`\`\`x-lang
button(text = "点我提示", onClick = "报告已复制到剪贴板")
\`\`\`

## 项目与订单

\`\`\`x-lang
card(title = "项目概要", content = "本季度共完成 3 个里程碑，团队整体表现优异。")
\`\`\`

\`\`\`x-lang
订单 = { 订单号: "O202402280001", 状态: "已支付", 金额: 299, 下单时间: "2026-02-28 14:30", 商品列表: [{ 商品名: "X-Lang 入门教程", 数量: 1, 单价: 99 }, { 商品名: "组件开发实战", 数量: 2, 单价: 100 }], 收货地址: "上海市浦东新区张江镇 XX 路 100 号" }
OrderCard(订单)
\`\`\`

\`\`\`x-lang
订单2 = { 订单号: "O202402280002", 状态: "待发货", 金额: 158, 下单时间: "2026-02-27 09:15", 商品列表: [{ 商品名: "实战手册", 数量: 1, 单价: 158 }], 收货地址: "北京市海淀区中关村大街 1 号" }
OrderCard(订单2)
\`\`\`

## 代码演示

\`\`\`x-lang
公司名 = "X-Lang 科技"
总人数 = 4
标题 = 公司名 + " 共有 " + 总人数 + " 名员工"
\`\`\`

## 总结

\`\`\`x-lang
result(title = "报告生成完毕", subtitle = "已为你分析 4 名员工数据，如有疑问请随时告诉我。", type = "success")
\`\`\`

\`\`\`x-lang
alert(title = "感谢使用", description = "可切换顶部 Element / Arco / Ant Design 查看不同 UI 风格。", type = "success")
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
