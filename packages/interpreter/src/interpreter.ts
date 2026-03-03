import type {
  Program,
  ScopeBlock,
  Statement,
  Expression,
  BlockStatement,
  VariableDeclaration,
  FunctionDeclaration,
  IfStatement,
  WhileStatement,
  ForStatement,
  ReturnStatement,
  ExpressionStatement,
  AssignmentExpression,
  BinaryExpression,
  UnaryExpression,
  CallExpression,
  MemberExpression,
  IndexExpression,
  ArrayExpression,
  ObjectExpression,
  ArrowFunctionExpression,
  CallArgument,
  Parameter,
} from "@x-lang/types";
import { Environment } from "./environment.js";
import { Xvalue } from "./values/base.js";
import { XNumber } from "./values/number.js";
import { XString } from "./values/string.js";
import { XBool } from "./values/bool.js";
import { XNull } from "./values/null.js";
import { XArray } from "./values/array.js";
import { XObject } from "./values/object.js";
import { XFunction } from "./values/function.js";
import { XRenderable } from "./renderables/base.js";
import { ReturnSignal, BreakSignal, ContinueSignal } from "./signals.js";
import type { ScopeResult } from "./segments.js";
import { BuiltinRegistry } from "./builtins/registry.js";
import type { BuiltinFunction, Evaluator } from "./builtins/registry.js";

const MAX_LOOP_ITERATIONS = 100_000;

export class Interpreter implements Evaluator {
  private readonly builtins: BuiltinRegistry;

  // 初始化解释器与内置函数
  constructor(externalBuiltins?: Map<string, BuiltinFunction>) {
    this.builtins = new BuiltinRegistry();
    if (externalBuiltins) {
      for (const [name, fn] of externalBuiltins) {
        this.builtins.register(name, fn);
      }
    }
  }

  // 执行程序并返回各作用域结果
  executeProgram(
    program: Program,
    globalEnv?: Environment,
  ): ScopeResult[] {
    const results: ScopeResult[] = [];
    for (let i = 0; i < program.body.length; i++) {
      try {
        const value = this.executeScopeBlock(program.body[i]!, globalEnv);
        results.push({ index: i, value });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({ index: i, value: XNull.instance, error: message });
      }
    }
    return results;
  }

  // 执行顶层作用域块
  private executeScopeBlock(
    scope: ScopeBlock,
    parentEnv?: Environment,
  ): Xvalue {
    const env = parentEnv ? new Environment(parentEnv) : new Environment();
    let lastValue: Xvalue = XNull.instance;
    const renderables: XRenderable[] = [];
    for (const stmt of scope.body) {
      lastValue = this.executeStatement(stmt, env);
      if (lastValue instanceof XRenderable) {
        renderables.push(lastValue);
      }
    }
    return renderables.length > 0 ? new XArray(renderables) : lastValue;
  }

  // 执行单条语句
  private executeStatement(stmt: Statement, env: Environment): Xvalue {
    switch (stmt.type) {
      case "VariableDeclaration":
        return this.executeVariableDeclaration(stmt, env);
      case "FunctionDeclaration":
        return this.executeFunctionDeclaration(stmt, env);
      case "ExpressionStatement":
        return this.executeExpressionStatement(stmt, env);
      case "IfStatement":
        return this.executeIfStatement(stmt, env);
      case "WhileStatement":
        return this.executeWhileStatement(stmt, env);
      case "ForStatement":
        return this.executeForStatement(stmt, env);
      case "ReturnStatement":
        return this.executeReturnStatement(stmt, env);
      case "BreakStatement":
        throw new BreakSignal();
      case "ContinueStatement":
        throw new ContinueSignal();
      case "BlockStatement":
        return this.executeBlock(stmt, env);
      default:
        return XNull.instance;
    }
  }

  // 执行变量声明
  private executeVariableDeclaration(
    stmt: VariableDeclaration,
    env: Environment,
  ): Xvalue {
    const value = this.evaluate(stmt.init, env);
    env.define(stmt.name, value);
    return value;
  }

  // 执行函数声明
  private executeFunctionDeclaration(
    stmt: FunctionDeclaration,
    env: Environment,
  ): Xvalue {
    const fn = new XFunction(
      stmt.name,
      stmt.params.map((p: Parameter) => p.name),
      stmt.body,
      env,
    );
    env.define(stmt.name, fn);
    return fn;
  }

