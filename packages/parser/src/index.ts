import {
  CharStream,
  CommonTokenStream,
  type Token,
} from "antlr4ng";
import { XLangLexer } from "./generated/XLangLexer.js";
import { XLangParser } from "./generated/XLangParser.js";
import type { ProgramContext } from "./generated/XLangParser.js";
import { LexerError, ParseError } from "@x-lang/types";
import type { SourceLocation } from "@x-lang/types";
import { XLangErrorListener } from "./error-listener.js";
import { AutoSemicolonTokenSource } from "./auto-semicolon.js";

export { XLangLexer } from "./generated/XLangLexer.js";
export { XLangParser } from "./generated/XLangParser.js";
export type { ProgramContext } from "./generated/XLangParser.js";
export { AutoSemicolonTokenSource } from "./auto-semicolon.js";

export interface ParseResult {
  readonly tree: ProgramContext;
  readonly tokens: CommonTokenStream;
  readonly errors: readonly ParseError[];
}

export interface TokenInfo {
  readonly type: number;
  readonly text: string;
  readonly line: number;
  readonly column: number;
  readonly channel: number;
}

// 根据源码创建词法分析器
export function createLexer(source: string): XLangLexer {
  const chars = CharStream.fromString(source);
  return new XLangLexer(chars);
}

// 词法分析并返回 token 列表
export function tokenize(source: string): readonly TokenInfo[] {
  const lexer = createLexer(source);
  const errorListener = new XLangErrorListener();
  lexer.removeErrorListeners();
  lexer.addErrorListener(errorListener);

  const asi = new AutoSemicolonTokenSource(lexer);
  const stream = new CommonTokenStream(asi);
  stream.fill();

  if (errorListener.errors.length > 0) {
    throw new LexerError(
      errorListener.errors.map((e) => e.message).join("\n"),
    );
  }

  const tokens: TokenInfo[] = [];
  for (const token of stream.getTokens()) {
    if (token.type === XLangLexer.EOF) break;
    tokens.push({
      type: token.type,
      text: token.text ?? "",
      line: token.line,
      column: token.column,
      channel: token.channel,
    });
  }
  return tokens;
}

// 解析源码为语法树并收集错误
export function parse(source: string): ParseResult {
  const lexer = createLexer(source);
  const lexerErrorListener = new XLangErrorListener();
  lexer.removeErrorListeners();
  lexer.addErrorListener(lexerErrorListener);

  const asi = new AutoSemicolonTokenSource(lexer);
  const tokens = new CommonTokenStream(asi);
  const parser = new XLangParser(tokens);

  const parserErrorListener = new XLangErrorListener();
  parser.removeErrorListeners();
  parser.addErrorListener(parserErrorListener);

  const tree = parser.program();

  const errors = [
    ...lexerErrorListener.errors,
    ...parserErrorListener.errors,
  ];

  return { tree, tokens, errors };
}

// 将 token 转换为源码位置信息
export function locationFromToken(token: Token): SourceLocation {
  return {
    start: {
      line: token.line,
      column: token.column,
      offset: token.start,
    },
    end: {
      line: token.line,
      column: token.column + (token.text?.length ?? 0),
      offset: token.stop + 1,
    },
  };
}
