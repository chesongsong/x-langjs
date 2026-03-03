import { Xvalue } from "./base.js";

const NULL_SINGLETON = Symbol("XNull");

export class XNull extends Xvalue {
  static readonly instance = new XNull(NULL_SINGLETON);

  private constructor(_token: typeof NULL_SINGLETON) {
    super();
  }

  get kind(): string {
    return "null";
  }

  unbox(): null {
    return null;
  }

  toString(): string {
    return "null";
  }

  isTruthy(): boolean {
    return false;
  }
}
