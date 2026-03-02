import type {
  ComponentFactory,
  ComponentRenderer,
  CodeBlockData,
  PendingData,
} from "@x-lang/render";
import { RenderEngine } from "@x-lang/render";
import type { ComponentInstance } from "@x-lang/render";
import { run } from "./xlang.js";
import type { ComponentDefinition } from "./define-component.js";
import { EventBus } from "./event-bus.js";
import type { EventHandler } from "./event-bus.js";

// ---------------------------------------------------------------------------
// Internal: Decorator over user-supplied base factory
// ---------------------------------------------------------------------------

class AppComponentFactory implements ComponentFactory {
  private readonly renderers = new Map<string, () => ComponentRenderer>();

  constructor(private readonly base: ComponentFactory) {}

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

  constructor(baseFactory: ComponentFactory) {
    this.factory = new AppComponentFactory(baseFactory);
    this.engine = new RenderEngine(this.factory);
    this.engine.setEventCallback((kind, event, payload) => {
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
    const target = instances.find((i) => i.index === index);
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
