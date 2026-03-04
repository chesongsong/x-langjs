import type {
  ComponentFactory,
  ComponentRenderer,
  CodeBlockData,
  PendingData,
} from "@x-langjs/render";
import { RenderEngine } from "@x-langjs/render";
import type { ComponentInstance } from "@x-langjs/render";
import { run } from "./xlang.js";
import type { ComponentDefinition } from "./define-component.js";
import { EventBus } from "./event-bus.js";
import type { EventHandler } from "./event-bus.js";

// ---------------------------------------------------------------------------
// Built-in fallback renderers (no external dependencies)
// ---------------------------------------------------------------------------

const BUILTIN_FACTORY: ComponentFactory = {
  createMarkdownRenderer() {
    return {
      render(content: string, container: HTMLElement) {
        const el = document.createElement("div");
        el.textContent = content;
        container.appendChild(el);
        return { dispose: () => el.remove() };
      },
    };
  },
  createCodeBlockRenderer() {
    return {
      render(data: CodeBlockData, container: HTMLElement) {
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = data.content;
        pre.appendChild(code);
        container.appendChild(pre);
        return { dispose: () => pre.remove() };
      },
    };
  },
  createPendingRenderer() {
    return {
      render(_: PendingData, container: HTMLElement) {
        const el = document.createElement("span");
        el.textContent = "…";
        container.appendChild(el);
        return { dispose: () => el.remove() };
      },
    };
  },
  createRenderer() {
    return null;
  },
};

// ---------------------------------------------------------------------------
// Internal: Decorator over user-supplied (partial) factory + built-in fallback
// ---------------------------------------------------------------------------

class AppComponentFactory implements ComponentFactory {
  private readonly renderers = new Map<string, () => ComponentRenderer>();
  private readonly base: ComponentFactory;

  constructor(partial?: Partial<ComponentFactory>) {
    this.base = {
      createMarkdownRenderer:
        partial?.createMarkdownRenderer?.bind(partial) ??
        BUILTIN_FACTORY.createMarkdownRenderer.bind(BUILTIN_FACTORY),
      createCodeBlockRenderer:
        partial?.createCodeBlockRenderer?.bind(partial) ??
        BUILTIN_FACTORY.createCodeBlockRenderer.bind(BUILTIN_FACTORY),
      createPendingRenderer:
        partial?.createPendingRenderer?.bind(partial) ??
        BUILTIN_FACTORY.createPendingRenderer.bind(BUILTIN_FACTORY),
      createRenderer:
        partial?.createRenderer?.bind(partial) ??
        BUILTIN_FACTORY.createRenderer.bind(BUILTIN_FACTORY),
    };
  }

  register(name: string, factory: () => ComponentRenderer): void {
    this.renderers.set(name, factory);
  }

  createMarkdownRenderer(): ComponentRenderer<string> {
    return this.base.createMarkdownRenderer();
  }

  createCodeBlockRenderer(): ComponentRenderer<CodeBlockData> {
    return this.base.createCodeBlockRenderer();
  }

  createPendingRenderer(): ComponentRenderer<PendingData> {
    return this.base.createPendingRenderer();
  }

  createRenderer(type: string): ComponentRenderer | null {
    const fn = this.renderers.get(type);
    if (fn) return fn();
    return this.base.createRenderer(type);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export class XLangApp {
  private readonly components: ComponentDefinition[] = [];
  private readonly factory: AppComponentFactory;
  private readonly engine: RenderEngine;
  private readonly bus = new EventBus();
  private vars: Record<string, unknown> = {};

  constructor(baseFactory?: Partial<ComponentFactory>) {
    this.factory = new AppComponentFactory(baseFactory);
    this.engine = new RenderEngine(this.factory);
    this.engine.setEventCallback((kind: string, event: string, payload: unknown) => {
      this.bus.emit(EventBus.buildKey(kind, event), payload);
    });
  }

  use(component: ComponentDefinition): this {
    this.components.push(component);
    this.factory.register(
      component.name,
      component.createRenderer as () => ComponentRenderer,
    );
    if (component.createSkeletonRenderer) {
      this.engine.registerSkeleton(
        component.name,
        component.createSkeletonRenderer,
      );
    }
    return this;
  }

  provide(variables: Record<string, unknown>): this {
    Object.assign(this.vars, variables);
    return this;
  }

  on(component: string, event: string, handler: EventHandler): this {
    this.bus.on(EventBus.buildKey(component, event), handler);
    return this;
  }

  off(component: string, event: string, handler?: EventHandler): this {
    this.bus.off(EventBus.buildKey(component, event), handler);
    return this;
  }

  getInstances(kind?: string): readonly ComponentInstance[] {
    return this.engine.getInstances(kind);
  }

  updateInstance(kind: string, index: number, data: unknown): void {
    const instances = this.engine.getInstances(kind);
    const target = instances.find((i: ComponentInstance) => i.index === index);
    if (target?.handle.update) {
      target.handle.update(data);
    }
  }

  reset(): this {
    this.engine.disposeAll();
    return this;
  }

  run(source: string, container: HTMLElement): void {
    const builtins = this.components.map((c) => c.renderable);
    const { segments, errors } = run(source, {
      variables: this.vars,
      builtins,
    });
    this.engine.renderSegments(segments, errors, container, this.vars);
  }
}
