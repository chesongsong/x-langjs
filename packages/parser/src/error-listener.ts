import {
  type ANTLRErrorListener,
  type RecognitionException,
  type Recognizer,
  type ATNSimulator,
} from "antlr4ng";
import { ParseError } from "@x-lang/types";

export class XLangErrorListener implements ANTLRErrorListener {
  public readonly errors: ParseError[] = [];

  // 记录语法错误
  syntaxError(
    _recognizer: Recognizer<ATNSimulator>,
    _offendingSymbol: unknown,
    line: number,
    charPositionInLine: number,
    msg: string,
    _e: RecognitionException | null,
  ): void {
    this.errors.push(
      new ParseError(
        `[${line}:${charPositionInLine}] ${msg}`,
        {
          start: { line, column: charPositionInLine, offset: 0 },
          end: { line, column: charPositionInLine, offset: 0 },
        },
      ),
    );
  }

  // 忽略歧义报告
  reportAmbiguity(): void {
    // intentionally empty — ambiguity reports are not treated as errors
  }

  // 忽略全上下文尝试报告
  reportAttemptingFullContext(): void {
    // intentionally empty
  }

  // 忽略上下文敏感报告
  reportContextSensitivity(): void {
    // intentionally empty
  }
}
