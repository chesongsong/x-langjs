import type {
  Program,
  ScopeBlock,
  Statement,
  Expression,
  BlockStatement,
  FunctionDeclaration,
  IfStatement,
  WhileStatement,
  ForStatement,
  ExpressionStatement,
  ReturnStatement,
  VariableDeclaration,
  AssignmentExpression,
  Identifier,
  CallArgument,
  Property,
} from "@x-lang/types";

export class ScopeResolver {
  private scopeStack: Set<string>[] = [];

  // 解析整个程序的作用域
  resolve(program: Program): Program {
    return {
      ...program,
      body: program.body.map((scope: ScopeBlock) => this.resolveScopeBlock(scope)),
    };
  }

  // 解析顶层代码块作用域
  private resolveScopeBlock(scope: ScopeBlock): ScopeBlock {
    this.pushScope();
    const body = this.resolveStatements(scope.body as Statement[]);
    this.popScope();
    return { ...scope, body };
  }

  // 逐条解析语句列表
  private resolveStatements(stmts: Statement[]): Statement[] {
    return stmts.map((s) => this.resolveStatement(s));
  }

  // 根据类型分发语句解析
  private resolveStatement(stmt: Statement): Statement {
    switch (stmt.type) {
      case "ExpressionStatement":
        return this.resolveExpressionStatement(stmt);
      case "FunctionDeclaration":
        return this.resolveFunctionDeclaration(stmt);
      case "IfStatement":
        return this.resolveIfStatement(stmt);
      case "WhileStatement":
        return this.resolveWhileStatement(stmt);
      case "ForStatement":
        return this.resolveForStatement(stmt);
      case "BlockStatement":
        return this.resolveBlockStatement(stmt);
      case "ReturnStatement":
        return this.resolveReturnStatement(stmt);
      case "VariableDeclaration":
      case "BreakStatement":
      case "ContinueStatement":
        return stmt;
    }
  }

  // 解析表达式语句并处理隐式声明
  private resolveExpressionStatement(
    stmt: ExpressionStatement,
  ): ExpressionStatement | VariableDeclaration {
    const expr = stmt.expression;

    if (this.isImplicitDeclaration(expr)) {
      const assign = expr as AssignmentExpression;
      const target = assign.target as Identifier;
      this.defineInCurrentScope(target.name);
      return {
        type: "VariableDeclaration",
        name: target.name,
        init: this.resolveExpression(assign.value),
        loc: stmt.loc,
      };
    }

    return {
      ...stmt,
      expression: this.resolveExpression(stmt.expression),
    };
  }

  // 解析函数声明并建立参数作用域
  private resolveFunctionDeclaration(
    stmt: FunctionDeclaration,
  ): FunctionDeclaration {
    this.defineInCurrentScope(stmt.name);

    this.pushScope();
    for (const param of stmt.params) {
      this.defineInCurrentScope(param.name);
    }
    const body = this.resolveBlockStatement(stmt.body);
    this.popScope();

    return { ...stmt, body };
  }

  // 解析 if/else 作用域
  private resolveIfStatement(stmt: IfStatement): IfStatement {
    const test = this.resolveExpression(stmt.test);
    const consequent = this.resolveBlockStatement(stmt.consequent);
    let alternate: BlockStatement | IfStatement | undefined;
    if (stmt.alternate) {
      alternate =
        stmt.alternate.type === "IfStatement"
          ? this.resolveIfStatement(stmt.alternate)
          : this.resolveBlockStatement(stmt.alternate);
    }
    return { ...stmt, test, consequent, alternate };
  }

  // 解析 while 作用域
  private resolveWhileStatement(stmt: WhileStatement): WhileStatement {
    return {
      ...stmt,
      test: this.resolveExpression(stmt.test),
      body: this.resolveBlockStatement(stmt.body),
    };
  }

  // 解析 for 作用域
  private resolveForStatement(stmt: ForStatement): ForStatement {
    this.pushScope();

    const init = this.resolveForInit(stmt.init);
    const test = this.resolveExpression(stmt.test);
    const update = this.resolveExpression(stmt.update);

    const bodyStmts = this.resolveStatements(stmt.body.body as Statement[]);
    const body: BlockStatement = { ...stmt.body, body: bodyStmts };

    this.popScope();

    return { ...stmt, init, test, update, body };
  }

