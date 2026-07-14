import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Compose Tailwind class names.
 *
 * `clsx` flattens the arguments — strings, arrays, and `{ "class": condition }`
 * objects — dropping any that are falsy, so conditional classes can be written
 * inline without stray `undefined`/`false` leaking into the output. `twMerge`
 * then resolves conflicts by letting the last utility in a group win, so a base
 * class can be safely overridden by a caller (e.g. `cn("px-4", "px-6")` →
 * `"px-6"` rather than the invalid `"px-4 px-6"`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
