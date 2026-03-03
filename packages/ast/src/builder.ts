import { ParserRuleContext, type Token } from "antlr4ng";
import { XLangParser } from "@x-lang/parser";
import type {
  Program,
  ScopeBlock,
  Statement,
  Expression,
  FunctionDeclaration,
  IfStatement,
  WhileStatement,
  ForStatement,
  ReturnStatement,
  ExpressionStatement,
  BlockStatement,
  AssignmentExpression,
  NumberLiteral,
  StringLiteral,
  BooleanLiteral,
  NullLiteral,
  Identifier,
  BinaryOperator,
  UnaryOperator,
  AssignmentOperator,
  MemberExpression,
  IndexExpression,
  SourceLocation,
  Parameter,
  Property,
  TypeAnnotationNode,
  NamedArgument,
  CallArgument,
} from "@x-lang/types";
import { ASTBuildError } from "@x-lang/types";

function loc(ctx: ParserRuleContext): SourceLocation {
  const start = ctx.start!;
  const stop = ctx.stop ?? start;
  return {
    start: {
      line: start.line,
      column: start.column,
      offset: start.start,
    },
    end: {
      line: stop.line,
      column: stop.column + (stop.text?.length ?? 0),
      offset: stop.stop + 1,
    },
  };
}

function tokenLoc(token: Token): SourceLocation {
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

export class ASTBuilder {
  // 构建程序入口 AST
  buildProgram(ctx: ParserRuleContext): Program {
    const scopes: ScopeBlock[] = [];
    for (const child of ctx.children ?? []) {
      if (
        child instanceof ParserRuleContext &&
        child.ruleIndex === XLangParser.RULE_scopeBlock
      ) {
        scopes.push(this.buildScopeBlock(child));
      }
    }
    return {
      type: "Program",
      body: scopes,
      loc: loc(ctx),
    };
  }

  // 构建顶层代码块
  private buildScopeBlock(ctx: ParserRuleContext): ScopeBlock {
    const stmts: Statement[] = [];
    for (const child of ctx.children ?? []) {
      if (child instanceof ParserRuleContext) {
        const stmt = this.buildStatement(child);
        if (stmt) stmts.push(stmt);
      }
    }
    return {
      type: "ScopeBlock",
      body: stmts,
      loc: loc(ctx),
    };
  }

  // 构建语句节点
  private buildStatement(ctx: ParserRuleContext): Statement | null {
    const ruleIndex = ctx.ruleIndex;

    if (ruleIndex === XLangParser.RULE_functionDeclaration) {
      return this.buildFunctionDeclaration(ctx);
    }
    if (ruleIndex === XLangParser.RULE_ifStatement) {
      return this.buildIfStatement(ctx);
    }
    if (ruleIndex === XLangParser.RULE_whileStatement) {
      return this.buildWhileStatement(ctx);
    }
    if (ruleIndex === XLangParser.RULE_forStatement) {
      return this.buildForStatement(ctx);
    }
    if (ruleIndex === XLangParser.RULE_returnStatement) {
      return this.buildReturnStatement(ctx);
    }
    if (ruleIndex === XLangParser.RULE_expressionStatement) {
      return this.buildExpressionStatement(ctx);
    }
    if (ruleIndex === XLangParser.RULE_block) {
      return this.buildBlock(ctx);
    }
    if (ruleIndex === XLangParser.RULE_statement) {
      const child = ctx.getChild(0);
      if (child instanceof ParserRuleContext) {
        return this.buildStatement(child);
      }
    }
    if (ruleIndex === XLangParser.RULE_breakStatement) {
      return { type: "BreakStatement", loc: loc(ctx) };
    }
    if (ruleIndex === XLangParser.RULE_continueStatement) {
      return { type: "ContinueStatement", loc: loc(ctx) };
    }

    return null;
  }

  // 构建函数声明
  private buildFunctionDeclaration(ctx: ParserRuleContext): FunctionDeclaration {
    const nameToken = ctx.getToken(XLangParser.IDENTIFIER, 0);
    const name = nameToken?.getText() ?? "";

    const paramListCtx = this.findRuleChild(ctx, XLangParser.RULE_parameterList);
    const params = paramListCtx ? this.buildParameterList(paramListCtx) : [];

    const blockCtx = this.findRuleChild(ctx, XLangParser.RULE_block)!;

    return {
      type: "FunctionDeclaration",
      name,
      params,
      body: this.buildBlock(blockCtx),
      loc: loc(ctx),
    };
  }

  // 构建 if/else 语句
  private buildIfStatement(ctx: ParserRuleContext): IfStatement {
    const exprCtx = this.findRuleChild(ctx, XLangParser.RULE_expression)!;
    const blocks = this.findAllRuleChildren(ctx, XLangParser.RULE_block);
    const nestedIf = this.findRuleChild(ctx, XLangParser.RULE_ifStatement);

    let alternate: BlockStatement | IfStatement | undefined;
    if (nestedIf) {
      alternate = this.buildIfStatement(nestedIf);
    } else if (blocks.length > 1) {
      alternate = this.buildBlock(blocks[1]!);
    }

    return {
      type: "IfStatement",
      test: this.buildExpression(exprCtx),
      consequent: this.buildBlock(blocks[0]!),
      alternate,
      loc: loc(ctx),
    };
  }

  // 构建 while 语句
  private buildWhileStatement(ctx: ParserRuleContext): WhileStatement {
    const exprCtx = this.findRuleChild(ctx, XLangParser.RULE_expression)!;
    const blockCtx = this.findRuleChild(ctx, XLangParser.RULE_block)!;

    return {
      type: "WhileStatement",
      test: this.buildExpression(exprCtx),
      body: this.buildBlock(blockCtx),
      loc: loc(ctx),
    };
  }

  // 构建 for 语句
  private buildForStatement(ctx: ParserRuleContext): ForStatement {
    const expressions = this.findAllRuleChildren(ctx, XLangParser.RULE_expression);
    const blockCtx = this.findRuleChild(ctx, XLangParser.RULE_block)!;

    return {
      type: "ForStatement",
      init: expressions[0]
        ? this.buildExpression(expressions[0])
        : { type: "NullLiteral", loc: loc(ctx) },
      test: expressions[1]
        ? this.buildExpression(expressions[1])
        : { type: "BooleanLiteral", value: true, loc: loc(ctx) },
      update: expressions[2]
        ? this.buildExpression(expressions[2])
        : { type: "NullLiteral", loc: loc(ctx) },
      body: this.buildBlock(blockCtx),
      loc: loc(ctx),
    };
  }

  // 构建 return 语句
  private buildReturnStatement(ctx: ParserRuleContext): ReturnStatement {
    const exprCtx = this.findRuleChild(ctx, XLangParser.RULE_expression);
    return {
      type: "ReturnStatement",
      argument: exprCtx ? this.buildExpression(exprCtx) : undefined,
      loc: loc(ctx),
    };
  }

  // 构建表达式语句
  private buildExpressionStatement(ctx: ParserRuleContext): ExpressionStatement {
    const exprCtx = this.findRuleChild(ctx, XLangParser.RULE_expression)!;
    return {
      type: "ExpressionStatement",
      expression: this.buildExpression(exprCtx),
      loc: loc(ctx),
    };
  }

  // 构建语句块
  private buildBlock(ctx: ParserRuleContext): BlockStatement {
    const stmts: Statement[] = [];
    for (const child of ctx.children ?? []) {
      if (child instanceof ParserRuleContext) {
        const stmt = this.buildStatement(child);
        if (stmt) stmts.push(stmt);
      }
    }
    return {
      type: "BlockStatement",
      body: stmts,
      loc: loc(ctx),
    };
  }

  // -----------------------------------------------------------------------
  // Expressions
  // -----------------------------------------------------------------------

  // 构建表达式入口
  buildExpression(ctx: ParserRuleContext): Expression {
    const ruleIndex = ctx.ruleIndex;

    if (ruleIndex === XLangParser.RULE_expression) {
      const child = ctx.getChild(0);
      if (child instanceof ParserRuleContext) {
        return this.buildExpression(child);
      }
    }

    if (ruleIndex === XLangParser.RULE_assignmentExpression) {
      return this.buildAssignmentExpression(ctx);
    }

    if (
      ruleIndex === XLangParser.RULE_logicalOrExpression ||
      ruleIndex === XLangParser.RULE_logicalAndExpression ||
      ruleIndex === XLangParser.RULE_equalityExpression ||
      ruleIndex === XLangParser.RULE_relationalExpression ||
      ruleIndex === XLangParser.RULE_additiveExpression ||
      ruleIndex === XLangParser.RULE_multiplicativeExpression
    ) {
      return this.buildBinaryChain(ctx);
    }

    if (ruleIndex === XLangParser.RULE_unaryExpression) {
      return this.buildUnaryExpression(ctx);
    }

    if (ruleIndex === XLangParser.RULE_postfixExpression) {
      return this.buildPostfixExpression(ctx);
    }

    if (ruleIndex === XLangParser.RULE_primaryExpression) {
      return this.buildPrimaryExpression(ctx);
    }

    if (ruleIndex === XLangParser.RULE_arrayLiteral) {
      return this.buildArrayLiteral(ctx);
    }

    if (ruleIndex === XLangParser.RULE_objectLiteral) {
      return this.buildObjectLiteral(ctx);
    }

    if (ruleIndex === XLangParser.RULE_arrowFunction) {
      return this.buildArrowFunction(ctx);
    }

    const child = ctx.getChild(0);
    if (child instanceof ParserRuleContext) {
      return this.buildExpression(child);
    }

    throw new ASTBuildError(
      `Cannot build expression from rule index ${ruleIndex}`,
      loc(ctx),
    );
  }

  // 构建赋值表达式
  private buildAssignmentExpression(ctx: ParserRuleContext): Expression {
    const children = ctx.children ?? [];
    if (children.length === 1) {
      const child = children[0];
      if (child instanceof ParserRuleContext) {
        return this.buildExpression(child);
      }
    }

    if (children.length === 3) {
      const leftCtx = children[0];
      const opToken = children[1];
      const rightCtx = children[2];

      if (leftCtx instanceof ParserRuleContext && rightCtx instanceof ParserRuleContext) {
        const left = this.buildExpression(leftCtx);
        const op = (opToken?.getText() ?? "=") as AssignmentOperator;
        const right = this.buildExpression(rightCtx);

        return {
          type: "AssignmentExpression",
          operator: op,
          target: left as Identifier | MemberExpression | IndexExpression,
          value: right,
          loc: loc(ctx),
        } as AssignmentExpression;
      }
    }

    const child = children[0];
    if (child instanceof ParserRuleContext) {
      return this.buildExpression(child);
    }

    throw new ASTBuildError("Invalid assignment expression", loc(ctx));
  }

  // 构建二元表达式链
  private buildBinaryChain(ctx: ParserRuleContext): Expression {
    const children = ctx.children ?? [];
    if (children.length === 1) {
      const child = children[0];
      if (child instanceof ParserRuleContext) {
        return this.buildExpression(child);
      }
    }

    let left: Expression | null = null;
    let op: string | null = null;

    for (const child of children) {
      if (child instanceof ParserRuleContext) {
        const expr = this.buildExpression(child);
        if (left === null) {
          left = expr;
        } else {
          left = {
            type: "BinaryExpression",
            operator: (op ?? "+") as BinaryOperator,
            left,
            right: expr,
            loc: loc(ctx),
          };
          op = null;
        }
      } else {
        op = child.getText();
      }
    }

    return left!;
  }

  // 构建一元表达式
  private buildUnaryExpression(ctx: ParserRuleContext): Expression {
    const children = ctx.children ?? [];
    if (children.length === 1) {
      const child = children[0];
      if (child instanceof ParserRuleContext) {
        return this.buildExpression(child);
      }
    }

    if (children.length === 2) {
      const opText = children[0]!.getText();
      const operandCtx = children[1];
      if (operandCtx instanceof ParserRuleContext) {
        return {
          type: "UnaryExpression",
          operator: opText as UnaryOperator,
          argument: this.buildExpression(operandCtx),
          loc: loc(ctx),
        };
      }
    }

    throw new ASTBuildError("Invalid unary expression", loc(ctx));
  }

  // 构建后缀表达式（访问/调用）
  private buildPostfixExpression(ctx: ParserRuleContext): Expression {
    const children = ctx.children ?? [];
    if (children.length === 0) {
      throw new ASTBuildError("Empty postfix expression", loc(ctx));
    }

    const primaryCtx = children[0];
    if (!(primaryCtx instanceof ParserRuleContext)) {
      throw new ASTBuildError("Invalid postfix expression", loc(ctx));
    }

    let result: Expression = this.buildExpression(primaryCtx);

    for (let i = 1; i < children.length; i++) {
      const child = children[i];
      if (child instanceof ParserRuleContext &&
          child.ruleIndex === XLangParser.RULE_postfixOp) {
        result = this.applyPostfixOp(result, child);
      }
    }

    return result;
  }

  // 应用后缀操作到表达式
  private applyPostfixOp(
    target: Expression,
    opCtx: ParserRuleContext,
  ): Expression {
    const children = opCtx.children ?? [];
    const firstText = children[0]?.getText() ?? "";

    if (firstText === ".") {
      const propToken = children[1];
      return {
        type: "MemberExpression",
        object: target,
        property: propToken?.getText() ?? "",
        loc: loc(opCtx),
      };
    }

    if (firstText === "[") {
      const indexCtx = children[1];
      if (indexCtx instanceof ParserRuleContext) {
        return {
          type: "IndexExpression",
          object: target,
          index: this.buildExpression(indexCtx),
          loc: loc(opCtx),
        };
      }
    }

    if (firstText === "(") {
      const args: CallArgument[] = [];
      const argListCtx = children[1];
      if (argListCtx instanceof ParserRuleContext &&
          argListCtx.ruleIndex === XLangParser.RULE_argumentList) {
        for (const child of argListCtx.children ?? []) {
          if (child instanceof ParserRuleContext &&
              child.ruleIndex === XLangParser.RULE_argument) {
            args.push(this.buildArgument(child));
          }
        }
      }
      return {
        type: "CallExpression",
        callee: target,
        arguments: args,
        loc: loc(opCtx),
      };
    }

    throw new ASTBuildError(`Unknown postfix op: ${firstText}`, loc(opCtx));
  }

  // 构建基础表达式
  private buildPrimaryExpression(ctx: ParserRuleContext): Expression {
    const children = ctx.children ?? [];
    if (children.length === 0) {
      throw new ASTBuildError("Empty primary expression", loc(ctx));
    }

    const first = children[0]!;

    if (first instanceof ParserRuleContext) {
      return this.buildExpression(first);
    }

    const text = first.getText();
    const token = ctx.start!;

    if (ctx.getToken(XLangParser.NUMBER, 0)) {
      return {
        type: "NumberLiteral",
        value: Number(text),
        raw: text,
        loc: tokenLoc(token),
      } as NumberLiteral;
    }

    if (ctx.getToken(XLangParser.STRING, 0)) {
      return {
        type: "StringLiteral",
        value: text.slice(1, -1),
        raw: text,
        loc: tokenLoc(token),
      } as StringLiteral;
    }

    if (ctx.getToken(XLangParser.TRUE, 0)) {
      return { type: "BooleanLiteral", value: true, loc: tokenLoc(token) } as BooleanLiteral;
    }

    if (ctx.getToken(XLangParser.FALSE, 0)) {
      return { type: "BooleanLiteral", value: false, loc: tokenLoc(token) } as BooleanLiteral;
    }

    if (ctx.getToken(XLangParser.NULL, 0)) {
      return { type: "NullLiteral", loc: tokenLoc(token) } as NullLiteral;
    }

    if (ctx.getToken(XLangParser.IDENTIFIER, 0)) {
      return { type: "Identifier", name: text, loc: tokenLoc(token) } as Identifier;
    }

    if (text === "(") {
      const exprCtx = children[1];
      if (exprCtx instanceof ParserRuleContext) {
        return this.buildExpression(exprCtx);
      }
    }

    throw new ASTBuildError(`Unexpected primary expression: ${text}`, loc(ctx));
  }

  // 构建数组字面量
  private buildArrayLiteral(ctx: ParserRuleContext): Expression {
    const elements: Expression[] = [];
    for (const child of ctx.children ?? []) {
      if (child instanceof ParserRuleContext) {
        elements.push(this.buildExpression(child));
      }
    }
    return { type: "ArrayExpression", elements, loc: loc(ctx) };
  }

  // 构建对象字面量
  private buildObjectLiteral(ctx: ParserRuleContext): Expression {
    const properties: Property[] = [];
    const propContexts = this.findAllRuleChildren(ctx, XLangParser.RULE_property);

    for (const propCtx of propContexts) {
      const keyCtx = this.findRuleChild(propCtx, XLangParser.RULE_propertyKey);
      const exprCtx = this.findRuleChild(propCtx, XLangParser.RULE_expression);

      let key = keyCtx?.getText() ?? "";
      if (key.startsWith('"') || key.startsWith("'")) {
        key = key.slice(1, -1);
      }

      properties.push({
        key,
        value: exprCtx
          ? this.buildExpression(exprCtx)
          : { type: "NullLiteral", loc: loc(propCtx) },
        loc: loc(propCtx),
      });
    }

    return { type: "ObjectExpression", properties, loc: loc(ctx) };
  }

  // 构建箭头函数
  private buildArrowFunction(ctx: ParserRuleContext): Expression {
    const paramListCtx = this.findRuleChild(ctx, XLangParser.RULE_parameterList);
    const params = paramListCtx ? this.buildParameterList(paramListCtx) : [];

    const blockCtx = this.findRuleChild(ctx, XLangParser.RULE_block);
    const exprCtx = this.findRuleChild(ctx, XLangParser.RULE_expression);

    const body: Expression | BlockStatement = blockCtx
      ? this.buildBlock(blockCtx)
      : exprCtx
        ? this.buildExpression(exprCtx)
        : { type: "NullLiteral", loc: loc(ctx) };

    return {
      type: "ArrowFunctionExpression",
      params,
      body,
      loc: loc(ctx),
    };
  }

  // -----------------------------------------------------------------------
  // Arguments
  // -----------------------------------------------------------------------

  // 构建函数调用参数
  private buildArgument(ctx: ParserRuleContext): CallArgument {
    const children = ctx.children ?? [];

    if (children.length === 3) {
      const first = children[0]!;
      const secondText = children[1]?.getText();

      if (secondText === "=") {
        const exprCtx = children[2];
        if (!(exprCtx instanceof ParserRuleContext)) {
          throw new ASTBuildError("Invalid named argument value", loc(ctx));
        }

        const firstText = first.getText();
        let name: string;

        if (first instanceof ParserRuleContext) {
          name = firstText;
        } else if (firstText.startsWith('"') || firstText.startsWith("'")) {
          name = firstText.slice(1, -1);
        } else {
          name = firstText;
        }

        return {
          type: "NamedArgument",
          name,
          value: this.buildExpression(exprCtx),
          loc: loc(ctx),
        } as NamedArgument;
      }
    }

    const exprChild = children[0];
    if (exprChild instanceof ParserRuleContext) {
      return this.buildExpression(exprChild);
    }

    throw new ASTBuildError("Invalid argument", loc(ctx));
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  // 构建参数列表
  private buildParameterList(ctx: ParserRuleContext): Parameter[] {
    const params: Parameter[] = [];
    const paramContexts = this.findAllRuleChildren(ctx, XLangParser.RULE_parameter);

    for (const paramCtx of paramContexts) {
      const nameToken = paramCtx.getToken(XLangParser.IDENTIFIER, 0);
      const typeAnno = this.findRuleChild(paramCtx, XLangParser.RULE_typeAnnotation);
      params.push({
        name: nameToken?.getText() ?? "",
        typeAnnotation: typeAnno ? this.buildTypeAnnotation(typeAnno) : undefined,
        loc: loc(paramCtx),
      });
    }
    return params;
  }

  // 构建类型标注
  private buildTypeAnnotation(ctx: ParserRuleContext): TypeAnnotationNode {
    const baseCtx = this.findRuleChild(ctx, XLangParser.RULE_baseType);
    const text = baseCtx?.getText() ?? ctx.getText();

    const hasBrackets = ctx.getToken(XLangParser.LBRACKET, 0) !== null;

    let baseType: TypeAnnotationNode;
    switch (text) {
      case "number":
      case "string":
      case "boolean":
      case "void":
        baseType = { kind: text, loc: loc(ctx) };
        break;
      default:
        baseType = { kind: "custom", name: text, loc: loc(ctx) } as TypeAnnotationNode;
        break;
    }

    if (hasBrackets) {
      return { kind: "array", elementType: baseType, loc: loc(ctx) } as TypeAnnotationNode;
    }

    return baseType;
  }

  // 查找第一个匹配规则子节点
  private findRuleChild(
    ctx: ParserRuleContext,
    ruleIndex: number,
  ): ParserRuleContext | null {
    for (const child of ctx.children ?? []) {
      if (child instanceof ParserRuleContext && child.ruleIndex === ruleIndex) {
        return child;
      }
    }
    return null;
  }

  // 查找全部匹配规则子节点
  private findAllRuleChildren(
    ctx: ParserRuleContext,
    ruleIndex: number,
  ): ParserRuleContext[] {
    const result: ParserRuleContext[] = [];
    for (const child of ctx.children ?? []) {
      if (child instanceof ParserRuleContext && child.ruleIndex === ruleIndex) {
        result.push(child);
      }
    }
    return result;
  }
}