  // 执行表达式语句
  private executeExpressionStatement(
    stmt: ExpressionStatement,
    env: Environment,
  ): Xvalue {
    return this.evaluate(stmt.expression, env);
  }

  // 执行 if/else 语句
  private executeIfStatement(stmt: IfStatement, env: Environment): Xvalue {
    const test = this.evaluate(stmt.test, env);
    if (test.isTruthy()) {
      return this.executeBlock(stmt.consequent, env);
    }
    if (stmt.alternate) {
      if (stmt.alternate.type === "IfStatement") {
        return this.executeIfStatement(stmt.alternate, env);
      }
      return this.executeBlock(stmt.alternate, env);
    }
    return XNull.instance;
  }

  // 执行 while 循环
  private executeWhileStatement(
    stmt: WhileStatement,
    env: Environment,
  ): Xvalue {
    let lastValue: Xvalue = XNull.instance;
    let iterations = 0;
    while (this.evaluate(stmt.test, env).isTruthy()) {
      if (++iterations > MAX_LOOP_ITERATIONS) {
        throw new Error("Maximum loop iterations exceeded");
      }
      try {
        lastValue = this.executeBlock(stmt.body, env);
      } catch (e) {
        if (e instanceof BreakSignal) break;
        if (e instanceof ContinueSignal) continue;
        throw e;
      }
    }
    return lastValue;
  }

  // 执行 for 循环
  private executeForStatement(stmt: ForStatement, env: Environment): Xvalue {
    const forEnv = new Environment(env);
    this.evaluate(stmt.init, forEnv);
    let lastValue: Xvalue = XNull.instance;
    let iterations = 0;
    while (this.evaluate(stmt.test, forEnv).isTruthy()) {
      if (++iterations > MAX_LOOP_ITERATIONS) {
        throw new Error("Maximum loop iterations exceeded");
      }
      try {
        lastValue = this.executeBlockInEnv(stmt.body, forEnv);
      } catch (e) {
        if (e instanceof BreakSignal) break;
        if (e instanceof ContinueSignal) {
          this.evaluate(stmt.update, forEnv);
          continue;
        }
        throw e;
      }
      this.evaluate(stmt.update, forEnv);
    }
    return lastValue;
  }

  // 执行 return 语句并抛出返回信号
  private executeReturnStatement(
    stmt: ReturnStatement,
    env: Environment,
  ): never {
    const value = stmt.argument
      ? this.evaluate(stmt.argument, env)
      : XNull.instance;
    throw new ReturnSignal(value);
  }

  // 执行语句块并创建子环境
  private executeBlock(block: BlockStatement, parentEnv: Environment): Xvalue {
    const env = new Environment(parentEnv);
    return this.executeBlockInEnv(block, env);
  }

  // 在指定环境中执行语句块
  private executeBlockInEnv(block: BlockStatement, env: Environment): Xvalue {
    let lastValue: Xvalue = XNull.instance;
    const renderables: XRenderable[] = [];
    for (const stmt of block.body) {
      lastValue = this.executeStatement(stmt, env);
      if (lastValue instanceof XRenderable) {
        renderables.push(lastValue);
      }
    }
    return renderables.length > 0 ? new XArray(renderables) : lastValue;
  }

  // -------------------------------------------------------------------------
  // Expression evaluation (implements Evaluator interface)
  // -------------------------------------------------------------------------

  // 计算表达式结果
  evaluate(expr: Expression, env: Environment): Xvalue {
    switch (expr.type) {
      case "NumberLiteral":
        return new XNumber(expr.value);
      case "StringLiteral":
        return new XString(expr.value);
      case "BooleanLiteral":
        return new XBool(expr.value);
      case "NullLiteral":
        return XNull.instance;
      case "Identifier":
        return env.get(expr.name);
      case "BinaryExpression":
        return this.evaluateBinary(expr, env);
      case "UnaryExpression":
        return this.evaluateUnary(expr, env);
      case "AssignmentExpression":
        return this.evaluateAssignment(expr, env);
      case "CallExpression":
        return this.evaluateCall(expr, env);
      case "MemberExpression":
        return this.evaluateMember(expr, env);
      case "IndexExpression":
        return this.evaluateIndex(expr, env);
      case "ArrayExpression":
        return this.evaluateArray(expr, env);
      case "ObjectExpression":
        return this.evaluateObject(expr, env);
      case "ArrowFunctionExpression":
        return this.evaluateArrowFunction(expr, env);
      default:
        return XNull.instance;
    }
  }

