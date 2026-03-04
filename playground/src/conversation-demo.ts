/**
 * 对话 Demo
 *
 * 演示 ConversationRenderer 的完整使用方式：
 *  - 每条 AI 消息独立渲染，互不干扰
 *  - 模拟流式输出（每隔 30ms 追加一段内容）
 *  - 组件定义只创建一次，注入所有消息
 *  - 通过 onEvent 统一监听所有消息中的 UI 事件
 */

import { ConversationRenderer } from "./conversation-renderer";
import { createComponents } from "./components/_registry";

// ─── 场景内容 ──────────────────────────────────────────────────────────────
const SCENARIOS = {
  button: `好的，这是一个按钮示例：

\`\`\`x-langjs
button("确认操作", type="primary")
\`\`\`

点击按钮可以触发交互事件。`,

  table: `为你生成一份数据表格：

\`\`\`x-langjs
table(
  [
    { 姓名: "张三", 部门: "研发", 薪资: 18000 },
    { 姓名: "李四", 部门: "产品", 薪资: 16000 },
    { 姓名: "王五", 部门: "设计", 薪资: 15000 }
  ]
)
\`\`\`

以上是员工数据概览。`,

  mixed: `这是一份综合回复，包含多种组件：

## 操作建议

请确认以下操作：

\`\`\`x-langjs
button("同意", type="primary")
button("拒绝", type="danger")
\`\`\`

## 当前数据

\`\`\`x-langjs
table([
  { 项目: "任务 A", 状态: "进行中", 进度: "60%" },
  { 项目: "任务 B", 状态: "已完成", 进度: "100%" }
])
\`\`\``,
};

// ─── 模拟流式输出 ─────────────────────────────────────────────────────────
function simulateStream(
  fullText: string,
  onChunk: (partial: string) => void,
  onDone: () => void,
  chunkSize = 8,
  intervalMs = 30,
): () => void {
  let pos = 0;
  const id = setInterval(() => {
    pos = Math.min(pos + chunkSize, fullText.length);
    onChunk(fullText.slice(0, pos));
    if (pos >= fullText.length) {
      clearInterval(id);
      onDone();
    }
  }, intervalMs);
  return () => clearInterval(id);
}

// ─── 添加用户消息气泡 ─────────────────────────────────────────────────────
function appendUserMessage(container: HTMLElement, text: string) {
  const el = document.createElement("div");
  el.className = "conv-message conv-user-message conv-message--done";
  el.textContent = text;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

// ─── 初始化入口 ────────────────────────────────────────────────────────────
export function initConversationDemo() {
  const messagesEl = document.getElementById("conv-messages")!;
  const sendBtn    = document.getElementById("conv-send")!;
  const clearBtn   = document.getElementById("conv-clear")!;
  const scenario   = document.getElementById("conv-scenario") as HTMLSelectElement;

  // 共享的组件定义（只创建一次）
  const components = createComponents("antd");

  // 创建 ConversationRenderer
  const renderer = new ConversationRenderer(messagesEl, { components });

  let msgCounter = 0;
  let streamCancel: (() => void) | null = null;

  function sendMessage() {
    if (streamCancel) streamCancel(); // 中止上一次未完成的流

    const key = scenario.value as keyof typeof SCENARIOS;
    const content = SCENARIOS[key];
    const userLabel: Record<string, string> = {
      button: "发送一个按钮示例",
      table:  "发送一张数据表格",
      mixed:  "发送混合内容示例",
    };

    // 用户气泡
    appendUserMessage(messagesEl, userLabel[key]);

    // AI 消息气泡（流式）
    const id = `msg-${++msgCounter}`;
    const handle = renderer.addMessage(id);

    streamCancel = simulateStream(
      content,
      (partial) => handle.update(partial),
      () => { handle.finalize(); streamCancel = null; },
    );
  }

  sendBtn.addEventListener("click", sendMessage);

  clearBtn.addEventListener("click", () => {
    if (streamCancel) { streamCancel(); streamCancel = null; }
    renderer.disposeAll();
    document.getElementById("conv-event-log")!.innerHTML = "";
    msgCounter = 0;
  });
}
