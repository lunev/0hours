import type { LanguageType } from "@/config";
import { clsx, type ClassValue } from "clsx";
import type { RefObject } from "react";
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

export const toggleTestSound = (
  isPlaying: boolean,
  setIsPlaying: (v: boolean) => void,
  bipRef: RefObject<HTMLAudioElement | null>,
  voiceRef: RefObject<HTMLAudioElement | null>,
  language: LanguageType,
  volume: number,
) => {
  if (isPlaying) {
    bipRef.current?.pause();
    if (bipRef.current) bipRef.current.currentTime = 0;

    voiceRef.current?.pause();
    if (voiceRef.current) voiceRef.current.currentTime = 0;

    setIsPlaying(false);
    return;
  }

  const hour = new Date().getHours();
  const displayHour = hour % 12 || 12;
  const filePath = `/audio/${language}/${displayHour}.mp3`;
  const bipPath = `/audio/bip.mp3`;

  bipRef.current = new Audio(bipPath);
  voiceRef.current = new Audio(filePath);

  bipRef.current.volume = volume / 100;
  voiceRef.current.volume = volume / 100;

  setIsPlaying(true);

  bipRef.current.play().catch(() => setIsPlaying(false));

  bipRef.current.onended = () => {
    voiceRef.current?.play().catch(() => setIsPlaying(false));
  };

  voiceRef.current.onended = () => {
    setIsPlaying(false);
  };
};
