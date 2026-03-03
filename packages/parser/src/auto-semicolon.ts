import {
  CommonToken,
  type CharStream,
  type Token,
  type TokenFactory,
  type TokenSource,
} from "antlr4ng";
import { XLangLexer } from "./generated/XLangLexer.js";

const STATEMENT_ENDING_TOKENS = new Set([
  XLangLexer.IDENTIFIER,
  XLangLexer.NUMBER,
  XLangLexer.STRING,
  XLangLexer.TRUE,
  XLangLexer.FALSE,
  XLangLexer.NULL,
  XLangLexer.RPAREN,
  XLangLexer.RBRACE,
  XLangLexer.RBRACKET,
  XLangLexer.BREAK,
  XLangLexer.CONTINUE,
  XLangLexer.RETURN,
]);

export class AutoSemicolonTokenSource implements TokenSource {
  private lastNonNewlineToken: Token | null = null;
  private pending: Token | null = null;

  // 绑定词法分析器
  constructor(private readonly lexer: XLangLexer) {}

  // 读取下一个 token，必要时自动补分号
  nextToken(): Token {
    if (this.pending) {
      const token = this.pending;
      this.pending = null;
      return token;
    }

    while (true) {
      const token = this.lexer.nextToken();

      if (token.type === XLangLexer.EOF) {
        if (
          this.lastNonNewlineToken &&
          STATEMENT_ENDING_TOKENS.has(this.lastNonNewlineToken.type)
        ) {
          this.pending = token;
          this.lastNonNewlineToken = null;
          return this.createSemiToken(token);
        }
        return token;
      }

      if (token.type === XLangLexer.NEWLINE) {
        if (
          this.lastNonNewlineToken &&
          STATEMENT_ENDING_TOKENS.has(this.lastNonNewlineToken.type)
        ) {
          return this.createSemiToken(token);
        }
        continue;
      }

      this.lastNonNewlineToken = token;
      return token;
    }
  }

  // 以当前位置生成分号 token
  private createSemiToken(positionToken: Token): Token {
    const semi = CommonToken.fromType(XLangLexer.SEMI, ";");
    semi.line = positionToken.line;
    semi.column = positionToken.column;
    semi.start = positionToken.start;
    semi.stop = positionToken.start;
    semi.tokenIndex = -1;
    return semi;
  }

  // 当前行号
  get line(): number {
    return this.lexer.line;
  }

  // 当前列号
  get column(): number {
    return this.lexer.column;
  }

  // 返回输入流
  get inputStream(): CharStream | null {
    return this.lexer.inputStream;
  }

  // 返回输入源名称
  get sourceName(): string {
    return this.lexer.sourceName;
  }

  // 设置 token 工厂
  set tokenFactory(factory: TokenFactory<Token>) {
    this.lexer.tokenFactory = factory;
  }

  // 获取 token 工厂
  get tokenFactory(): TokenFactory<Token> {
    return this.lexer.tokenFactory;
  }
}
