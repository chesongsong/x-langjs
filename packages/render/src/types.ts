export interface Disposable {
  dispose(): void;
}

export interface ComponentHandle<T = unknown> extends Disposable {
  update?(data: T): void;
}

export interface RenderContext {
  emit(event: string, payload?: unknown): void;
}

export type EventCallback = (
  componentKind: string,
  event: string,
  payload: unknown,
) => void;

export interface ComponentRenderer<T = unknown> {
  render(
    value: T,
    container: HTMLElement,
    ctx?: RenderContext,
  ): Disposable | ComponentHandle<T> | void;
}

export interface CodeBlockData {
  readonly language: string;
  readonly content: string;
}

export interface PendingData {
  readonly language: string;
  readonly content: string;
  readonly variables?: Readonly<Record<string, unknown>>;
}

export interface ComponentFactory {
  createMarkdownRenderer(): ComponentRenderer<string>;
  createCodeBlockRenderer(): ComponentRenderer<CodeBlockData>;
  createPendingRenderer(): ComponentRenderer<PendingData>;
  createRenderer(type: string): ComponentRenderer | null;
}

/** All methods are optional; unimplemented ones fall back to built-in defaults in XLangApp. */
export type PartialComponentFactory = Partial<ComponentFactory>;
