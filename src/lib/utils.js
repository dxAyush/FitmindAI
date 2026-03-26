import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Converts 'snake_case_value' → 'Snake Case Value' for select display
export function fmtVal(val) {
  if (!val || typeof val !== 'string') return val;
  return val.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
