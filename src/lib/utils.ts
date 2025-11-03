import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function maskName(name: string, keep = 1) {
  const s = (name ?? "").trim();
  if (s.length <= keep * 2) return "Anonymous";
  const head = s.slice(0, keep);
  const tail = s.slice(-keep);
  return head + "•".repeat(Math.max(2, s.length - keep * 2)) + tail;
}
