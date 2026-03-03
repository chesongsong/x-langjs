import { Xvalue } from "../values/base.js";

export abstract class XRenderable extends Xvalue {
  abstract get renderData(): unknown;

  unbox(): unknown {
    return this.renderData;
  }

  isTruthy(): boolean {
    return true;
  }
}
