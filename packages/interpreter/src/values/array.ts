import { Xvalue } from "./base.js";
import { XNull } from "./null.js";

export class XArray extends Xvalue {
  readonly elements: Xvalue[];

  constructor(elements: Xvalue[]) {
    super();
    this.elements = elements;
  }

  get kind(): string {
    return "array";
  }

  get length(): number {
    return this.elements.length;
  }

  get(index: number): Xvalue {
    return this.elements[index] ?? XNull.instance;
  }

  set(index: number, value: Xvalue): void {
    this.elements[index] = value;
  }

  unbox(): unknown[] {
    return this.elements.map((e) => e.unbox());
  }

  toString(): string {
    return `[${this.elements.map((e) => e.toString()).join(", ")}]`;
  }
}
