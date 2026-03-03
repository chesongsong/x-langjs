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
  ComponentInstance,
  CodeBlockData,
  PendingData,
} from "@x-lang/render";
export { RenderEngine } from "@x-lang/render";

// Event system
export { EventBus } from "./event-bus.js";
export type { EventHandler } from "./event-bus.js";

// AST builder, scope resolver & visitor
export { ASTBuilder, ScopeResolver } from "@x-lang/ast";
export { type ASTVisitor, visitNode } from "@x-lang/ast";

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
} from "@x-lang/interpreter";

// Renderables — UI-renderable value types
export { XRenderable, XRenderCustom } from "@x-lang/interpreter";

// Renderable definition API
export { defineRenderable } from "./define-renderable.js";
export type {
  RenderableDefinition,
  RenderableHandler,
  RenderableContext,
  AdvancedRenderableHandler,
} from "./define-renderable.js";

// Interpreter & execution
export { Interpreter, execute } from "@x-lang/interpreter";
export type {
  ExecuteOptions,
  ScopeResult,
  OutputSegment,
  MarkdownSegment,
  ScopeSegment,
} from "@x-lang/interpreter";

// Builtins
export { BuiltinRegistry } from "@x-lang/interpreter";
export type { BuiltinFunction, Evaluator } from "@x-lang/interpreter";

// Environment
export { Environment } from "@x-lang/interpreter";

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
} from "@x-lang/types";

// Errors
export {
  XLangError,
  LexerError,
  ParseError,
  ASTBuildError,
} from "@x-lang/types";

// Low-level parser access
export {
  XLangLexer,
  XLangParser,
  createLexer,
  parse as parseCST,
  tokenize as tokenizeRaw,
  locationFromToken,
} from "@x-lang/parser";
export type { ParseResult, TokenInfo } from "@x-lang/parser";
