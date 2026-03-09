import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Copy text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  }
}

/**
 * Format date for display.
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("es-GT", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Days remaining until end date.
 */
export function daysRemaining(endDate: Date | string | null): number {
  if (!endDate) return 0;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const diff = end.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Duration in days between two dates.
 */
export function daysBetween(
  start: Date | string | null,
  end: Date | string | null
): number {
  if (!start || !end) return 0;
  const s = typeof start === "string" ? new Date(start) : start;
  const e = typeof end === "string" ? new Date(end) : end;
  return Math.ceil(
    Math.abs(e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)
  );
}
