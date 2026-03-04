// High-level API
export { parse, run, tokenize } from "./xlang.js";
export type { ParseOptions, RunOptions, ParseOutput, RunOutput } from "./xlang.js";

// Application facade
export { XLangApp } from "./app.js";

// Component definition API (all-in-one: setup + render)
export { defineComponent } from "./define-component.js";
export type {
  ComponentDefinition,
  ComponentOptions,
  SimpleComponentOptions,
  AdvancedComponentOptions,
  SimpleSetup,
  AdvancedSetup,
  RenderFn,
  SkeletonFn,
  SkeletonContext,
} from "./define-component.js";

// Render types (re-export for convenience)
export type {
  Disposable,
  ComponentHandle,
  RenderContext,
  EventCallback,
  ComponentRenderer,
  ComponentFactory,
  PartialComponentFactory,
  ComponentInstance,
  CodeBlockData,
  PendingData,
} from "@x-langjs/render";
export { RenderEngine } from "@x-langjs/render";

// Event system
export { EventBus } from "./event-bus.js";
export type { EventHandler } from "./event-bus.js";

// AST builder, scope resolver & visitor
export { ASTBuilder, ScopeResolver } from "@x-langjs/ast";
export { type ASTVisitor, visitNode } from "@x-langjs/ast";

// Value domain — basic types
export {
  Xvalue,
  XNumber,
  XString,
  XBool,
  XNull,
  XArray,
  XObject,
  XFunction,
  XDate,
  box,
} from "@x-langjs/interpreter";

// Renderables — UI-renderable value types
export { XRenderable, XRenderCustom } from "@x-langjs/interpreter";

// Renderable definition API
export { defineRenderable } from "./define-renderable.js";
export type {
  RenderableDefinition,
  RenderableHandler,
  RenderableContext,
  AdvancedRenderableHandler,
} from "./define-renderable.js";

// Interpreter & execution
export { Interpreter, execute } from "@x-langjs/interpreter";
export type {
  ExecuteOptions,
  ScopeResult,
  OutputSegment,
  MarkdownSegment,
  ScopeSegment,
} from "@x-langjs/interpreter";

// Builtins
export { BuiltinRegistry } from "@x-langjs/interpreter";
export type { BuiltinFunction, Evaluator } from "@x-langjs/interpreter";

// Environment
export { Environment } from "@x-langjs/interpreter";

// All AST types
export type {
  Position,
  SourceLocation,
  TypeAnnotation,
  TypeAnnotationKind,
  SimpleTypeAnnotation,
  ArrayTypeAnnotation,
  CustomTypeAnnotation,
  TypeAnnotationNode,
  Parameter,
  Property,
  BaseNode,
  Program,
  ScopeBlock,
  VariableDeclaration,
  FunctionDeclaration,
  IfStatement,
  WhileStatement,
  ForStatement,
  ReturnStatement,
  BreakStatement,
  ContinueStatement,
  ExpressionStatement,
  BlockStatement,
  Statement,
  NumberLiteral,
  StringLiteral,
  BooleanLiteral,
  NullLiteral,
  Identifier,
  BinaryOperator,
  BinaryExpression,
  UnaryOperator,
  UnaryExpression,
  AssignmentOperator,
  AssignmentExpression,
  NamedArgument,
  CallArgument,
  CallExpression,
  MemberExpression,
  IndexExpression,
  ArrayExpression,
  ObjectExpression,
  ArrowFunctionExpression,
  Expression,
  Node,
} from "@x-langjs/types";

// Errors
export {
  XLangError,
  LexerError,
  ParseError,
  ASTBuildError,
} from "@x-langjs/types";

// Low-level parser access
export {
  XLangLexer,
  XLangParser,
  createLexer,
  parse as parseCST,
  tokenize as tokenizeRaw,
  locationFromToken,
} from "@x-langjs/parser";
export type { ParseResult, TokenInfo } from "@x-langjs/parser";
