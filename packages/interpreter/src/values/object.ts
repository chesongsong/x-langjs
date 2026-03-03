import { Xvalue } from "./base.js";
import { XNull } from "./null.js";

export class XObject extends Xvalue {
  readonly entries: Record<string, Xvalue>;

  constructor(entries: Record<string, Xvalue>) {
    super();
    this.entries = entries;
  }

  get kind(): string {
    return "object";
  }

  get(key: string): Xvalue {
    return this.entries[key] ?? XNull.instance;
  }

  set(key: string, value: Xvalue): void {
    this.entries[key] = value;
  }

  has(key: string): boolean {
    return key in this.entries;
  }

  unbox(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(this.entries)) {
      result[k] = v.unbox();
    }
    return result;
  }

  toString(): string {
    const entries = Object.entries(this.entries);
    if (entries.length === 0) return "{}";
    const inner = entries
      .map(([k, v]) => `${k}: ${v.toString()}`)
      .join(", ");
    return `{ ${inner} }`;
  }
}
