import type {
  ComponentHandle,
  ComponentRenderer,
  Disposable,
  PendingData,
  RenderContext,
} from "@x-langjs/render";
import { defineRenderable } from "./define-renderable.js";
import type {
  RenderableDefinition,
  RenderableHandler,
  AdvancedRenderableHandler,
  RenderableContext,
} from "./define-renderable.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type { RenderableContext };

export type SimpleSetup<T = unknown> = (
  args: unknown[],
  named: Record<string, unknown>,
) => T;

export interface AdvancedSetup<T = unknown> {
  execute(ctx: RenderableContext): T;
}

export type RenderFn<T = unknown> = (
  data: T,
  container: HTMLElement,
  ctx: RenderContext,
) => ComponentHandle<T> | void;

export interface SkeletonContext {
  readonly content: string;
  readonly variables: Readonly<Record<string, unknown>>;
}

export type SkeletonFn = (
  container: HTMLElement,
  ctx: SkeletonContext,
) => Disposable;

export interface ComponentDefinition<T = unknown> {
  readonly name: string;
  readonly renderable: RenderableDefinition;
  readonly createRenderer: () => ComponentRenderer<T>;
  readonly createSkeletonRenderer?: () => ComponentRenderer<PendingData>;
}

// ---------------------------------------------------------------------------
// Overloaded options
// ---------------------------------------------------------------------------

export interface SimpleComponentOptions<T> {
  setup: SimpleSetup<T>;
  render: RenderFn<T>;
  skeleton?: SkeletonFn;
}

export interface AdvancedComponentOptions<T> {
  setup: AdvancedSetup<T>;
  render: RenderFn<T>;
  skeleton?: SkeletonFn;
}

export type ComponentOptions<T> =
  | SimpleComponentOptions<T>
  | AdvancedComponentOptions<T>;

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

function isAdvancedSetup<T>(
  setup: SimpleSetup<T> | AdvancedSetup<T>,
): setup is AdvancedSetup<T> {
  return typeof setup === "object" && setup !== null && "execute" in setup;
}

export function defineComponent<T>(
  name: string,
  options: ComponentOptions<T>,
): ComponentDefinition<T> {
  const handler: RenderableHandler | AdvancedRenderableHandler =
    isAdvancedSetup(options.setup)
      ? options.setup
      : (options.setup as RenderableHandler);

  const renderable = defineRenderable(name, handler);
  const renderFn = options.render;
  const skeletonFn = options.skeleton;

  const createSkeletonRenderer = skeletonFn
    ? () => ({
        render(data: PendingData, container: HTMLElement): Disposable {
          return skeletonFn(container, {
            content: data.content,
            variables: data.variables ?? {},
          });
        },
      })
    : undefined;

  return {
    name,
    renderable,
    createRenderer: () => ({
      render: (value: T, container: HTMLElement, ctx?: RenderContext) =>
        renderFn(value, container, ctx ?? { emit: () => {} }),
    }),
    createSkeletonRenderer,
  };
}
