export { Xvalue } from "./base.js";
export { XNumber } from "./number.js";
export { XString } from "./string.js";
export { XBool } from "./bool.js";
export { XNull } from "./null.js";
export { XArray } from "./array.js";
export { XObject } from "./object.js";
export { XFunction } from "./function.js";
export { XDate } from "./date.js";

import { Xvalue } from "./base.js";
import { XNumber } from "./number.js";
import { XString } from "./string.js";
import { XBool } from "./bool.js";
import { XNull } from "./null.js";
import { XArray } from "./array.js";
import { XObject } from "./object.js";
import { XDate } from "./date.js";

export function box(value: unknown): Xvalue {
  if (value === null || value === undefined) return XNull.instance;
  if (typeof value === "number") return new XNumber(value);
  if (typeof value === "string") return new XString(value);
  if (typeof value === "boolean") return new XBool(value);
  if (value instanceof Date) return new XDate(value);

  if (Array.isArray(value)) {
    return new XArray(value.map(box));
  }

  if (typeof value === "object") {
    const entries: Record<string, Xvalue> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      entries[k] = box(v);
    }
    return new XObject(entries);
  }

  return new XString(String(value));
}
