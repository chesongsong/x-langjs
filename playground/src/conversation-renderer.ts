/**
 * ConversationRenderer — 多轮对话渲染架构
 *
 * 设计原则：
 *  - 每条 AI 消息对应一个独立的 XLangApp 实例 + DOM 容器（互不干扰）
 *  - ComponentDefinition 在 ConversationRenderer 层面只定义一次，注册到每个消息的 app
 *  - 流式更新：反复调用 handle.update(partialMarkdown)，引擎增量 patch，只重绘变化部分
 *  - 消息生命周期：create → update(streaming) → finalize → (可选) dispose
 */

import { XLangApp, type ComponentDefinition, type PartialComponentFactory } from "@x-langjs/core";

// ─── 单条消息的操作句柄 ───────────────────────────────────────────────────
export interface MessageHandle {
  /** 更新消息内容（流式时反复调用） */
  update(markdown: string): void;
  /** 标记消息输出完成 */
  finalize(): void;
  /** 销毁消息：卸载所有渲染组件并从 DOM 移除 */
  dispose(): void;
  /** 消息容器 DOM 节点 */
  readonly el: HTMLElement;
}

// ─── ConversationRenderer 配置 ───────────────────────────────────────────
export interface ConversationOptions {
  /** 共享的自定义组件定义（只创建一次，每条消息自动注册） */
  components?: ComponentDefinition[];
  /** 可选的 ComponentFactory 局部覆盖 */
  factory?: PartialComponentFactory;
  /** 统一事件回调：某条消息中某个组件触发了事件 */
  onEvent?: (messageId: string, component: string, event: string, payload: unknown) => void;
}

// ─── 核心类 ────────────────────────────────────────────────────────────────
export class ConversationRenderer {
  private readonly messages = new Map<string, MessageHandle>();

  constructor(
    /** 消息列表挂载点（滚动容器） */
    private readonly container: HTMLElement,
    private readonly options: ConversationOptions = {},
  ) {}

  /**
   * 新增一条 AI 消息。
   * 返回 handle，通过 handle.update() 推送流式内容，handle.finalize() 标记完成。
   */
  addMessage(id: string): MessageHandle {
    // 1. 创建独立的 DOM 容器
    const el = document.createElement("div");
    el.className = "conv-message conv-message--streaming";
    el.dataset.messageId = id;
    this.container.appendChild(el);
    this.scrollToBottom();

    // 2. 为这条消息创建独立的 XLangApp（开销极小）
    const app = new XLangApp(this.options.factory);
    for (const comp of this.options.components ?? []) {
      app.use(comp);
    }

    // 3. 转发组件事件到外层回调
    if (this.options.onEvent) {
      const onEvent = this.options.onEvent;
      for (const comp of this.options.components ?? []) {
        // 对每个已注册组件监听所有常见事件
        for (const event of ["click", "change", "submit", "select"]) {
          app.on(comp.name, event, (payload) => onEvent(id, comp.name, event, payload));
        }
      }
    }

    const handle: MessageHandle = {
      el,

      update(markdown: string) {
        app.run(markdown, el);
      },

      finalize() {
        el.classList.remove("conv-message--streaming");
        el.classList.add("conv-message--done");
      },

      dispose() {
        app.reset();
        el.remove();
      },
    };

    this.messages.set(id, handle);
    return handle;
  }

  /** 获取已有消息的 handle */
  getMessage(id: string): MessageHandle | undefined {
    return this.messages.get(id);
  }

  /** 销毁指定消息 */
  disposeMessage(id: string): void {
    this.messages.get(id)?.dispose();
    this.messages.delete(id);
  }

  /** 销毁全部消息 */
  disposeAll(): void {
    for (const handle of this.messages.values()) {
      handle.dispose();
    }
    this.messages.clear();
  }

  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      this.container.scrollTop = this.container.scrollHeight;
    });
  }
}
