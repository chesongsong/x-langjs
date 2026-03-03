import type { OutputSegment } from "@x-lang/interpreter";
import { Xvalue, XRenderable, XArray } from "@x-lang/interpreter";
import type {
  ComponentFactory,
  ComponentHandle,
  ComponentRenderer,
  Disposable,
  EventCallback,
  PendingData,
  RenderContext,
} from "./types.js";

export interface ComponentInstance {
  readonly kind: string;
  readonly index: number;
  readonly handle: ComponentHandle;
}

const IDENTIFIER_RE =
  /^[a-zA-Z_$\u4e00-\u9fff\u3400-\u4dbf][a-zA-Z0-9_$\u4e00-\u9fff\u3400-\u4dbf]*/;

interface RenderedSlot {
  fingerprint: string;
  wrapper: HTMLElement;
  disposables: Disposable[];
  instances: ComponentInstance[];
}

export class RenderEngine {
  private factory: ComponentFactory;
  private eventCallback: EventCallback | undefined;
  private skeletonFactories = new Map<
    string,
    () => ComponentRenderer<PendingData>
  >();

  private slots: RenderedSlot[] = [];
  private errorWrapper: HTMLElement | null = null;
  private errorDisposables: Disposable[] = [];
  private prevErrorHash = "";
  private currentVariables: Readonly<Record<string, unknown>> = {};

  constructor(factory: ComponentFactory) {
    this.factory = factory;
  }

  setFactory(factory: ComponentFactory): void {
    this.factory = factory;
  }

  setEventCallback(cb: EventCallback): void {
    this.eventCallback = cb;
  }

  registerSkeleton(
    name: string,
    factory: () => ComponentRenderer<PendingData>,
  ): void {
    this.skeletonFactories.set(name, factory);
  }

  getInstances(kind?: string): readonly ComponentInstance[] {
    const all = this.slots.flatMap((s) => s.instances);
    if (!kind) return all;
    return all.filter((i) => i.kind === kind);
  }

  renderSegments(
    segments: readonly OutputSegment[],
    errors: readonly { message: string }[],
    container: HTMLElement,
    variables?: Readonly<Record<string, unknown>>,
  ): void {
    this.currentVariables = variables ?? {};
    this.renderErrors(errors, container);
    this.patchSegments(segments, container);
  }

  private renderErrors(
    errors: readonly { message: string }[],
    container: HTMLElement,
  ): void {
    const hash = errors.map((e) => e.message).join("\0");
    if (hash === this.prevErrorHash) return;
    this.prevErrorHash = hash;

    for (const d of this.errorDisposables) d.dispose();
    this.errorDisposables = [];

    if (this.errorWrapper) {
      this.errorWrapper.remove();
      this.errorWrapper = null;
    }

    if (errors.length === 0) return;

    const errDiv = document.createElement("div");
    errDiv.className = "render-errors";
    for (const e of errors) {
      const item = document.createElement("div");
      item.className = "render-error-item";
      item.textContent = e.message;
      errDiv.appendChild(item);
    }

    container.insertBefore(errDiv, container.firstChild);
    this.errorWrapper = errDiv;
  }

  private patchSegments(
    segments: readonly OutputSegment[],
    container: HTMLElement,
  ): void {
    const newFingerprints = segments.map((s) => this.fingerprint(s));

    let firstDiff = 0;
    while (
      firstDiff < this.slots.length &&
      firstDiff < newFingerprints.length
    ) {
      const prev = this.slots[firstDiff]!;
      if (prev.fingerprint !== newFingerprints[firstDiff]) break;
      firstDiff++;
    }

    for (let i = this.slots.length - 1; i >= firstDiff; i--) {
      const slot = this.slots[i]!;
      for (const d of slot.disposables) d.dispose();
      slot.wrapper.remove();
    }
    this.slots.length = firstDiff;

    for (let i = firstDiff; i < segments.length; i++) {
      const segment = segments[i]!;
      const fp = newFingerprints[i]!;
      const slot = this.renderOneSegment(segment, container);
      slot.fingerprint = fp;
      this.slots.push(slot);
    }
  }

  private renderOneSegment(
    segment: OutputSegment,
    container: HTMLElement,
  ): RenderedSlot {
    const slot: RenderedSlot = {
      fingerprint: "",
      wrapper: document.createElement("div"),
      disposables: [],
      instances: [],
    };

    container.appendChild(slot.wrapper);

    switch (segment.type) {
      case "markdown":
        this.renderMarkdown(segment.content, slot);
        break;
      case "codeblock":
        this.renderCodeBlock(segment.language, segment.content, slot);
        break;
      case "pending":
        this.renderPending(segment.language, segment.content, slot);
        break;
      case "scope":
        this.renderScope(segment.result, slot);
        break;
    }

    return slot;
  }