  // 计算二元表达式
  private evaluateBinary(expr: BinaryExpression, env: Environment): Xvalue {
    const left = this.evaluate(expr.left, env);
    const right = this.evaluate(expr.right, env);

    switch (expr.operator) {
      case "+":
        if (left instanceof XString || right instanceof XString) {
          const l = left instanceof XNull ? "null" : String(left.unbox());
          const r = right instanceof XNull ? "null" : String(right.unbox());
          return new XString(l + r);
        }
        return new XNumber(left.toNumber() + right.toNumber());
      case "-":
        return new XNumber(left.toNumber() - right.toNumber());
      case "*":
        return new XNumber(left.toNumber() * right.toNumber());
      case "/": {
        const r = right.toNumber();
        if (r === 0) throw new Error("Division by zero");
        return new XNumber(left.toNumber() / r);
      }
      case "%":
        return new XNumber(left.toNumber() % right.toNumber());
      case "==":
        return new XBool(this.isEqual(left, right));
      case "!=":
        return new XBool(!this.isEqual(left, right));
      case "<":
        return new XBool(left.toNumber() < right.toNumber());
      case ">":
        return new XBool(left.toNumber() > right.toNumber());
      case "<=":
        return new XBool(left.toNumber() <= right.toNumber());
      case ">=":
        return new XBool(left.toNumber() >= right.toNumber());
      case "&&":
        return left.isTruthy() ? right : left;
      case "||":
        return left.isTruthy() ? left : right;
      default:
        return XNull.instance;
    }
  }

  // 计算一元表达式
  private evaluateUnary(expr: UnaryExpression, env: Environment): Xvalue {
    const arg = this.evaluate(expr.argument, env);
    switch (expr.operator) {
      case "-":
        return new XNumber(-arg.toNumber());
      case "!":
        return new XBool(!arg.isTruthy());
      case "typeof":
        return new XString(arg.kind);
      default:
        return XNull.instance;
    }
  }

  // 计算赋值表达式并写回环境
  private evaluateAssignment(
    expr: AssignmentExpression,
    env: Environment,
  ): Xvalue {
    const value = this.evaluate(expr.value, env);

    if (expr.target.type === "Identifier") {
      const name = expr.target.name;
      switch (expr.operator) {
        case "=":
          if (env.has(name)) {
            env.set(name, value);
          } else {
            env.define(name, value);
          }
          return value;
        case "+=": {
          const cur = env.get(name);
          const result = this.applyAdd(cur, value);
          env.set(name, result);
          return result;
        }
        case "-=": {
          const cur = env.get(name);
          const result = new XNumber(cur.toNumber() - value.toNumber());
          env.set(name, result);
          return result;
        }
        case "*=": {
          const cur = env.get(name);
          const result = new XNumber(cur.toNumber() * value.toNumber());
          env.set(name, result);
          return result;
        }
        case "/=": {
          const cur = env.get(name);
          const result = new XNumber(cur.toNumber() / value.toNumber());
          env.set(name, result);
          return result;
        }
      }
    }

    if (expr.target.type === "MemberExpression") {
      const obj = this.evaluate(expr.target.object, env);
      if (obj instanceof XObject) {
        const resolved =
          expr.operator === "="
            ? value
            : this.applyCompoundOp(obj.get(expr.target.property), value, expr.operator);
        obj.set(expr.target.property, resolved);
        return resolved;
      }
      throw new Error("Cannot set property on non-object");
    }

    if (expr.target.type === "IndexExpression") {
      const obj = this.evaluate(expr.target.object, env);
      const idx = this.evaluate(expr.target.index, env);
      if (obj instanceof XArray && idx instanceof XNumber) {
        const resolved =
          expr.operator === "="
            ? value
            : this.applyCompoundOp(obj.get(idx.value), value, expr.operator);
        obj.set(idx.value, resolved);
        return resolved;
      }
      if (obj instanceof XObject && idx instanceof XString) {
        const resolved =
          expr.operator === "="
            ? value
            : this.applyCompoundOp(obj.get(idx.value), value, expr.operator);
        obj.set(idx.value, resolved);
        return resolved;
      }
      throw new Error("Invalid index assignment target");
    }

    throw new Error("Invalid assignment target");
  }

