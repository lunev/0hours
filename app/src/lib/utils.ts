import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates minutes since midnight to validate silence intervals
 */
export const isQuietNow = (start: string, end: string) => {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();

  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);
  const s = sH * 60 + sM;
  const e = eH * 60 + eM;

  if (s < e) {
    // Standard interval (e.g., 10:00 AM - 6:00 PM)
    return current >= s && current < e;
  } else {
    // Overnight interval (e.g., 10:00 PM - 8:00 AM)
    return current >= s || current < e;
  }
};