  // 解析 for 初始化表达式并处理隐式声明
  private resolveForInit(expr: Expression): Expression {
    if (this.isImplicitDeclaration(expr)) {
      const assign = expr as AssignmentExpression;
      const target = assign.target as Identifier;
      this.defineInCurrentScope(target.name);
    }
    return this.resolveExpression(expr);
  }

  // 解析语句块并创建子作用域
  private resolveBlockStatement(block: BlockStatement): BlockStatement {
    this.pushScope();
    const body = this.resolveStatements(block.body as Statement[]);
    this.popScope();
    return { ...block, body };
  }

  // 解析 return 表达式
  private resolveReturnStatement(stmt: ReturnStatement): ReturnStatement {
    if (!stmt.argument) return stmt;
    return { ...stmt, argument: this.resolveExpression(stmt.argument) };
  }

  // -----------------------------------------------------------------------
  // Expression resolution (recursively resolves nested expressions)
  // -----------------------------------------------------------------------

  // 解析表达式并递归处理子节点
  private resolveExpression(expr: Expression): Expression {
    switch (expr.type) {
      case "AssignmentExpression":
        return {
          ...expr,
          value: this.resolveExpression(expr.value),
        };
      case "BinaryExpression":
        return {
          ...expr,
          left: this.resolveExpression(expr.left),
          right: this.resolveExpression(expr.right),
        };
      case "UnaryExpression":
        return {
          ...expr,
          argument: this.resolveExpression(expr.argument),
        };
      case "CallExpression":
        return {
          ...expr,
          callee: this.resolveExpression(expr.callee),
          arguments: expr.arguments.map((a: CallArgument) => this.resolveCallArgument(a)),
        };
      case "MemberExpression":
        return {
          ...expr,
          object: this.resolveExpression(expr.object),
        };
      case "IndexExpression":
        return {
          ...expr,
          object: this.resolveExpression(expr.object),
          index: this.resolveExpression(expr.index),
        };
      case "ArrayExpression":
        return {
          ...expr,
          elements: expr.elements.map((e: Expression) => this.resolveExpression(e)),
        };
      case "ObjectExpression":
        return {
          ...expr,
          properties: expr.properties.map((p: Property) => ({
            ...p,
            value: this.resolveExpression(p.value),
          })),
        };
      case "ArrowFunctionExpression": {
        this.pushScope();
        for (const param of expr.params) {
          this.defineInCurrentScope(param.name);
        }
        const body =
          expr.body.type === "BlockStatement"
            ? this.resolveBlockStatement(expr.body)
            : this.resolveExpression(expr.body);
        this.popScope();
        return { ...expr, body };
      }
      default:
        return expr;
    }
  }

  // 解析函数调用单个参数
  private resolveCallArgument(arg: CallArgument): CallArgument {
    if (arg.type === "NamedArgument") {
      return { ...arg, value: this.resolveExpression(arg.value) };
    }
    return this.resolveExpression(arg);
  }

  // -----------------------------------------------------------------------
  // Scope helpers
  // -----------------------------------------------------------------------

  // 压入新作用域
  private pushScope(): void {
    this.scopeStack.push(new Set());
  }

  // 弹出当前作用域
  private popScope(): void {
    this.scopeStack.pop();
  }

  // 在当前作用域登记变量名
  private defineInCurrentScope(name: string): void {
    const current = this.scopeStack[this.scopeStack.length - 1];
    if (current) {
      current.add(name);
    }
  }

  // 判断变量名是否已在任意作用域定义
  private isDefined(name: string): boolean {
    for (let i = this.scopeStack.length - 1; i >= 0; i--) {
      if (this.scopeStack[i]!.has(name)) return true;
    }
    return false;
  }

  // 判断是否为隐式声明（首次赋值）
  private isImplicitDeclaration(expr: Expression): boolean {
    return (
      expr.type === "AssignmentExpression" &&
      expr.operator === "=" &&
      expr.target.type === "Identifier" &&
      !this.isDefined(expr.target.name)
    );
  }
}