  private fingerprint(segment: OutputSegment): string {
    switch (segment.type) {
      case "markdown":
        return `md\0${segment.content}`;
      case "codeblock":
        return `cb\0${segment.language}\0${segment.content}`;
      case "pending":
        return `pd\0${segment.language}\0${segment.content}`;
      case "scope": {
        const r = segment.result;
        return `sc\0${r.index}\0${r.value.toString()}\0${r.error ?? ""}`;
      }
      default:
        return "";
    }
  }

  private renderMarkdown(content: string, slot: RenderedSlot): void {
    slot.wrapper.className = "render-segment render-markdown";
    const renderer = this.factory.createMarkdownRenderer();
    slot.disposables.push(renderer.render(content, slot.wrapper));
  }

  private renderCodeBlock(
    language: string,
    content: string,
    slot: RenderedSlot,
  ): void {
    slot.wrapper.className = "render-segment render-codeblock";
    const renderer = this.factory.createCodeBlockRenderer();
    slot.disposables.push(renderer.render({ language, content }, slot.wrapper));
  }

  private renderPending(
    language: string,
    content: string,
    slot: RenderedSlot,
  ): void {
    const componentName = this.detectComponentName(content);

    const pendingData: PendingData = {
      language,
      content,
      variables: this.currentVariables,
    };

    if (componentName) {
      const skeletonFactory = this.skeletonFactories.get(componentName);
      if (skeletonFactory) {
        slot.wrapper.className = `render-segment render-pending render-pending-${componentName}`;
        const renderer = skeletonFactory();
        slot.disposables.push(renderer.render(pendingData, slot.wrapper));
        return;
      }
    }

    slot.wrapper.className = "render-segment render-pending";
    const renderer = this.factory.createPendingRenderer();
    slot.disposables.push(renderer.render(pendingData, slot.wrapper));
  }

  private detectComponentName(content: string): string | null {
    const trimmed = content.trim();
    const match = IDENTIFIER_RE.exec(trimmed);
    return match ? match[0] : null;
  }

  private renderScope(
    result: { value: Xvalue; error?: string },
    slot: RenderedSlot,
  ): void {
    if (result.error) {
      slot.wrapper.className = "render-segment render-error-item";
      slot.wrapper.textContent = result.error;
      return;
    }

    const value = result.value;

    if (value instanceof XArray) {
      const renderables = value.elements.filter(
        (item) => item instanceof XRenderable,
      ) as XRenderable[];
      if (renderables.length > 0 && renderables.length === value.elements.length) {
        slot.wrapper.className = "render-segment render-scope";
        for (const renderable of renderables) {
          const renderer = this.factory.createRenderer(renderable.kind);
          if (!renderer) continue;
          const itemWrapper = document.createElement("div");
          itemWrapper.className = `render-segment render-${renderable.kind}`;
          slot.wrapper.appendChild(itemWrapper);

          const kind = renderable.kind;
          const ctx = this.createRenderContext(kind);
          const handle = renderer.render(renderable.renderData, itemWrapper, ctx);

          slot.disposables.push(handle);
          slot.instances.push({
            kind,
            index: this.countKind(kind),
            handle: handle as ComponentHandle,
          });
        }
        return;
      }
    }

    if (value instanceof XRenderable) {
      const renderer = this.factory.createRenderer(value.kind);
      if (renderer) {
        slot.wrapper.className = `render-segment render-${value.kind}`;
        const kind = value.kind;
        const ctx = this.createRenderContext(kind);
        const handle = renderer.render(value.renderData, slot.wrapper, ctx);

        slot.disposables.push(handle);
        slot.instances.push({
          kind,
          index: this.countKind(kind),
          handle: handle as ComponentHandle,
        });
        return;
      }
    }

    const formatted = value.toString();
    slot.wrapper.className = "render-segment render-scope";
    const renderer = this.factory.createMarkdownRenderer();
    slot.disposables.push(renderer.render(formatted, slot.wrapper));
  }

  private countKind(kind: string): number {
    let count = 0;
    for (const slot of this.slots) {
      for (const inst of slot.instances) {
        if (inst.kind === kind) count++;
      }
    }
    return count;
  }

  private createRenderContext(kind: string): RenderContext {
    return {
      emit: (event: string, payload?: unknown) => {
        this.eventCallback?.(kind, event, payload);
      },
    };
  }

  disposeAll(): void {
    for (const slot of this.slots) {
      for (const d of slot.disposables) d.dispose();
      slot.wrapper.remove();
    }
    this.slots = [];

    for (const d of this.errorDisposables) d.dispose();
    this.errorDisposables = [];
    if (this.errorWrapper) {
      this.errorWrapper.remove();
      this.errorWrapper = null;
    }
    this.prevErrorHash = "";
  }
}