  // 计算复合赋值的结果
  private applyCompoundOp(cur: Xvalue, value: Xvalue, op: string): Xvalue {
    if (op === "+=") return this.applyAdd(cur, value);
    if (op === "-=") return new XNumber(cur.toNumber() - value.toNumber());
    if (op === "*=") return new XNumber(cur.toNumber() * value.toNumber());
    if (op === "/=") return new XNumber(cur.toNumber() / value.toNumber());
    return value;
  }

  // 计算加法（含字符串拼接）
  private applyAdd(left: Xvalue, right: Xvalue): Xvalue {
    if (left instanceof XString || right instanceof XString) {
      const l = left instanceof XNull ? "null" : String(left.unbox());
      const r = right instanceof XNull ? "null" : String(right.unbox());
      return new XString(l + r);
    }
    return new XNumber(left.toNumber() + right.toNumber());
  }

  // 计算函数调用
  private evaluateCall(expr: CallExpression, env: Environment): Xvalue {
    if (expr.callee.type === "Identifier") {
      const builtin = this.builtins.get(expr.callee.name);
      if (builtin) {
        return builtin.execute(expr.arguments, env, this);
      }
    }

    const callee = this.evaluate(expr.callee, env);
    if (!(callee instanceof XFunction)) {
      throw new Error("Not a function");
    }

    const args = expr.arguments.map((a: CallArgument) => {
      if (a.type === "NamedArgument") return this.evaluate(a.value, env);
      return this.evaluate(a, env);
    });
    const callEnv = new Environment(callee.closure);
    for (let i = 0; i < callee.params.length; i++) {
      callEnv.define(callee.params[i]!, args[i] ?? XNull.instance);
    }

    if (callee.isExpression) {
      return this.evaluate(callee.body as Expression, callEnv);
    }

    try {
      let lastValue: Xvalue = XNull.instance;
      for (const stmt of (callee.body as BlockStatement).body) {
        lastValue = this.executeStatement(stmt, callEnv);
      }
      return lastValue;
    } catch (e) {
      if (e instanceof ReturnSignal) return e.value;
      throw e;
    }
  }

  // 计算成员访问
  private evaluateMember(expr: MemberExpression, env: Environment): Xvalue {
    const obj = this.evaluate(expr.object, env);
    if (obj instanceof XObject) {
      return obj.get(expr.property);
    }
    if (obj instanceof XArray && expr.property === "length") {
      return new XNumber(obj.length);
    }
    return XNull.instance;
  }

  // 计算索引访问
  private evaluateIndex(expr: IndexExpression, env: Environment): Xvalue {
    const obj = this.evaluate(expr.object, env);
    const idx = this.evaluate(expr.index, env);
    if (obj instanceof XArray && idx instanceof XNumber) {
      return obj.get(idx.value);
    }
    if (obj instanceof XObject && idx instanceof XString) {
      return obj.get(idx.value);
    }
    return XNull.instance;
  }

  // 计算数组字面量
  private evaluateArray(expr: ArrayExpression, env: Environment): Xvalue {
    return new XArray(expr.elements.map((el: Expression) => this.evaluate(el, env)));
  }

  // 计算对象字面量
  private evaluateObject(expr: ObjectExpression, env: Environment): Xvalue {
    const entries: Record<string, Xvalue> = {};
    for (const prop of expr.properties) {
      entries[prop.key] = this.evaluate(prop.value, env);
    }
    return new XObject(entries);
  }

  // 计算箭头函数并生成闭包
  private evaluateArrowFunction(
    expr: ArrowFunctionExpression,
    env: Environment,
  ): Xvalue {
    return new XFunction(
      "<anonymous>",
      expr.params.map((p: Parameter) => p.name),
      expr.body,
      env,
    );
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  // 判断两个值是否相等
  private isEqual(a: Xvalue, b: Xvalue): boolean {
    if (a instanceof XNull && b instanceof XNull) return true;
    if (a.kind !== b.kind) return false;
    return a.unbox() === b.unbox();
  }
}
